import prisma from "../config/prismaClient";
import { format } from "date-fns";

const issueLoan = async (borrowerId: string, issuedById: string, data: any) => {
    await prisma.$transaction(async (tx) => {
        // 1️⃣ Fetch latest capital record
        const latestCapital = await tx.capitalTracking.findFirst({
            where: { userId: issuedById }, 
            orderBy: { date: "desc" },
        });


        if (!latestCapital) {
            throw new Error("No capital record found. Please initialize capital first.");
        }
        const upfrontDeductedAmount = Number(data.upfrontDeductedAmount);
        const principalAmount = Number(data.principalAmount);
        const idleCapital = Number(latestCapital.idleCapital);

        // 2️⃣ Compute new idle capital

        const newIdleCapital = idleCapital + upfrontDeductedAmount - principalAmount;   
        console.log(newIdleCapital, "newIdleCapital");
        // 🚨 Prevent lending if idle capital goes negative
        if (newIdleCapital < 0) {
            throw new Error("Insufficient idle capital to issue loan");
        }

        // 3️⃣ Create Loan
        const loan = await tx.loans.create({
            data: {
                borrowerId,
                issuedById,
                principalAmount: data.principalAmount,
                upfrontDeductedAmount: data.upfrontDeductedAmount,
                dueDate: null,
                dailyRepaymentAmount: data.dailyRepaymentAmount,
                pendingAmount: data.principalAmount,
                daysToRepay: data.daysToRepay,
                status: "Active",
                issuedAt: new Date(),
            },
        });

        // 4️⃣ Generate Repayment Schedule
        const repaymentRecords = generateRepaymentSchedule(
            loan.loanId,
            borrowerId,
            issuedById,
            data.principalAmount,
            data.daysToRepay,
            data.dailyRepaymentAmount
        );

        if (repaymentRecords.length === 0) {
            throw new Error("No repayment records generated. Check daysToRepay.");
        }

        // 5️⃣ Get last repayment date and update the loan's dueDate
        const lastRepaymentDate = repaymentRecords[repaymentRecords.length - 1].dueDate;

        // Insert Repayment Records
        await tx.repayments.createMany({ data: repaymentRecords });

        // Update the loan with the correct dueDate
        await tx.loans.update({
            where: { loanId: loan.loanId },
            data: { dueDate: lastRepaymentDate },
        });

        // 6️⃣ Dynamically Calculate Total Pending Loan Amount
        const pendingLoanAggregate = await tx.loans.aggregate({
            where: { issuedById: issuedById,status: { not: "Defaulted" } }, // Ensure only this user's loans are considered
            _sum: { pendingAmount: true },
        });


        const pendingLoanAmount = pendingLoanAggregate._sum.pendingAmount || 0;

        // 7️⃣ Calculate new total capital
        const newTotalCapital = (typeof pendingLoanAmount === "number" ? pendingLoanAmount : pendingLoanAmount.toNumber()) + newIdleCapital;

        // 8️⃣ Update capital tracking
        await tx.capitalTracking.create({
            data: {
                date: new Date(),
                totalCapital: newTotalCapital,
                userId: issuedById, 
                idleCapital: newIdleCapital,
                pendingLoanAmount: pendingLoanAmount,
                },
        });

        return loan;
    });
};


// Function to generate the correct repayment schedule
const generateRepaymentSchedule = (
    loanId: string,
    borrowerId: string,
    collectedBy: string,
    principalAmount: number,
    daysToRepay: string[],
    dailyRepaymentAmount: number
) => {
    const schedule: any[] = [];
    let remainingAmount = principalAmount;
    let currentDate = new Date();

    // Start from the next day
    currentDate.setDate(currentDate.getDate() + 1);

    // Calculate total repayment amount per week (6 days only)
    const totalWeeklyAmount = dailyRepaymentAmount * 6;

    // Number of valid repayment days per week
    const validDaysPerWeek = daysToRepay.length;

    // Amount to be paid on each valid repayment day
    const perDayRepaymentAmount = totalWeeklyAmount / validDaysPerWeek;

    while (remainingAmount > 0) {
        let dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

        // Only process if today is in `daysToRepay`
        if (daysToRepay.includes(dayName)) {
            let amountToPay = Math.min(perDayRepaymentAmount, remainingAmount); // Ensure no overpayment

            schedule.push({
                loanId,
                borrowerId,
                collectedBy,
                dueDate: new Date(currentDate),
                amountPaid: 0,
                amountToPay,
                status: "Unpaid",
                isPending: false,
            });

            remainingAmount -= amountToPay;
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedule;
};



const getFilteredLoans = async (filters: any) => {
    const {
        status,
        minPrincipalAmt,
        maxPrincipalAmt,
        minPendingAmt,
        maxPendingAmt,
        dueDate,
        daysToRepay // Array of days like ["Monday", "Tuesday", ...]
    } = filters;

    let whereClause: any = {}; // Dynamic filter object

    if (status) whereClause.status = status;

    if (minPrincipalAmt || maxPrincipalAmt) {
        whereClause.principalAmount = {};
        if (minPrincipalAmt) whereClause.principalAmount.gte = parseFloat(minPrincipalAmt);
        if (maxPrincipalAmt) whereClause.principalAmount.lte = parseFloat(maxPrincipalAmt);
    }

    if (minPendingAmt || maxPendingAmt) {
        whereClause.pendingAmount = {};
        if (minPendingAmt) whereClause.pendingAmount.gte = parseFloat(minPendingAmt);
        if (maxPendingAmt) whereClause.pendingAmount.lte = parseFloat(maxPendingAmt);
    }

    if (dueDate) whereClause.dueDate = { lte: new Date(dueDate) }; // Loans due before given date

    // Ensure all selected days are present in the loan's `daysToRepay`
    if (daysToRepay && Array.isArray(daysToRepay) && daysToRepay.length > 0) {
        whereClause.daysToRepay = { hasEvery: daysToRepay }; // Match loans containing ALL the selected days
    }

    // Fetch loans with borrower details
    const loans = await prisma.loans.findMany({
        where: whereClause,
        orderBy: { issuedAt: "desc" }, // Latest loans first
        select: {
            loanId: true,
            principalAmount: true,
            pendingAmount: true,
            issuedAt: true,
            status: true,
            dueDate: true,
            daysToRepay: true,
            borrower: {
                select: {
                    borrowerId: true,
                    name: true,
                    phoneNumber: true,
                    address: true,
                },
            }
        },
    });

    return loans;
};

const getLoanDetails = async (loanId: string) => {
  const loan = await prisma.loans.findUnique({
    where: { loanId },
    select: {
      loanId: true,
      principalAmount: true,
      pendingAmount: true,
      issuedAt: true,
      status: true,
      dueDate: true,
      daysToRepay: true,
      borrower: {
        select: {
          borrowerId: true,
          name: true,
          phoneNumber: true,
          address: true,
        },
      },
    },
  });

  if (!loan) throw new Error("Loan not found");

  const repayments = await prisma.repayments.findMany({
    where: { loanId },
    select: {
      dueDate: true,
      paidDate: true,
      status: true,
      amountPaid: true,
    },
  });

  const formatDate = (date: Date | null) => (date ? format(date, "yyyy-MM-dd") : null);

  // List of all enum statuses
  const statusList = [
    "Paid",
    "Unpaid",
    "Missed",
    "Paid_Late",
    "Paid_in_Advance",
    "Paid_Partial",
    "Paid_Partial_Late",
    "Paid_Partial_Advance",
  ];

  // Initialize details and stats
  const statusDetails: Record<
    string,
    { dueDate: string | null; paidDate: string | null; amountPaid: number }[]
  > = {};

  const repaymentStats: Record<string, number> = {
    totalRepayments: repayments.length,
  };

  for (const status of statusList) {
    statusDetails[status] = [];
    repaymentStats[status] = 0; // Initialize each count
  }

  // Process repayments
  for (const rep of repayments) {
    if (statusDetails[rep.status]) {
      statusDetails[rep.status].push({
        dueDate: formatDate(rep.dueDate),
        paidDate: formatDate(rep.paidDate),
        amountPaid: parseFloat(rep.amountPaid.toString()),
      });
      repaymentStats[rep.status]++;
    }
  }

  return {
    loan,
    repaymentStats,
    repaymentDates: statusDetails,
  };
};



const getLoanHistory = async (
    filterType: string = "week", 
    startDate?: string, 
    endDate?: string,
    minAmount?: string,
    maxAmount?: string
) => {
    const today = new Date();
    let fromDate: Date;
    let toDate: Date = today;
    // **Determine the time range based on filterType**
    switch (filterType) {
        case "24h":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 1); // Last 24 hours
            break;
        case "week":
            fromDate = new Date(today);
            fromDate.setDate(today.getDate() - 7); // Last week (DEFAULT)
            break;
        case "month":
            fromDate = new Date(today);
            fromDate.setMonth(today.getMonth() - 1); // Last month
            break;
        case "custom":
            if (!startDate || !endDate) throw new Error("Custom date range requires startDate and endDate.");
            fromDate = new Date(startDate);
            toDate = new Date(endDate);
            break;
        default:
            throw new Error("Invalid filter type. Use '24h', 'week', 'month', or 'custom'.");
    }


    // **Build the filter for amounts**
    let amountFilter: any = {};
    if (minAmount) {
        amountFilter.gte = Number(minAmount); // Greater than or equal to minAmount
    }
    if (maxAmount) {
        amountFilter.lte = Number(maxAmount); // Less than or equal to maxAmount
    }

    // **Fetch loan history from DB**
    const loanHistory = await prisma.loans.findMany({
        where: {
            issuedAt: {
                gte: fromDate,
                lte: toDate,
            },
            principalAmount: amountFilter, // Filter loans by amount
        },
        orderBy: { issuedAt: "desc" },
        select: {
            loanId: true,
            principalAmount: true,
            issuedAt: true,
            borrower: {
                select: {
                    borrowerId: true,
                    name: true,
                },
            },
        },
    });

    // **If no loans found**
    if (loanHistory.length === 0) {
        return [];
    }

    // **Return the loan history**
    return loanHistory;
};


 const findLoanById = async (loanId: string) => {
    return await prisma.loans.findUnique({ where: { loanId } });
};

const deleteLoan = async (loanId: string) => {
    await prisma.loans.delete({where: { loanId }});
}

const createExistingLoan = async (loanData: any) => {
    return await prisma.loans.create({
        data: loanData,
    });
};

//  Update pending amount for migrated loans
 const updatePendingAmount = async (loanId: string, newPendingAmount: number) => {
    return await prisma.loans.update({
        where: { loanId }, 
        data: { pendingAmount: newPendingAmount },
    });
};

// ✅ Fetch total pending loan amount for a user
 const getTotalPendingLoanAmount = async (userId: string) => {
    const pendingLoanAggregate = await prisma.loans.aggregate({
        where: { issuedById: userId,status: { not: "Defaulted" } },
        _sum: { pendingAmount: true },
    });

    return pendingLoanAggregate._sum.pendingAmount || 0;
};

// ✅ Create a new capital tracking entry
 const createCapitalTracking = async (userId: string, idleCapital: number, pendingLoanAmount: number) => {
    const totalCapital = idleCapital + pendingLoanAmount;

    return await prisma.capitalTracking.create({
        data: {
            userId,
            date: new Date(),
            totalCapital,
            idleCapital,
            pendingLoanAmount,
            
        },
    });
};

 const closeLoanDB = async (loanId: string, userId: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1️⃣ Fetch loan details
        const loan = await tx.loans.findUnique({
            where: { loanId, issuedById: userId },
            select: { pendingAmount: true, issuedById: true }
        });

        if (!loan) throw new Error("Loan not found");

        // 2️⃣ Determine new status
        const newStatus = loan.pendingAmount.toNumber() > 0 ? "Defaulted" : "Closed";

        // 3️⃣ Update Loan Status
        await tx.loans.update({
            where: { loanId },
            data: { status: newStatus },
        });

        // 4️⃣ Remove unpaid repayments for this loan
        await tx.repayments.deleteMany({
            where: { loanId, status: {in: ["Unpaid", "Missed"],} },
        });

        // 5️⃣ If the loan is **defaulted**, adjust capital tracking
        if (newStatus === "Defaulted") {
            const latestCapital = await tx.capitalTracking.findFirst({
                where: { userId },
                orderBy: { date: "desc" },
            });

            if (!latestCapital) throw new Error("Capital tracking record not found");

            const newPendingLoanAmount = Number(latestCapital.pendingLoanAmount) - Number(loan.pendingAmount);
            const newTotalCapital = latestCapital.idleCapital.plus(newPendingLoanAmount);

            await tx.capitalTracking.create({
                data: {
                    userId,
                    date: new Date(),
                    totalCapital: newTotalCapital,
                    idleCapital: latestCapital.idleCapital,
                    pendingLoanAmount: newPendingLoanAmount,
                    amountCollectedToday: 0,
                },
            });
        }

        return { message: `Loan closed as ${newStatus}` };
    });
};

const createMigratedLoanWithSchedule = async (loanData: any, repaymentRecords: any[]) => {
  return await prisma.$transaction(async (tx) => {
    const lastRepaymentDate = repaymentRecords[repaymentRecords.length - 1]?.dueDate;
    // 1️⃣ Create the loan
    const loan = await tx.loans.create({
      data: {
        ...loanData,
        dueDate: lastRepaymentDate, // ✅ Set due date dynamically
      },
    });


    // 2️⃣ Attach loanId to each repayment record
    const updatedRepaymentRecords = repaymentRecords.map((record) => ({
      ...record,
      loanId: loan.loanId,
    }));

    // 3️⃣ Bulk insert repayment schedule
    await tx.repayments.createMany({
      data: updatedRepaymentRecords,
    });


    return loan;
  });
};

const generateRepaymentScheduleForMigratedLoan = (
  borrowerId: string,
  collectedBy: string,
  pendingAmount: number,
  daysToRepay: string[],
  dailyRepaymentAmount: number
) => {
  const schedule: any[] = [];
  let remainingAmount = pendingAmount;

  let currentDate = new Date();

  // Loop until all pending amount is scheduled
  while (remainingAmount > 0) {
    const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

    if (daysToRepay.includes(dayName)) {
      const amountToPay = Math.min(dailyRepaymentAmount, remainingAmount);

      schedule.push({
        borrowerId,
        collectedBy,
        dueDate: new Date(currentDate),
        amountPaid: 0,
        amountToPay,
        status: "Unpaid",
        isPending: false,
      });

      remainingAmount -= amountToPay;
    }

    currentDate.setDate(currentDate.getDate() + 1); // Move to next day
  }

  return schedule;
};

export {deleteLoan,generateRepaymentScheduleForMigratedLoan, createMigratedLoanWithSchedule,closeLoanDB,issueLoan,getFilteredLoans,getLoanDetails,getLoanHistory ,findLoanById,updatePendingAmount,createExistingLoan,getTotalPendingLoanAmount,createCapitalTracking};

import prisma from "../config/prismaClient";

const issueLoan = async (borrowerId: string, issuedById: string, data: any) => {
    await prisma.$transaction(async (tx) => {
        // Create Loan with dueDate initially set to NULL
        const loan = await tx.loans.create({
            data: {
                borrowerId,
                issuedById,
                principalAmount: data.principalAmount,
                upfrontDeductedAmount: data.upfrontDeductedAmount, // Sent from frontend
                dueDate: null, // Initially NULL, will update after repayment schedule generation
                dailyRepaymentAmount: data.dailyRepaymentAmount,
                pendingAmount: data.principalAmount, // Initially same as principal
                daysToRepay: data.daysToRepay, // Received as an array from frontend
                status: "Active",
                issuedAt: new Date(),
            },
        });

        // Generate Repayment Schedule
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

        // Get last repayment date and update the loan's dueDate
        const lastRepaymentDate = repaymentRecords[repaymentRecords.length - 1].dueDate;

        // Insert Repayment Records
        await tx.repayments.createMany({
            data: repaymentRecords,
        });

        // Update the loan with the correct dueDate
        await tx.loans.update({
            where: { loanId: loan.loanId },
            data: { dueDate: lastRepaymentDate },
        });

        return loan; // Return loan details
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
    // Fetch loan details with borrower
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

    if (!loan) {
        throw new Error("Loan not found");
    }

    // Get repayment breakdown for the loan
    const repaymentCounts = await prisma.repayments.groupBy({
        by: ["status"],
        where: { loanId },
        _count: true,
    });

    const repaymentStats = {
        totalRepayments: repaymentCounts.reduce((sum, rep) => sum + rep._count, 0),
        paid: repaymentCounts.find((r) => r.status === "Paid")?._count || 0,
        unpaid: repaymentCounts.find((r) => r.status === "Unpaid")?._count || 0,
        missed: repaymentCounts.find((r) => r.status === "Missed")?._count || 0,
        paidLate: repaymentCounts.find((r) => r.status === "Paid_Late")?._count || 0,
        paidInAdvance: repaymentCounts.find((r) => r.status === "Paid_in_Advance")?._count || 0,
    };

    return {
        loan,
        repaymentStats,
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
        throw new Error("Loan not found");
    }

    // **Return the loan history**
    return loanHistory;
};



export { issueLoan,getFilteredLoans,getLoanDetails,getLoanHistory };

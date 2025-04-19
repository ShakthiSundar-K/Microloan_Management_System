import prisma from "../config/prismaClient";
import { Prisma } from "@prisma/client";

const recordPayment = async (
    borrowerId: string, 
    loanId: string, 
    amountPaid: number, 
    collectedById: string
) => {
    try{
     return await prisma.$transaction(async (tx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date

        const borrower = await tx.borrowers.findUnique({
            where: { borrowerId },
            select: { name: true },
        });

        if (!borrower) throw new Error("⚠️ Borrower not found.");
        let remainingAmount = amountPaid;
        let updates = [];

        // **1️⃣ Fetch repayments in correct order**
        const [unpaidToday, missedOrPending, futureRepayments] = await Promise.all([
            tx.repayments.findFirst({
                where: {
                    borrowerId,
                    loanId,
                    status: { in: ["Unpaid", "Paid_Partial"] },
                    dueDate: { gte: today, lt: new Date(today.getTime() + 86400000) }, // Only today's repayments
                },
                orderBy: { dueDate: "asc" },
            }),
            tx.repayments.findMany({
                where: {
                    borrowerId,
                    loanId,
                    OR: [
                        { status: "Missed" }, 
                        { status: "Paid_Partial_Late" }, 
                        { isPending: true }
                    ],
                },
                orderBy: { dueDate: "asc" },
            }),
            tx.repayments.findMany({
                where: {
                    borrowerId,
                    loanId,
                    OR: [
                        { status: "Unpaid" },
                        { status: "Paid_Partial_Advance" }
                    ],
                    dueDate: { gt: today },
                },
                orderBy: { dueDate: "asc" },
            }),
        ]);

        // **2️⃣ Step 1: Process Today's Unpaid Repayment First**
        if (unpaidToday && remainingAmount > 0) {
            console.log(`🟠 Processing today's repayment: ${unpaidToday.repaymentId}`);
            
            let alreadyPaid = unpaidToday.amountPaid.toNumber();
            let due = unpaidToday.amountToPay.toNumber() - alreadyPaid;
            let toPay = Math.min(remainingAmount, due);
            remainingAmount -= toPay;

            let totalPaid = alreadyPaid + toPay;
            let isFullyPaid = totalPaid >= unpaidToday.amountToPay.toNumber();

            // Updated status logic for today's payment
            let newStatus = isFullyPaid ? "Paid" : "Paid_Partial";
            let isPending = !isFullyPaid;

            console.log(`➡️ Updating repayment ${unpaidToday.repaymentId}: ${newStatus}, Amount Paid: ${toPay}`);

            updates.push(tx.repayments.update({
                where: { repaymentId: unpaidToday.repaymentId },
                data: {
                    amountPaid: totalPaid,
                    isPending,
                    paidDate: new Date(),
                    collectedBy: collectedById,
                    status: newStatus,
                },
            }));
        }

        // **3️⃣ Step 2: Process Missed/Pending Repayments**
        for (const repayment of missedOrPending) {
            if (remainingAmount <= 0) break;

            console.log(`🟠 Processing missed/pending repayment: ${repayment.repaymentId}`);

            let alreadyPaid = repayment.amountPaid.toNumber();
            let due = repayment.amountToPay.toNumber() - alreadyPaid;
            let toPay = Math.min(remainingAmount, due);
            remainingAmount -= toPay;

            let totalPaid = alreadyPaid + toPay;
            let isFullyPaid = totalPaid >= repayment.amountToPay.toNumber();

            // Updated status logic for past due payments
            let newStatus;
            if (isFullyPaid) {
                newStatus = repayment.dueDate < today ? "Paid_Late" : "Paid_in_Advance";
            } else {
                newStatus = repayment.dueDate < today ? "Paid_Partial_Late" : "Paid_Partial";
            }

            let isPending = !isFullyPaid;

            updates.push(tx.repayments.update({
                where: { repaymentId: repayment.repaymentId },
                data: {
                    amountPaid: totalPaid,
                    isPending,
                    paidDate: new Date(),
                    collectedBy: collectedById,
                    status: newStatus,
                },
            }));
        }

        // **4️⃣ Step 3: Process Future Repayments (Paid in Advance)**
        for (const repayment of futureRepayments) {
            if (remainingAmount <= 0) break;

            console.log(`🟠 Processing future repayment: ${repayment.repaymentId}`);

            let alreadyPaid = repayment.amountPaid.toNumber();
            let due = repayment.amountToPay.toNumber() - alreadyPaid;
            let toPay = Math.min(remainingAmount, due);
            remainingAmount -= toPay;

            let totalPaid = alreadyPaid + toPay;
            let isFullyPaid = totalPaid >= repayment.amountToPay.toNumber();

            // Updated status logic for future payments
            let newStatus = isFullyPaid ? "Paid_in_Advance" : "Paid_Partial_Advance";
            let isPending = !isFullyPaid;

            updates.push(tx.repayments.update({
                where: { repaymentId: repayment.repaymentId },
                data: {
                    amountPaid: totalPaid,
                    isPending,
                    paidDate: new Date(),
                    collectedBy: collectedById,
                    status: newStatus,
                },
            }));
        }

        // ❌ **Throw error if nothing was updated**
        if (!updates.length) {
            throw new Error("⚠️ No valid repayments to update for this amount.");
        }

        // **5️⃣ Update Loan Balance**
        await tx.$executeRaw`
        UPDATE "Loans"
        SET "pendingAmount" = "pendingAmount" - ${amountPaid}::numeric
        WHERE "loanId" = ${loanId}
        `;
        await tx.repaymentHistory.create({
            data: {
                borrowerId,
                name: borrower.name,
                amountPaid,
                paidDate: new Date(),
                
            },
        });

        await updateCapital(tx, collectedById, amountPaid);

        await Promise.all(updates);
    });
    }catch (err) {
      console.error("🔥 Error inside recordPayment:", (err as Error).message);
      throw err;
    }
    
};


const updateCapital = async (
  tx: Prisma.TransactionClient,
  userId: string,
  amountPaid: number
) => {
  // 1️⃣ Fetch latest capital entry
  const lastCapital = await tx.capitalTracking.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  if (!lastCapital) throw new Error("CapitalTracking record not found");

  // 2️⃣ Add collected amount to idleCapital
  const newIdleCapital = lastCapital.idleCapital.add(amountPaid);

  // 3️⃣ Subtract collected amount from pendingLoanAmount
  const newPendingLoanAmount = lastCapital.pendingLoanAmount.sub(amountPaid);

  // 4️⃣ Update the capital tracking record
  await tx.capitalTracking.update({
    where: { id: lastCapital.id },
    data: {
      idleCapital: newIdleCapital,
      pendingLoanAmount: newPendingLoanAmount,
    },
  });

   const updated = await tx.capitalTracking.findUnique({
    where: { id: lastCapital.id },
    select: {
      idleCapital: true,
      pendingLoanAmount: true,
      totalCapital: true,
    },
  });

  if (!updated) {
    throw new Error("Updated capital tracking record not found.");
  }
  const expectedTotal = updated.idleCapital.add(updated.pendingLoanAmount);

  if (!expectedTotal.equals(updated.totalCapital)) {
    throw new Error(
      `💥 Capital mismatch! idle + pending = ${expectedTotal.toString()}, but totalCapital = ${updated.totalCapital.toString()}`
    );
  }
};




const updateAmtCollectedToday = async (tx: Prisma.TransactionClient, today: Date, id: string) => {
    // Get today's collected amount
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const { _sum } = await tx.repaymentHistory.aggregate({
        where: { paidDate: {
        gte: startOfDay,
        lte: endOfDay,
    }, },
        _sum: { amountPaid: true },
    });
    const dailyCollectedAmount = _sum.amountPaid || 0;
    if (dailyCollectedAmount === 0) return; // No update needed

    // Fetch latest capital entry
    const lastCapital = await tx.capitalTracking.findFirst({
        where: { userId: id }, // Filter by the specific user
        orderBy: { date: "desc" }, // Get the latest record for this user
    });
    if (!lastCapital) {
        throw new Error("CapitalTracking record not found.");
    }

    await tx.capitalTracking.update({
    where: { id: lastCapital.id },
    data: {
        amountCollectedToday:dailyCollectedAmount
  },
});

};

const finishPaymentsForTheDay = async (collectorId: string) => {
  return await prisma.$transaction(async (tx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const alreadyClosed = await tx.paymentDayLog.findFirst({
    where: {
        userId: collectorId,
        date: {
        gte: startOfToday,
        lte: endOfToday,
        },
    },
    });
    // console.log(alreadyClosed)
    if (alreadyClosed) {
      throw new Error("Payments have already been closed for today.");
    }

    // 2️⃣ Update Idle Capital
    await updateAmtCollectedToday(tx, today, collectorId);

    // 3️⃣ Mark overdue repayments as "Missed"
    const overdueRepayments = await tx.repayments.findMany({
      where: {
        dueDate: { lte: today },
        status: "Unpaid",
        collectedBy: collectorId,
      },
    });

    if (overdueRepayments.length > 0) {
      const updates = overdueRepayments.map((repayment) =>
        tx.repayments.update({
          where: { repaymentId: repayment.repaymentId },
          data: { status: "Missed", isPending: true },
        })
      );
      await Promise.all(updates);
    }

    // 4️⃣ Log this closing action to prevent duplicates
    await tx.paymentDayLog.create({
      data: {
        userId: collectorId,
        date: startOfToday,
      },
    });

    console.log("✅ Payments successfully closed for today.");
  });
};


const getTodayRepayments = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time

    // 🔹 Step 1: Get today's scheduled repayments
    const todayRepayments = await prisma.repayments.findMany({
        where: {
            dueDate: {
                gte: today,
                lt: new Date(today.getTime() + 86400000) // End of today
            },
            status: "Unpaid"
        },
        select: {
            loanId: true,
            borrowerId: true,
            amountToPay: true,
            dueDate: true,
            status: true,
            loan: {
                select: {
                    pendingAmount: true,
                    dueDate: true,
                }
            },
            borrower: {
                select: {
                    name: true,
                    phoneNumber: true,
                    address: true
                }
            }
        }
    });

    // 🔹 Step 2: Fetch loans that still have pending amounts (Overdue loans)
    const overdueLoans = await prisma.loans.findMany({
        where: {
            status: "Active",
            pendingAmount: { gt: 0 }, // Loan still has pending amount
            dueDate: { lt: today } // Loan's due date has passed
        },
        select: {
            loanId: true,
            borrowerId: true,
            pendingAmount: true,
            dueDate: true,
            borrower: {
                select: {
                    name: true,
                    phoneNumber: true,
                    address: true
                }
            }
        }
    });

    // 🔹 Step 3: Fetch the earliest missed repayment for each overdue loan
    const overdueRepayments = await Promise.all(overdueLoans.map(async (loan) => {
        const earliestMissedRepayment = await prisma.repayments.findFirst({
            where: {
                loanId: loan.loanId,
                status: "Missed"
            },
            orderBy: { dueDate: "asc" } // Get the earliest missed repayment
        });

        return {
            loanId: loan.loanId,
            borrowerId: loan.borrowerId,
            amountToPay: loan.pendingAmount, // Since no scheduled repayment, show full pending amount
            dueDate: earliestMissedRepayment ? earliestMissedRepayment.dueDate : loan.dueDate, // Use earliest missed date or loan's due date
            status: "Overdue",
            borrower: loan.borrower
        };
    }));

    // 🔹 Step 4: Merge results (remove duplicates)
    const allRepayments = [...todayRepayments, ...overdueRepayments];

    return allRepayments;
};


const getTodayCollectionStatus = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the start of the day

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Set to the next day (for the "end of today" boundary)

    // Get Amount Collected Today
    const amountCollectedToday = await prisma.repaymentHistory.aggregate({
        where: {
            paidDate: {
                gte: today,
                lt: tomorrow, // Only today
            },
        },
        _sum: {
            amountPaid: true,
        },
    });

    // Get Amount Supposed to be Collected Today
    const amountSupposedToBeCollectedToday = await prisma.repayments.aggregate({
        where: {
            dueDate: {
                gte: today,
                lt: tomorrow, // Only today
            },
        },
        _sum: {
            amountToPay: true,
        },
    });

    // Return the data
    return {
        amountCollectedToday: amountCollectedToday._sum.amountPaid || 0,
        amountSupposedToBeCollectedToday: amountSupposedToBeCollectedToday._sum.amountToPay || 0,
    };
};


export { recordPayment , finishPaymentsForTheDay,getTodayRepayments,getTodayCollectionStatus};

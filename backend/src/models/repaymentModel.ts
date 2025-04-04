import prisma from "../config/prismaClient";
import { Prisma } from "@prisma/client";

const recordPayment = async (
    borrowerId: string, 
    loanId: string, 
    amountPaid: number, 
    collectedById: string
) => {
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

        console.log("🔍 Fetching repayments...");

        // **1️⃣ Fetch repayments in correct order**
        const [unpaidToday, missedOrPending, futureRepayments] = await Promise.all([
            tx.repayments.findFirst({
                where: {
                    borrowerId,
                    loanId,
                    status: "Unpaid",
                    dueDate: { gte: today, lt: new Date(today.getTime() + 86400000) }, // Only today's repayments
                },
                orderBy: { dueDate: "asc" },
            }),
            tx.repayments.findMany({
                where: {
                    borrowerId,
                    loanId,
                    OR: [{ status: "Missed" }, { isPending: true }],
                },
                orderBy: { dueDate: "asc" },
            }),
            tx.repayments.findMany({
                where: {
                    borrowerId,
                    loanId,
                    status: "Unpaid",
                    dueDate: { gt: today },
                },
                orderBy: { dueDate: "asc" },
            }),
        ]);

        console.log("🔍 Today's Unpaid Repayment:", unpaidToday);
        console.log("🔍 Missed/Pending Repayments:", missedOrPending);

        // **2️⃣ Step 1: Process Today's Unpaid Repayment First**
        if (unpaidToday && remainingAmount > 0) {
            console.log(`🟠 Processing today's repayment: ${unpaidToday.repaymentId}`);
            
            let alreadyPaid = unpaidToday.amountPaid.toNumber();
            let due = unpaidToday.amountToPay.toNumber() - alreadyPaid;
            let toPay = Math.min(remainingAmount, due);
            remainingAmount -= toPay;

            let totalPaid = alreadyPaid + toPay;
            let isFullyPaid = totalPaid >= unpaidToday.amountToPay.toNumber();

            let newStatus = isFullyPaid ? "Paid" : "Unpaid";
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

            // 🔹 **Compare DueDate with Today**
            let newStatus;
            if (isFullyPaid) {
                newStatus = repayment.dueDate < today ? "Paid_Late" : "Paid_in_Advance";
            } else {
                newStatus = repayment.dueDate < today ? "Missed" : "Unpaid";
            }

            let isPending = !isFullyPaid;

            console.log(`➡️ Updating repayment ${repayment.repaymentId}: ${newStatus}, Amount Paid: ${toPay}`);

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

            let newStatus = isFullyPaid ? "Paid_in_Advance" : "Unpaid";
            let isPending = !isFullyPaid;

            console.log(`➡️ Updating repayment ${repayment.repaymentId}: ${newStatus}, Amount Paid: ${toPay}`);

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
        console.log("🔄 Updating Loan Balance...");
        await tx.$executeRaw`UPDATE "Loans" SET "pendingAmount" = "pendingAmount" - ${amountPaid} WHERE "loanId" = ${loanId}`;

        await tx.repaymentHistory.create({
            data: {
                borrowerId,
                name: borrower.name,
                amountPaid,
                paidDate: new Date(),
                
            },
        });

        await Promise.all(updates);
    });
};



const updateIdleCapital = async (tx: Prisma.TransactionClient, today: Date) => {
    // Get today's collected amount
    const { _sum } = await tx.repaymentHistory.aggregate({
        where: { paidDate: today },
        _sum: { amountPaid: true },
    });

    const dailyCollectedAmount = _sum.amountPaid || 0;

    if (dailyCollectedAmount === 0) return; // No update needed

    // Fetch latest capital entry
    const lastCapital = await tx.capitalTracking.findFirst({
        where: { userId: req.user.id }, // Filter by the specific user
        orderBy: { date: "desc" }, // Get the latest record for this user
    });

    if (!lastCapital) {
        throw new Error("CapitalTracking record not found.");
    }

    // Update idle capital
    const newIdleCapital = lastCapital.idleCapital.add(dailyCollectedAmount);

    await tx.capitalTracking.update({
        where: { id: lastCapital.id },
        data: { idleCapital: newIdleCapital },
    });
};

const finishPaymentsForTheDay = async (collectorId: string) => {
    return await prisma.$transaction(async (tx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        // ✅ Step 1: Update Idle Capital
        await updateIdleCapital(tx, today);

        // ✅ Step 2: Mark overdue repayments as "Missed"
        const overdueRepayments = await tx.repayments.findMany({
            where: {
                dueDate: { lte: today },
                status: "Unpaid",
                collectedBy: collectorId,
            },
        });

        if (overdueRepayments.length === 0) return; // No updates needed

        let updates = overdueRepayments.map((repayment) =>
            tx.repayments.update({
                where: { repaymentId: repayment.repaymentId },
                data: { status: "Missed", isPending: true },
            })
        );

        await Promise.all(updates);
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

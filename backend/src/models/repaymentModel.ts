import prisma from "../config/prismaClient";

const recordPayment = async (
    borrowerId: string, 
    loanId: string, 
    amountPaid: number, 
    collectedById: string
) => {
    return await prisma.$transaction(async (tx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date

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

        await Promise.all(updates);
    });
};











const finishPaymentsForTheDay = async (collectorId: string) => {
    return await prisma.$transaction(async (tx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        // Find all repayments due today that are still "Unpaid" and collected by this collector
        const overdueRepayments = await tx.repayments.findMany({
            where: {
                dueDate: { lte: today },
                status: "Unpaid",
                collectedBy: collectorId, // Ensure only this collector's payments are processed
            },
        });

        if (overdueRepayments.length === 0) {
            return; // No updates needed
        }

        let updates = overdueRepayments.map((repayment) =>
            tx.repayments.update({
                where: { repaymentId: repayment.repaymentId },
                data: {
                    status: "Missed",
                    isPending: true,
                },
            })
        );

        await Promise.all(updates);
    });
};


export { recordPayment , finishPaymentsForTheDay};

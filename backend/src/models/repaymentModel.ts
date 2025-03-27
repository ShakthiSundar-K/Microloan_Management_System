import prisma from "../config/prismaClient";

const recordPayment = async (borrowerId: string, loanId: string, amountPaid: number, collectedById: string) => {
    return await prisma.$transaction(async (tx) => {
        //  Fetch all **unpaid** (Missed or Unpaid) repayments, sorted by due date
        const pendingRepayments = await tx.repayments.findMany({
            where: {
                borrowerId,
                loanId,
                status: { in: ["Unpaid", "Missed"] }, // Covers both missed & unpaid
            },
            orderBy: { dueDate: "asc" }, // Settle the oldest dues first
        });

        if (!pendingRepayments.length) {
            throw new Error("No pending repayments found for this borrower.");
        }

        let remainingAmount = amountPaid;
        let updates = [];

        for (let repayment of pendingRepayments) {
            if (remainingAmount <= 0) break; // Stop if we’ve exhausted the payment

            let dueAmount = repayment.amountToPay.toNumber() - repayment.amountPaid.toNumber();
            let amountToSettle = Math.min(dueAmount, remainingAmount);
            remainingAmount -= amountToSettle;

            updates.push(tx.repayments.update({
                where: { repaymentId: repayment.repaymentId },
                data: {
                    amountPaid: repayment.amountPaid.toNumber() + amountToSettle,
                    isPending:  repayment.amountPaid.toNumber() + amountToSettle < repayment.amountToPay.toNumber(), // If extra amount is pending, keep it pending
                    paidDate: new Date(),
                    collectedBy: collectedById,
                    status: repayment.status === "Missed" ? "Missed" : "Paid", // Keep Missed for history, Paid for on-time payments
                },
            }));
        }

        if (!updates.length) {
            throw new Error("Payment amount does not match any pending repayments.");
        }

        await tx.$executeRaw`UPDATE "Loans" SET "pendingAmount" = "pendingAmount" - ${amountPaid} WHERE "loanId" = ${loanId}`;

        await Promise.all(updates); // Execute all updates
    });
};

export { recordPayment };

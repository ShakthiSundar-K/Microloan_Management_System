import prisma from "../config/prismaClient";

const recordPayment = async (borrowerId: string, loanId: string, amountPaid: number, collectedById: string) => {
    return await prisma.$transaction(async (tx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of the day (ignore time)

       

        let remainingAmount = amountPaid;
        let updates = [];

        // **Step 1: Process PENDING repayments first**
        const pendingRepayments = await tx.repayments.findMany({
            where: { borrowerId, loanId, isPending: true },
            orderBy: { dueDate: "asc" },
        });


        for (let repayment of pendingRepayments) {
            if (remainingAmount <= 0) break;

            let dueAmount = repayment.amountToPay.toNumber() - repayment.amountPaid.toNumber();
            let amountToSettle = Math.min(dueAmount, remainingAmount);
            remainingAmount -= amountToSettle;

            let newTotalPaid = repayment.amountPaid.toNumber() + amountToSettle;
            let wasMissed = repayment.status === "Missed";
            let isFullyPaid = newTotalPaid >= repayment.amountToPay.toNumber();

            //  Compare only the date part of `dueDate`
            let dueDateOnly = new Date(repayment.dueDate).setHours(0, 0, 0, 0);
            let paidDateOnly = today.getTime(); // `today` is normalized to 00:00:00

            let isLatePayment = paidDateOnly > dueDateOnly;
            let isFuturePayment = paidDateOnly < dueDateOnly;

            let newStatus = isFullyPaid
                ? isFuturePayment
                    ? "Paid_in_Advance"
                    : isLatePayment
                    ? "Paid_Late"
                    : "Paid"
                : "Unpaid";

        

            updates.push(tx.repayments.update({
                where: { repaymentId: repayment.repaymentId },
                data: {
                    amountPaid: newTotalPaid,
                    isPending: !isFullyPaid,
                    paidDate: new Date(),
                    collectedBy: collectedById,
                    status: newStatus,
                },
            }));
        }

        // **Step 2: If all pending payments are cleared, process "Unpaid" repayments**
        if (remainingAmount > 0) {
            const unpaidRepayments = await tx.repayments.findMany({
                where: { borrowerId, loanId, status: "Unpaid" },
                orderBy: { dueDate: "asc" },
            });


            for (let repayment of unpaidRepayments) {
                if (remainingAmount <= 0) break;

                let dueAmount = repayment.amountToPay.toNumber() - repayment.amountPaid.toNumber();
                let amountToSettle = Math.min(dueAmount, remainingAmount);
                remainingAmount -= amountToSettle;

                let newTotalPaid = repayment.amountPaid.toNumber() + amountToSettle;
                let isFullyPaid = newTotalPaid >= repayment.amountToPay.toNumber();

                //  Compare only the date part of `dueDate`
                let dueDateOnly = new Date(repayment.dueDate).setHours(0, 0, 0, 0);
                let paidDateOnly = today.getTime(); // `today` is normalized

                let isLatePayment = paidDateOnly > dueDateOnly;
                let isFuturePayment = paidDateOnly < dueDateOnly;

                let newStatus = isFullyPaid
                    ? isFuturePayment
                        ? "Paid_in_Advance"
                        : isLatePayment
                        ? "Paid_Late"
                        : "Paid"
                    : "Unpaid";


                updates.push(tx.repayments.update({
                    where: { repaymentId: repayment.repaymentId },
                    data: {
                        amountPaid: newTotalPaid,
                        isPending: !isFullyPaid,
                        paidDate: new Date(),
                        collectedBy: collectedById,
                        status: newStatus,
                    },
                }));
            }
        }

        // **Step 3: If no updates happened, throw an error**
        if (!updates.length) {
            throw new Error("⚠️ Payment amount does not match any pending repayments.");
        }

        // **Step 4: Update Loan Balance**
        await tx.$executeRaw`UPDATE "Loans" SET "pendingAmount" = "pendingAmount" - ${amountPaid} WHERE "loanId" = ${loanId}`;

        await Promise.all(updates); // Execute all updates
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

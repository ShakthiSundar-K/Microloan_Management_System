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







export { issueLoan };

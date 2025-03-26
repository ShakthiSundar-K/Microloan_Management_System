import prisma from "../config/prismaClient";

const issueLoan = async (borrowerId: string, issuedById: string, data: any) => {
     await prisma.$transaction(async (tx) => {
        // Create Loan
        const loan = await tx.loans.create({
            data: {
                borrowerId,
                issuedById,
                principalAmount: data.principalAmount,
                upfrontDeductedAmount: data.upfrontDeductedAmount, // Sent from frontend
                repaymentPeriodDays: data.repaymentPeriodDays,
                dueDate: data.dueDate,
                dailyRepaymentAmount: data.dailyRepaymentAmount,
                pendingAmount: data.principalAmount, // Initially same as principal
                daysToRepay: data.daysToRepay, // Received as an array from frontend
                status: data.status,
            },
        });

        // Precompute Repayment Schedule
        const repaymentRecords = generateRepaymentSchedule(
            loan.loanId, 
            borrowerId, 
            issuedById, 
            data.repaymentPeriodDays, 
            data.daysToRepay,
            data.dailyRepaymentAmount
        );
        console.log("Repayment Records:", repaymentRecords); 

        if (repaymentRecords.length === 0) {
            throw new Error("No repayment records generated. Check daysToRepay.");
        }

        //  Insert Repayment Records
       
        await tx.repayments.createMany({
            data: repaymentRecords,
        });


        return loan; // Return loan details
    });
};

// Function to generate repayment schedule based on `daysToRepay`
const generateRepaymentSchedule = (
    loanId: string,
    borrowerId: string,
    collectedBy: string,
    repaymentDays: number,
    daysToRepay: string[],
    dailyRepaymentAmount: number
) => {
    const schedule: any[] = [];
   

    let currentDate = new Date();
    for (let i = 0; i < repaymentDays; i++) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });

        // Check if today is a repayment day
        if (daysToRepay.includes(dayName)) {
            schedule.push({
                loanId,
                borrowerId,
                collectedBy,
                dueDate: new Date(currentDate), // Due date for this repayment
                amountPaid: 0, // Initially 0
                amountToPay: dailyRepaymentAmount,
                status: "Unpaid", // Starts as Unpaid
                isPending: false, // No pending at the start
            });
        }
    }
    return schedule;
};

export { issueLoan };

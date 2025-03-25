import prisma from "../config/prismaClient";

const issueLoan = async (borrowerId:string,issuedById:string,data:any)=>{
    await prisma.loans.create(
        {
            data:{
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
            }
        }
    );
};

export {issueLoan};
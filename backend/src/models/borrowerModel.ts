import prisma from "../config/prismaClient";
import bcrypt from "bcryptjs";

//create a new borrower profile
const createBorrower = async (name:string ,phoneNumber:string,address:string) => {
    const password = "123456"
    const passwordHash = await bcrypt.hash(password,10);
    return await prisma.borrowers.create({
        data:{
            name,
            phoneNumber,
            passwordHash,
            address
        },
    });
}

const getAllBorrowers = async () => {
    return await prisma.borrowers.findMany();
}

const getBorrowerByName = async (name:string) => { 
    return await prisma.borrowers.findMany({where:{name}});
}

const getBorrowerByPhoneNumber = async (phoneNumber:string) => {
    return await prisma.borrowers.findUnique({where:{phoneNumber}});
}
const getBorrowerById = async (borrowerId:string) => {
    return await prisma.borrowers.findUnique({where:{borrowerId}});
}

const updateBorrowerPassword = async (borrowerId:string,password:string) => {
    const passwordHash = await bcrypt.hash(password,10);
    return await prisma.borrowers.update({
        where:{borrowerId},
        data:{passwordHash},
    });
}

const deleteBorrower = async (borrowerId:string) => {
  try{
    return await prisma.borrowers.delete({where:{borrowerId}});
  }catch(error){
    console.log(error);
    throw new Error("Failed to delete borrower");}
}



 const searchBorrowers = async (query: string) => {
    return await prisma.borrowers.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } }, // Case-insensitive name search
                { phoneNumber: { contains: query } }, // Partial phone number search
            ],
        },
        select: {
            borrowerId: true,
            name: true,
            phoneNumber: true,
        },
    });
};

const getBorrowerDetails = async (borrowerId: string) => {
  // Fetch borrower details
  const borrower = await prisma.borrowers.findUnique({
    where: { borrowerId },
    select: {
      borrowerId: true,
      name: true,
      phoneNumber: true,
      address: true,
      createdAt: true,
    },
  });

  if (!borrower) {
    throw new Error("Borrower not found");
  }

  // Count total, active, closed, and defaulted loans
  const loanCounts = await prisma.loans.groupBy({
    by: ["status"],
    where: { borrowerId },
    _count: true,
  });

  const loanStats = {
    totalLoans: loanCounts.reduce((sum, loan) => sum + loan._count, 0),
    activeLoans: loanCounts.find((l) => l.status === "Active")?._count || 0,
    closedLoans: loanCounts.find((l) => l.status === "Closed")?._count || 0,
    defaultedLoans: loanCounts.find((l) => l.status === "Defaulted")?._count || 0,
  };

  // Get all active loans
  const activeLoans = await prisma.loans.findMany({
    where: { borrowerId, status: "Active" },
    orderBy: { issuedAt: "desc" },
    select: {
      loanId: true,
      principalAmount: true,
      pendingAmount: true,
      dailyRepaymentAmount: true,
    },
  });

  // Get all closed loans
  const closedLoans = await prisma.loans.findMany({
    where: { borrowerId, status: "Closed" },
    orderBy: { issuedAt: "desc" },
    select: {
      loanId: true,
      principalAmount: true,
      pendingAmount: true,
      dailyRepaymentAmount: true,
    },
  });

  // Get all defaulted loans
  const defaultedLoans = await prisma.loans.findMany({
    where: { borrowerId, status: "Defaulted" },
    orderBy: { issuedAt: "desc" },
    select: {
      loanId: true,
      principalAmount: true,
      pendingAmount: true,
      dailyRepaymentAmount: true,
    },
  });

  // Fetch repayment stats for each active loan
  const loansWithRepaymentStats = await Promise.all(
    activeLoans.map(async (loan) => {
      const repaymentCounts = await prisma.repayments.groupBy({
        by: ["status"],
        where: { loanId: loan.loanId },
        _count: true,
      });

      return {
        ...loan,
        repaymentStats: {
          totalRepayments: repaymentCounts.reduce((sum, rep) => sum + rep._count, 0),
          paid: repaymentCounts.find((r) => r.status === "Paid")?._count || 0,
          unpaid: repaymentCounts.find((r) => r.status === "Unpaid")?._count || 0,
          missed: repaymentCounts.find((r) => r.status === "Missed")?._count || 0,
          paidLate: repaymentCounts.find((r) => r.status === "Paid_Late")?._count || 0,
          paidInAdvance: repaymentCounts.find((r) => r.status === "Paid_in_Advance")?._count || 0,
          paidPartialLate: repaymentCounts.find((r) => r.status === "Paid_Partial_Late")?._count || 0,
          paidPartialAdvance: repaymentCounts.find((r) => r.status === "Paid_Partial_Advance")?._count || 0,
          paidPartial: repaymentCounts.find((r) => r.status === "Paid_Partial")?._count || 0,
        },
      };
    })
  );

  return {
    borrower,
    loanStats,
    activeLoans: loansWithRepaymentStats,
    closedLoans,
    defaultedLoans,
  };
};


export {
    createBorrower,
    getAllBorrowers,
    getBorrowerByName,
    getBorrowerByPhoneNumber,
    getBorrowerById,
    updateBorrowerPassword,
    deleteBorrower,
    searchBorrowers,
    getBorrowerDetails
}
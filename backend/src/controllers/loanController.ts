import { Request, Response } from "express";
import {deleteLoan, createMigratedLoanWithSchedule,generateRepaymentScheduleForMigratedLoan,closeLoanDB,issueLoan,getFilteredLoans,getLoanDetails,getLoanHistory ,findLoanById, updatePendingAmount,createExistingLoan,getTotalPendingLoanAmount, createCapitalTracking} from "../models/loanModel";

const isLender = (req: Request, res: Response): boolean => {
    if (req.user?.role !== "LENDER") {
        res.status(403).json({ message: "You do not have access to perform this operation" });
        return false;
    }
    return true;
};

const issueLoanController = async (req: Request, res: Response):Promise<Response|void> => {
    if (!isLender(req, res)) return;
    try {
        // Check if the user has the "LENDER" role
        if (req.user.role !== "LENDER") {
            return res.status(403).json({ message: "You don't have access to issue loans" });
        }

        const { borrowerId } = req.params;
        const { id } = req.user;
        await issueLoan(borrowerId, id, req.body);

        res.status(200).json({ message: "Loan issued successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to issue loan", error: (error as Error).message });
    }
};

 const filterLoans = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    try {
        const filters = req.query; 
        const loans = await getFilteredLoans(filters);
        res.json({ message: "Loans fetched successfully", data: loans });
    } catch (error) {
        res.status(500).json({ message: "Error fetching loans", error: (error as Error).message });
    }
};

 const fetchLoanDetails = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    try {
        const { loanId } = req.params;
        if (!loanId) {
            return res.status(400).json({ error: "Valid loanId is required" });
        }

        const loanDetails = await getLoanDetails(loanId as string);
        res.status(200).json({ message: "Loan details fetched successfully", data: loanDetails });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching loan details", error: (error as Error).message });
    }
};


const fetchLoanHistory = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    try {
        const { filterType, startDate, endDate, minAmount, maxAmount } = req.query;
        // Fetch the loan history
        const history = await getLoanHistory(
            filterType as string || "week", 
            startDate as string, 
            endDate as string, 
            minAmount as string, 
            maxAmount as string
        );

        // Return the loan history
        res.json({ message: "Loan history fetched successfully", data: history });
    } catch (error) {
        console.log("Error in fetchLoanHistory", error); // Log the error
        res.status(500).json({ message: "Failed to fetch loan history", error: (error as Error) });
    }
};

const registerExistingLoan = async (req: Request, res: Response) => {
if (!isLender(req, res)) return;
  const {
    principalAmount,
    pendingAmount,
    dailyRepaymentAmount,
    upfrontDeductedAmount,
    issuedAt,
    daysToRepay, // e.g., ["Monday", "Tuesday", "Wednesday"]
  } = req.body;

  const { borrowerId } = req.params;
  const issuedById = req.user.id;

  if (principalAmount <= 0 || pendingAmount < 0) {
    return res.status(400).json({ error: "Invalid loan or pending amount." });
  }

  try {
    const loanData = {
      borrowerId,
      issuedById,
      principalAmount,
      upfrontDeductedAmount,
      pendingAmount,
      dailyRepaymentAmount,
      dueDate: null,
      daysToRepay,
      status: "Active",
      issuedAt: new Date(issuedAt),
      isMigrated: true,
    };

    const repaymentRecords = generateRepaymentScheduleForMigratedLoan(
      borrowerId,
      issuedById,
      pendingAmount,
      daysToRepay,
      dailyRepaymentAmount
    );

    if (repaymentRecords.length === 0) {
      return res.status(400).json({ error: "Could not generate repayment schedule." });
    }

    const loan = await createMigratedLoanWithSchedule(loanData, repaymentRecords);

    return res.status(201).json({ message: "Migrated loan registered", loan });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to register migrated loan" });
  }
};

const updatePendingAmountController = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    try {
        const { loanId } = req.params;
        const { newPendingAmount } = req.body;
        const userId = req.user.id; // Lender's ID (from authentication middleware)

        // 1️⃣ Fetch loan and check if it's migrated
        const loan = await findLoanById(loanId);

        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        if (!loan.isMigrated) {
            return res.status(400).json({ error: "Only migrated loans can be updated manually" });
        }

        if (loan.issuedById !== userId) {
            return res.status(403).json({ error: "Unauthorized to update this loan" });
        }

        // 2️⃣ Update pending amount
        await updatePendingAmount(loanId, newPendingAmount);

        res.status(200).json({ message: "Pending amount updated successfully" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

const initializeCapital = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    const { idleCapital } = req.body;
    const userId = req.user.id;

    if (idleCapital < 0) {
        return res.status(400).json({ error: "Idle capital cannot be negative." });
    }

    try {
        // 🏦 Calculate total pending loan amount dynamically
        const pendingLoanAmount = await getTotalPendingLoanAmount(userId);

        // 🔄 Create new capital entry
        const capital = await createCapitalTracking(userId, idleCapital, typeof pendingLoanAmount === "object" && "toNumber" in pendingLoanAmount ? pendingLoanAmount.toNumber() : pendingLoanAmount);

        return res.status(201).json({ message: "Capital initialized successfully", capital });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to initialize capital" });
    }
};

const closeLoan = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    const { loanId } = req.params;
    const userId = req.user.id;

    try {
        const result = await closeLoanDB(loanId, userId);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to close loan" });
    }
};

const deleteLoanById = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
  const { loanId } = req.params;

  try {
    const loan = await findLoanById(loanId);

    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    await deleteLoan(loanId);

    return res.status(200).json({ message: "Loan and its repayments deleted successfully." });
  } catch (error) {
    console.error("Failed to delete loan:", error);
    return res.status(500).json({ error: "Failed to delete loan" });
  }
};

export { issueLoanController,filterLoans,fetchLoanDetails,fetchLoanHistory,updatePendingAmountController,registerExistingLoan,initializeCapital,closeLoan,deleteLoanById};



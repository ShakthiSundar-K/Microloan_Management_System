import { Request, Response } from "express";
import { issueLoan,getFilteredLoans,getLoanDetails,getLoanHistory ,findLoanById, updatePendingAmount,createExistingLoan,getTotalPendingLoanAmount, createCapitalTracking} from "../models/loanModel";

const issueLoanController = async (req: Request, res: Response):Promise<Response|void> => {
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
    try {
        const filters = req.query; 
        const loans = await getFilteredLoans(filters);
        res.json({ message: "Loans fetched successfully", data: loans });
    } catch (error) {
        res.status(500).json({ message: "Error fetching loans", error: (error as Error).message });
    }
};

 const fetchLoanDetails = async (req: Request, res: Response) => {
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
    const {  principalAmount, pendingAmount, dailyRepaymentAmount, issuedAt, daysToRepay } = req.body;
    const { borrowerId } = req.params; // Get borrower ID from request parameters
    const issuedById = req.user.id; // Get lender ID from auth

    if (principalAmount <= 0 || pendingAmount < 0) {
        return res.status(400).json({ error: "Invalid loan amounts." });
    }

    try {
        const loanData = {
            borrowerId,
            issuedById,
            principalAmount,
            pendingAmount, // Manually set
            dailyRepaymentAmount,
            dueDate: null, // No automatic due date calculation
            daysToRepay, // Store for reference
            status: "Active",
            issuedAt: new Date(issuedAt), // Use user-provided date
            isMigrated: true, // Mark as an existing loan
        };

        await createExistingLoan(loanData);

        return res.status(201).json({ message: "Existing loan registered successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to register existing loan" });
    }
};

const updatePendingAmountController = async (req: Request, res: Response) => {
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

export { issueLoanController,filterLoans,fetchLoanDetails,fetchLoanHistory,updatePendingAmountController,registerExistingLoan,initializeCapital};



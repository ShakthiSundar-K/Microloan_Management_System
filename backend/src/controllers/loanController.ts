import { Request, Response } from "express";
import { issueLoan,getFilteredLoans,getLoanDetails,getLoanHistory } from "../models/loanModel";

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

export { issueLoanController,filterLoans,fetchLoanDetails,fetchLoanHistory};



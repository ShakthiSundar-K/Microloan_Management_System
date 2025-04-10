import { Request, Response } from "express";
import { getRepaymentHistory } from "../models/repaymentHistoryModel";

const isLender = (req: Request, res: Response): boolean => {
    if (req.user?.role !== "LENDER") {
        res.status(403).json({ message: "You do not have access to perform this operation" });
        return false;
    }
    return true;
};

export const fetchRepaymentHistory = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;

    try {
        const { filterType, startDate, endDate, minAmount, maxAmount } = req.query;
        
        // Convert minAmount and maxAmount to numbers, defaulting to undefined if not provided
        const min = minAmount ? parseFloat(minAmount as string) : undefined;
        const max = maxAmount ? parseFloat(maxAmount as string) : undefined;

        // Get repayment history by passing the parameters
        const history = await getRepaymentHistory(
            filterType as string || "week",  // Default to "week" filter type
            startDate as string, 
            endDate as string, 
            min, 
            max
        );

        res.json({ message: "Repayment History fetched successfully", data: history });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch repayment history", error: (error as Error).message });
    }
};



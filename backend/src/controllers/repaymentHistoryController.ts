import { Request, Response } from "express";
import { getRepaymentHistory } from "../models/repaymentHistoryModel";

export const fetchRepaymentHistory = async (req: Request, res: Response) => {
    try {
        const { filterType, startDate, endDate } = req.query;
        const history = await getRepaymentHistory(filterType as string, startDate as string, endDate as string);
        res.json({ message:"Repayment History hetched successfully", data: history });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch repayment history", error: (error as Error).message });
    }
};

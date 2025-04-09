import { Request, Response } from "express";
import { getMonthlyFinancialData } from "../models/financialSummaryModel";

 const generateMonthlyFinancialSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await getMonthlyFinancialData(userId);

    res.status(200).json({
      message: "Monthly financial summary generated/updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Financial summary generation error:", error);
    res.status(500).json({
      message: "Failed to generate financial summary",
      error: (error as Error).message,
    });
  }
};
    
    
export { generateMonthlyFinancialSummary };
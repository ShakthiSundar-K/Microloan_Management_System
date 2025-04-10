import { Request, Response } from "express";
import { getMonthlyFinancialData,findMonthlyFinancialSummary,getDynamicFinancialSummary,getLatestCapital } from "../models/financialSummaryModel";
import dayjs from "dayjs";


 const generateMonthlyFinancialSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await getMonthlyFinancialData(userId);

    res.status(200).json({
      message: "Monthly financial summary generated/updated successfully"
    });
  } catch (error) {
    console.error("Financial summary generation error:", error);
    res.status(500).json({
      message: "Failed to generate financial summary",
      error: (error as Error).message,
    });
  }
};

 const generateMonthlyFinancialSummaryCron = async (id:string) => {
  try {
    const userId = id;
    if (!userId) return console.log("Unauthorized");

    await getMonthlyFinancialData(userId);

    console.log("Monthly financial summary generated/updated successfully for userId:", userId);
  } catch (error) {
    console.error("Financial summary generation error:", error);
  
  }
};
    
const getMonthlyFinancialSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // assuming JWT auth middleware adds this
    const month = dayjs().format("YYYY-MM");

    const summary = await findMonthlyFinancialSummary(userId, month);

    if (!summary) {
      return res.status(404).json({
        message:
          "No monthly financial summary found. Please generate it manually or wait for auto-generation at month end.",
      });
    }

    return res.status(200).json({
      message: "Monthly financial summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    console.error("Error retrieving monthly summary:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving the monthly summary.",
    });
  }
};


const getDynamicFinancialSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { from, to } = req.query;

    const summary = await getDynamicFinancialSummary(
      userId,
      from as string | undefined,
      to as string | undefined
    );

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching dynamic financial summary:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
    

const getLatestCapitalById = async (req:Request,res:Response) => {
try {
    const userId = req.user.id; // or however you're extracting userId from auth
    const data = await getLatestCapital(userId);
    res.json({message:"Latest Capital fetched successfully",data});
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export { getLatestCapitalById,generateMonthlyFinancialSummary ,generateMonthlyFinancialSummaryCron,getMonthlyFinancialSummary,getDynamicFinancialSummaryController};
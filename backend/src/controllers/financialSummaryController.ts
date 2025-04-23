import { Request, Response } from "express";
import { getMonthlyFinancialData,findMonthlyFinancialSummary,getDynamicFinancialSummary,getLatestCapital, getFinancialSummariesByMonths } from "../models/financialSummaryModel";
import dayjs from "dayjs";

const isLender = (req: Request, res: Response): boolean => {
    if (req.user?.role !== "LENDER") {
        res.status(403).json({ message: "You do not have access to perform this operation" });
        return false;
    }
    return true;
};

 const generateMonthlyFinancialSummary = async (req: Request, res: Response) => {
  if (!isLender(req, res)) return;

  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { month } = req.body;
    
    if (!month || !month.match(/^\d{4}-\d{2}$/)) {
      return res.status(400).json({ 
        message: "Invalid month format. Please provide month in YYYY-MM format" 
      });
    }
    await getMonthlyFinancialData(userId,month);

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
  if (!isLender(req, res)) return;

  try {
    const userId = req.user.id; // assuming JWT auth middleware adds this
    const { month: requestedMonth } = req.body;
    
    // Use requested month if valid, otherwise use current month
    let month;
    if (requestedMonth && requestedMonth.match(/^\d{4}-\d{2}$/)) {
      month = requestedMonth;
    } else {
      month = dayjs().format("YYYY-MM");
    }

    console.log(`Fetching financial summary for month: ${month}`);
    
    const summary = await findMonthlyFinancialSummary(userId, month);

    if (!summary) {
      return res.status(404).json({
        message:
          "No monthly financial summary found. Please generate it manually or wait for auto-generation at month end.",
      });
    }

     res.status(200).json({
      message: "Monthly financial summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    console.error("Error retrieving monthly summary:", error);
     res.status(500).json({
      message: "An error occurred while retrieving the monthly summary.",
    });
  }
};


const getDynamicFinancialSummaryController = async (
  req: Request,
  res: Response
) => {
  if (!isLender(req, res)) return;

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

const getFinancialSummaryForGraphController = async (req: Request, res: Response) => {
  if (!isLender(req, res)) return;

  try {
    const userId = req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    
    const { months } = req.body;
    
    // Validate months format
    if (!Array.isArray(months)) {
      return res.status(400).json({ 
        message: "Invalid request format. 'months' must be an array of strings in YYYY-MM format" 
      });
    }
    
    for (const month of months) {
      if (!month.match(/^\d{4}-\d{2}$/)) {
        return res.status(400).json({ 
          message: "Invalid month format. Each month must be in YYYY-MM format" 
        });
      }
    }
    
    const summaries = await getFinancialSummariesByMonths(userId, months);
    
    res.status(200).json({
      message: "Financial summaries retrieved successfully",
      data: summaries
    });
  } catch (error) {
    console.error("Error retrieving financial summaries for graph:", error);
    res.status(500).json({
      message: "Failed to retrieve financial summaries",
      error: (error as Error).message,
    });
  }
};
    

const getLatestCapitalById = async (req:Request,res:Response) => {
console.log("getLatestCapitalById called")
if (!isLender(req, res)) return;

try {
    const userId = req.params.userId;
    // console.log("User ID:", userId); // Log the userId for debugging
    const data = await getLatestCapital(userId);
    res.json({message:"Latest Capital fetched successfully",data});
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export {getFinancialSummaryForGraphController, getLatestCapitalById,generateMonthlyFinancialSummary ,generateMonthlyFinancialSummaryCron,getMonthlyFinancialSummary,getDynamicFinancialSummaryController};
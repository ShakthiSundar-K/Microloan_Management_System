 import { Request, Response } from "express";
 import {calculateAndSaveRiskAssessment,upsertRiskThreshold,getAllBorrowerId,getRiskAssessmentByUserId} from "../models/riskAssessmentModel";

 const isLender = (req: Request, res: Response): boolean => {
    if (req.user?.role !== "LENDER") {
        res.status(403).json({ message: "You do not have access to perform this operation" });
        return false;
    }
    return true;
};

 const manualRiskAssessmentTrigger = async (req: Request, res: Response) => {

  if (!isLender(req, res)) return;
  const { borrowerId } = req.params;

  if (!borrowerId) {
    return res.status(400).json({ error: "Borrower ID is required" });
  }

  try {
    console.log("Manual risk assessment triggered for borrower:", borrowerId);
    await calculateAndSaveRiskAssessment([borrowerId]); // 👈 wrap in array
    return res.status(200).json({ message: "Risk assessment completed" });
  } catch (error: any) {
    console.error("Manual risk assessment error:", error);
    return res.status(500).json({ error: "Risk assessment failed" });
  }
};

const updateRiskThreshold = async (req: Request, res: Response) => {
  if (!isLender(req, res)) return;
  try {
    const userId = req.user.id;
    const { lowThreshold, mediumThreshold } = req.body;

    if (lowThreshold === undefined && mediumThreshold === undefined) {
      return res.status(400).json({ message: "At least one threshold value must be provided." });
    }

     await upsertRiskThreshold(userId, { lowThreshold, mediumThreshold });
    res.status(200).json({ message: "Risk thresholds updated successfully" });
  } catch (error) {
    console.error("Error updating risk threshold:", error);
    res.status(500).json({ message: "Error while updating Risk Threshold values" });
  }
};


const runDailyRiskAssessment = async () => {
  try {
    const borrowers = await getAllBorrowerId();
    console.log("Borrowers",borrowers);

    const borrowerIds = borrowers.map(b => b.borrowerId);

    await calculateAndSaveRiskAssessment(borrowerIds);

    console.log("Daily risk assessment completed for all borrowers.");
  } catch (error) {
    console.error("Risk assessment error:", error);
  
  }
};

 const getRiskAssessmentById = async (req: Request, res: Response) => {
  if (!isLender(req, res)) return;
  try {
    const borrowerId = req.params.borrowerId

    if (!borrowerId) {
      return res.status(400).json({ error: "Borrower ID is required." });
    }

    const riskAssessment = await getRiskAssessmentByUserId(borrowerId);

    if (!riskAssessment) {
      return res.status(404).json({ error: "No risk assessment found for this user." });
    }

    res.status(200).json({message:"Risk Assessment found successfully", data: riskAssessment });
  } catch (error) {
    console.error("Error fetching risk assessment:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export  {manualRiskAssessmentTrigger,updateRiskThreshold,runDailyRiskAssessment,getRiskAssessmentById}
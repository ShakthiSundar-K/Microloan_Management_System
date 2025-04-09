 import { Request, Response } from "express";
 import {calculateAndSaveRiskAssessment,upsertRiskThreshold} from "../models/riskAssessmentModel";
 const manualRiskAssessmentTrigger = async (req: Request, res: Response) => {
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

export  {manualRiskAssessmentTrigger,updateRiskThreshold}
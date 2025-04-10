import express from "express";

import { protect } from "../middleware/authMiddleware";
import { updateRiskThreshold } from "../controllers/riskAssessmentController";
import { manualRiskAssessmentTrigger } from "../controllers/riskAssessmentController";
import { getRiskAssessmentById } from "../controllers/riskAssessmentController";

const router = express.Router();

router.post("/update-risk-threshold",protect,updateRiskThreshold);
router.get("/get-risk-assessment/:borrowerId",protect,getRiskAssessmentById);
router.post("/:borrowerId",protect, manualRiskAssessmentTrigger);


export default router;
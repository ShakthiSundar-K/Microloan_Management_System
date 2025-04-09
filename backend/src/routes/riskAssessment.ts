import express from "express";

import { protect } from "../middleware/authMiddleware";
import { updateRiskThreshold } from "../controllers/riskAssessmentController";
import { manualRiskAssessmentTrigger } from "../controllers/riskAssessmentController";

const router = express.Router();

router.post("/update-risk-threshold",protect,updateRiskThreshold);
router.post("/:borrowerId",protect, manualRiskAssessmentTrigger);

export default router;
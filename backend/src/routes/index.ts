import express from "express";
import authRoutes from "./authRoutes";
import borrowerRoutes from "./borrowerRoutes";
import loanRoutes from "./loanRoutes"; 
import repaymentRoutes from "./repaymentRoutes";
import riskAssessment from "./riskAssessment";
import { protect } from "../middleware/authMiddleware";
import { generateMonthlyFinancialSummary,getMonthlyFinancialSummary } from "../controllers/financialSummaryController";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/borrower",borrowerRoutes);
router.use("/api/loan",loanRoutes);
router.use("/api/repayment",repaymentRoutes);
router.use("/api/risk-assessment",riskAssessment);
router.post("/api/generate-financial-summary", protect, generateMonthlyFinancialSummary); // Financial summary route
router.get("/api/financial-summary", protect, getMonthlyFinancialSummary); // Financial summary route

export default router;
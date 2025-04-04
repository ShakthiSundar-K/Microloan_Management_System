import express from "express";
import authRoutes from "./authRoutes";
import borrowerRoutes from "./borrowerRoutes";
import loanRoutes from "./loanRoutes"; 
import repaymentRoutes from "./repaymentRoutes";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/borrower",borrowerRoutes);
router.use("/api/loan",loanRoutes);
router.use("/api/repayment",repaymentRoutes);

export default router;
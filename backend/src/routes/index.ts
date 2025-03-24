import express from "express";
import authRoutes from "./authRoutes";
import borrowerRoutes from "./borrowerRoutes";

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/borrower",borrowerRoutes);

export default router;
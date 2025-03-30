import express from "express";
import { issueLoanController,filterLoans,fetchLoanDetails } from "../controllers/loanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/issue/:borrowerId",protect,issueLoanController);
router.get("/", protect, filterLoans);
router.get("/:loanId", protect, fetchLoanDetails); // Assuming you want to filter by loanId as well


export default router;
import express from "express";
import {deleteLoanById,closeLoan, issueLoanController,filterLoans,fetchLoanDetails,fetchLoanHistory,registerExistingLoan,updatePendingAmountController,initializeCapital  } from "../controllers/loanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/history", protect, fetchLoanHistory); 
router.post("/issue/:borrowerId", protect, issueLoanController);
router.get("/:loanId", protect, fetchLoanDetails); 
router.post("/register-existing-loan/:borrowerId", protect, registerExistingLoan);
router.post("/initialize-capital", protect, initializeCapital); 
router.patch("/close-loan/:loanId", protect, closeLoan);
router.delete("/delete-loan/:loanId", protect, deleteLoanById);
// router.put("/update-pending-amount/:loanId", protect, updatePendingAmountController);

router.get("/", protect, filterLoans);

export default router;
import express from "express";
import { issueLoanController,filterLoans,fetchLoanDetails,fetchLoanHistory,registerExistingLoan,updatePendingAmountController,initializeCapital  } from "../controllers/loanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/history", protect, fetchLoanHistory); 


router.post("/issue/:borrowerId",protect,issueLoanController);
router.get("/", protect, filterLoans);
router.get("/:loanId", protect, fetchLoanDetails); 
router.post("/register-existing-loan/:borrowerId", protect,registerExistingLoan );
router.put("/update-pending-amount/:loanId", protect, updatePendingAmountController);
router.post("/initialize-capital", protect, initializeCapital); 




export default router;
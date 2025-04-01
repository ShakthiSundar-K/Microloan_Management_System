import express from "express";
import { issueLoanController,filterLoans,fetchLoanDetails,fetchLoanHistory } from "../controllers/loanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/history", protect, fetchLoanHistory); 


router.post("/issue/:borrowerId",protect,issueLoanController);
router.get("/", protect, filterLoans);
router.get("/:loanId", protect, fetchLoanDetails); 




export default router;
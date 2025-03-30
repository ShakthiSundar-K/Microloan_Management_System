import express from "express";
import { issueLoanController,filterLoans } from "../controllers/loanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/issue/:borrowerId",protect,issueLoanController);
router.get("/", protect, filterLoans);


export default router;
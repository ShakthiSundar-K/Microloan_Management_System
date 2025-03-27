import express from "express";
import { recordPaymentController } from "../controllers/repaymentContoller";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/record-payment/:borrowerId/:loanId",protect,recordPaymentController);

export default router;
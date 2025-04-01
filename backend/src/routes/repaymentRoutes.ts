import express from "express";
import { recordPaymentController,closePaymentsForTheDay ,fetchTodayRepayments} from "../controllers/repaymentContoller";
import { fetchRepaymentHistory } from "../controllers/repaymentHistoryController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/record-payment/:borrowerId/:loanId",protect,recordPaymentController);
router.post("/close-payments",protect,closePaymentsForTheDay);
router.get("/today-repayments",protect,fetchTodayRepayments);
router.get("/repayment-history",protect,fetchRepaymentHistory);

export default router;
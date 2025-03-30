import express from "express";
import { recordPaymentController,closePaymentsForTheDay ,fetchTodayRepayments} from "../controllers/repaymentContoller";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/record-payment/:borrowerId/:loanId",protect,recordPaymentController);
router.post("/close-payments",protect,closePaymentsForTheDay);
router.get("/today-repayments",protect,fetchTodayRepayments);

export default router;
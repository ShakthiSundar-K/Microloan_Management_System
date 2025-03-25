import express from "express";
import { issueLoanController } from "../controllers/loanController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/issue/:borrowerId",protect,issueLoanController);

export default router;
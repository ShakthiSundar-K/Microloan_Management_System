import express, { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {getBorrowerInfo,createBorrowerController,getBorrowerByNameController,getAllBorrowersController,getBorrowerByPhoneNumberController,updateBorrowerPasswordController,deleteBorrowerController,getBorrowers} from "../controllers/borrowerController"
import {manualRiskAssessmentTrigger} from "../controllers/riskAssessmentController";
const router = express.Router();

router.post("/create",protect,createBorrowerController);

router.get("/", protect,getAllBorrowersController);

router.get("/getByPhoneNumber",protect, getBorrowerByPhoneNumberController);

router.get("/getByName",protect, getBorrowerByNameController);

router.put("/updatePassword",protect, updateBorrowerPasswordController);

router.delete("/delete/:borrowerId",protect, deleteBorrowerController);

router.get("/search", protect,getBorrowers);

router.get("/borrower-details/:borrowerId",protect, getBorrowerInfo);


export default router;
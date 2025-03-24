import express, { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {createBorrowerController,getBorrowerByNameController,getAllBorrowersController,getBorrowerByPhoneNumberController,updateBorrowerPasswordController,deleteBorrowerController} from "../controllers/borrowerController"

const router = express.Router();

router.post("/create",protect,createBorrowerController);

router.get("/", protect,getAllBorrowersController);

router.get("/getByPhoneNumber",protect, getBorrowerByPhoneNumberController);

router.get("/getByName",protect, getBorrowerByNameController);

router.put("/updatePassword",protect, updateBorrowerPasswordController);

router.delete("/delete/:borrowerId",protect, deleteBorrowerController);

export default router;
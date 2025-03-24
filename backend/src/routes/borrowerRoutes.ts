import express, { Router } from "express";

import {createBorrowerController,getBorrowerByNameController,getAllBorrowersController,getBorrowerByPhoneNumberController,updateBorrowerPasswordController,deleteBorrowerController} from "../controllers/borrowerController"

const router = express.Router();

router.post("/create", createBorrowerController);

router.get("/", getAllBorrowersController);

router.get("/getByPhoneNumber", getBorrowerByPhoneNumberController);

router.get("/getByName", getBorrowerByNameController);

router.put("/updatePassword", updateBorrowerPasswordController);

router.delete("/delete/:borrowerId", deleteBorrowerController);

export default router;
import {Request, Response} from "express";
import {createBorrower,getAllBorrowers,getBorrowerByPhoneNumber,deleteBorrower,updateBorrowerPassword,getBorrowerByName} from "../models/borrowerModel";

//create borrower
const createBorrowerController = async(req: Request,res:Response) => {
    try{
        const {name,phoneNumber,address} = req.body;
        await createBorrower(name,phoneNumber,address);
        res.status(201).json({message:"Borrower added successfully"});
    }    
    catch(error){
        res.status(400).json({message:"Failed to add borrower",error:(error as Error).message});
    }
}

//get all borrowers
const getAllBorrowersController = async(req: Request,res:Response) => {
    try{
        const borrowers = await getAllBorrowers();
        res.status(200).json({message:"Successfully fetched the borrwers list",borrowers});
    }
    catch(error){
        res.status(500).json({message:"Failed to get the Borrowers list",error:(error as Error).message})
    }
}

//get borrower list by name
const getBorrowerByNameController = async(req: Request,res:Response) => {
    try{
        const {name} = req.body;
        const borrower = await getBorrowerByName(name);
        res.status(200).json({message:"Successfully fetched the borrwer",borrower});
    }
    catch(error){
        res.status(500).json({message:"Failed to get the Borrower",error:(error as Error).message})
    }
}

//get borrower list by name
const getBorrowerByPhoneNumberController = async(req: Request,res:Response) => {
    try{
        const {phoneNumber} = req.body;
        const borrower = await getBorrowerByPhoneNumber(phoneNumber);
        res.status(200).json({message:"Successfully fetched the borrwer",borrower});
    }
    catch(error){
        res.status(500).json({message:"Failed to get the Borrower",error:(error as Error).message})
    }
}


// Update Borrower
const updateBorrowerPasswordController = async (req: Request, res: Response) => {
    try {
        const { id } = req.user.id; 
        const { password } = req.body;
        await updateBorrowerPassword(id,password);
        res.json({ message: "Borrower Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating borrower", error: (error as Error).message });
    }
};

//delete borrower
const deleteBorrowerController = async (req: Request, res: Response) => {
    try {
        const { borrowerId } = req.params;
        await deleteBorrower(borrowerId);
        res.json({ message: "Borrower deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting borrower", error: (error as Error).message  });
    }
};

export { createBorrowerController, getAllBorrowersController, getBorrowerByNameController, getBorrowerByPhoneNumberController, updateBorrowerPasswordController, deleteBorrowerController };
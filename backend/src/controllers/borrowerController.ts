import {Request, Response} from "express";
import {getBorrowerDetails,createBorrower,getAllBorrowers,getBorrowerByPhoneNumber,deleteBorrower,updateBorrowerPassword,getBorrowerByName,searchBorrowers} from "../models/borrowerModel";

// Middleware to check if the user is a LENDER
const isLender = (req: Request, res: Response): boolean => {
    if (req.user?.role !== "LENDER") {
        res.status(403).json({ message: "You do not have access to perform this operation" });
        return false;
    }
    return true;
};

//create borrower
const createBorrowerController = async(req: Request,res:Response) => {
    if (!isLender(req, res)) return;
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
    if (!isLender(req, res)) return;

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
    if (!isLender(req, res)) return;
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
    if (!isLender(req, res)) return;
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
    if (!isLender(req, res)) return;
    try {
        const { id } = req.user; 
        const { password } = req.body;
        await updateBorrowerPassword(id,password);
        res.json({ message: "Borrower Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating borrower", error: (error as Error).message });
    }
};

//delete borrower
const deleteBorrowerController = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    try {
        const { borrowerId } = req.params;
        await deleteBorrower(borrowerId);
        res.json({ message: "Borrower deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting borrower", error: (error as Error).message  });
    }
};


 const getBorrowers = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    try {
        const { query } = req.query; // Extract search query

        if (!query || typeof query !== "string") {
            res.status(400).json({ message: "Invalid search query" });
            return;
        }

        const borrowers = await searchBorrowers(query);

        if (borrowers.length === 0) {
            res.status(404).json({ message: "No borrowers found" });
            return;
        }

        res.status(200).json({ message: "Borrowers found", data:borrowers });
    } catch (error) {
        res.status(500).json({ message: "Error searching borrowers", error: (error as Error).message  });
    }
};

const getBorrowerInfo = async (req: Request, res: Response) => {
    if (!isLender(req, res)) return;
    try {
        const { borrowerId } = req.params;

        if (!borrowerId || typeof borrowerId !== "string") {
            res.status(400).json({ message: "Invalid borrowerId" });
        }

        const borrowerData = await getBorrowerDetails(borrowerId as string);

        res.status(200).json({ message: "Borrower details fetched successfully", data: borrowerData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching borrower details", error: (error as Error).message  });
    }
};

export { getBorrowerInfo,createBorrowerController, getAllBorrowersController, getBorrowerByNameController, getBorrowerByPhoneNumberController, updateBorrowerPasswordController, deleteBorrowerController,getBorrowers };
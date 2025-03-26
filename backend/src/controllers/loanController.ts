import { Request, Response } from "express";
import { issueLoan } from "../models/loanModel";

const issueLoanController = async (req: Request, res: Response):Promise<Response|void> => {
    try {
        // Check if the user has the "LENDER" role
        if (req.user.role !== "LENDER") {
            return res.status(403).json({ message: "You don't have access to issue loans" });
        }

        const { borrowerId } = req.params;
        const { id } = req.user;
        await issueLoan(borrowerId, id, req.body);

        res.status(200).json({ message: "Loan issued successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to issue loan", error: (error as Error).message });
    }
};

export { issueLoanController };



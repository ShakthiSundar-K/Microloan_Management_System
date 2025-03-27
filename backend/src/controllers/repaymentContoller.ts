import { Request, Response } from "express";
import { recordPayment } from "../models/repaymentModel";

const recordPaymentController = async (req: Request, res: Response): Promise< void> => {
    try {
        const { borrowerId, loanId } = req.params;
        const { id } = req.user;
        const { amountPaid } = req.body;

        if (!amountPaid || amountPaid <= 0) {
             res.status(400).json({ message: "Invalid payment amount" });
             return;
        }

        await recordPayment(borrowerId, loanId, amountPaid, id);

        res.status(200).json({ message: "Payment recorded successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to record payment", error: (error as Error).message });
    }
};

export { recordPaymentController };

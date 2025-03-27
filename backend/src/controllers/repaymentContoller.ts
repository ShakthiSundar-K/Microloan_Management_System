import { Request, Response } from "express";
import { recordPayment,finishPaymentsForTheDay } from "../models/repaymentModel";

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
const closePaymentsForTheDay = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: collectorId } = req.user; // Get collector's ID from request

        await finishPaymentsForTheDay(collectorId); // Pass collectorId

        res.status(200).json({ message: "Closed all Payments for today" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to close Payments for today",
            error: (error as Error).message,
        });
    }
};

export { recordPaymentController,closePaymentsForTheDay };

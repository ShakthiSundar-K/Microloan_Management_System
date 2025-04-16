import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

// Extend Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        let token = req.headers.authorization;
        // console.log("Incoming token:", token); // Log the incoming token for debugging
        if (!token) {
            res.status(401).json({ message: "No token, authorization denied" });
            return; // Exit the function after sending a response
        }

        token = token.split(" ")[1]; // Remove "Bearer " prefix

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Assign the decoded payload to req.user
        // console.log("success from auth middleware")
        next(); // Move to the next middleware/controller
    } catch (error) {
        res.status(401).json({ message: "Invalid token, authorization denied" });
        return; // Ensure function exits after sending a response
    }
};

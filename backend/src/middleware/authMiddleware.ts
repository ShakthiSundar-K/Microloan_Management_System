import jwt from "jsonwebtoken";
import { Request, Response } from "express";

// Extend the Request interface to include the user property
declare global {
    namespace Express {
        interface Request {
            user?: any; //add user property
        }
    }
}
import dotenv from "dotenv";

dotenv.config();

export const protect = (req: Request, res: Response, next: () => void) => {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    try {
        token = token.split(" ")[1]; // for removing Bearer prefix
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token, authorization denied" });
    }
};

function next() {
    throw new Error("Function not implemented.");
}

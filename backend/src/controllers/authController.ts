import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import dotenv from "dotenv";
import {findUserByEmail,createUser,findUserByPhone,comparePasswords,findUserByUserId,updatePassword} from "../models/userModel";
import { Role } from "@prisma/client";
import { sendEmail } from "../services/emailService";
import bcrypt from "bcryptjs";
import {getBorrowerByPhoneNumber} from "../models/borrowerModel";


dotenv.config();

const generateToken = (user : { userId : string,email:string, role: Role})=>{
    return jwt.sign({id: user.userId,email:user.email, role:user.role}, process.env.JWT_SECRET as string, {expiresIn: "7d"});
}
const generateBorrowerToken = (borrower : { borrowerId : string, role: string})=>{
    return jwt.sign({id: borrower.borrowerId,role:"BORROWER"}, process.env.JWT_SECRET as string, {expiresIn: "7d"});
}

//Register
const register = async (req:Request, res:Response):Promise<void> => {
    try{

         console.log("Incoming Request Body:", req.body);
        //extracting the name, email, phoneNumber and password from the request body
        const {name,email,phoneNumber,password,role} = req.body;

        //check if the user already exists
        const existingUser = await findUserByEmail(email);

        //if the user already exists, return an error
        if(existingUser){
             res.status(400).json({ message: "User already exists" });
             return;
        }

        const userRole: Role = role.toUpperCase() as Role;

        if (!Object.values(Role).includes(userRole)) {
             res.status(400).json({ message: "Invalid role" });
             return;
        }

        //if the user does not exist, create a new user
        const user = await createUser(name, email, password, phoneNumber, userRole); 
        
        //generate and send a JWT token
        const token = generateToken(user);

        res.status(201).json({message: "User created successfully",token});

    }
    catch(error){
        res.status(500).json({ message: "Error registering user",error:(error as Error).message });
    }
};

//Login
const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extracting the phoneNumber and password from the request body
        const { phoneNumber, password } = req.body;

        let user = await findUserByPhone(phoneNumber);
        let token: string;

        if (user) {
            // If user exists in Users table
            const isMatch = await comparePasswords(password, user.passwordHash);
            if (!isMatch) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            token = generateToken(user);
        } else {
            // If not found in Users, check in Borrowers table
            const borrower = await getBorrowerByPhoneNumber(phoneNumber);

            if (!borrower) {
                res.status(401).json({ message: "User not found" });
                return;
            }

            const isMatch = await comparePasswords(password, borrower.passwordHash);
            if (!isMatch) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            token = generateBorrowerToken(borrower);
        }

        res.json({ message: "Logged in successfully", token });

    } catch (error) {
        res.status(500).json({ message: "Error in login controller", error: (error as Error).message });
    }
};


const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try{
        const {email} = req.body;

        //check if the user exists
        const user = await findUserByEmail(email);

        if(!user){
            res.status(500).json({messgae:"User does not exist"});
            return;
        }

        //generate a password reset token
        const resetToken = jwt.sign({id: user.userId}, process.env.RESET_PASSWORD_SECRET  as string, {expiresIn: "15m"});
        
        await sendEmail(
            email,
            "Password Reset",
            `Click this link to reset your password: https://localhost:3000/reset-password/${resetToken}`
        )

        res.status(200).json({message:"Password reset link sent to email"});
    }
    catch(error){
        res.status(500).json({message:"Error in forgotPassword controller",error:(error as Error).message});
    }
}

const resetPassword = async (req:Request,res:Response): Promise<void> => {

try{
    const {newPassword,token} = req.body;

    //verify the reset token
    const decodedToken = jwt.verify(token, process.env.RESET_PASSWORD_SECRET as string);

    if (!decodedToken || typeof decodedToken === "string") {
        res.status(401).json({message:"Invalid or expired token"});
        return;
    }

    //find user by id
    const user = await findUserByUserId(decodedToken.id);

    if(!user){
        res.status(401).json({message:"User not found"});
        return;
    }

    //Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update the password
    await updatePassword(user.userId, hashedPassword);

    res.status(200).json({message:"Password Reset Successful"});

}catch(error){
    res.json({message:"Error in reseting password", error:(error as Error).message});
}

}


export {register,login,forgotPassword,resetPassword};
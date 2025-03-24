import { Role } from "@prisma/client";
import prisma from "../config/prismaClient";
import bcrypt from "bcryptjs";

//for creating a new user account
const createUser = async (name:string , email:string, password:string, phoneNumber:string,role:Role) => {
    const passwordHash = await bcrypt.hash(password,10);
    return await prisma.users.create({
        data:{
            name,
            email,
            passwordHash,
            role: role as Role,
            phoneNumber
        },
    });
}

//for finding a user by email
const findUserByEmail = async (email:string) => {
    return await prisma.users.findUnique({
        where: {
            email,
        }
    })
}

//for updating a userId
const findUserByUserId = async (userId:string) => {
    return await prisma.users.findUnique({
        where: {
            userId: userId,
        }
    })
}

//for finding a user by phone number
const findUserByPhone = async (phoneNumber:string) => {
    return await prisma.users.findUnique({
        where: {
            phoneNumber,
        }
    })
}

//for finding users by name
const findUsersByName = async (name:string) => {
    return await prisma.users.findMany({
        where: {
            name,
        }
    })
}

const comparePasswords = async(enteredPassword:string,passwordHash:string) => {
    return await bcrypt.compare(enteredPassword,passwordHash);
}

const updatePassword = async(userId:string, passwordHash:string) => {
    return await prisma.users.update({
        where: { userId },
        data: {  passwordHash },
    });
}

export  {createUser, findUserByEmail, findUserByPhone, findUsersByName, comparePasswords,findUserByUserId,updatePassword };
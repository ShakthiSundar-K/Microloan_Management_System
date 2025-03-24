import prisma from "../config/prismaClient";
import bcrypt from "bcryptjs";

//create a new borrower profile
const createBorrower = async (name:string ,phoneNumber:string,address:string) => {
    const password = "123456"
    const passwordHash = await bcrypt.hash(password,10);
    return await prisma.borrowers.create({
        data:{
            name,
            phoneNumber,
            passwordHash,
            address
        },
    });
}

const getAllBorrowers = async () => {
    return await prisma.borrowers.findMany();
}

const getBorrowerByName = async (name:string) => { 
    return await prisma.borrowers.findMany({where:{name}});
}

const getBorrowerByPhoneNumber = async (phoneNumber:string) => {
    return await prisma.borrowers.findUnique({where:{phoneNumber}});
}
const getBorrowerById = async (borrowerId:string) => {
    return await prisma.borrowers.findUnique({where:{borrowerId}});
}

const updateBorrowerPassword = async (borrowerId:string,password:string) => {
    const passwordHash = await bcrypt.hash(password,10);
    return await prisma.borrowers.update({
        where:{borrowerId},
        data:{passwordHash},
    });
}

const deleteBorrower = async (borrowerId:string) => {
    return await prisma.borrowers.delete({where:{borrowerId}});
}

export {
    createBorrower,
    getAllBorrowers,
    getBorrowerByName,
    getBorrowerByPhoneNumber,
    getBorrowerById,
    updateBorrowerPassword,
    deleteBorrower
}
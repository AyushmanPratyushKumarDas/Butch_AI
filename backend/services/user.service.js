import userModel from '../models/user.model.js';



export const creatUser = async ({
    email, password
})=>{
    if(!email || !password){
        throw new Error('Email and password are required');
    }

    const hashedpassword = await userModel.hashPassword(password);
    
    const user = await userModel.create({
        email,
        password:hashedpassword
    });


    return user;
}

export const getAllUsers =async ({userId})=>{
    const users = await userModel.find({
        _id:{$ne:userId}
    });
    return users;
}
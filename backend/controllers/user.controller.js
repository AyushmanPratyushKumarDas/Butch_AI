import userModel from '../models/user.model.js';
import { creatUser,getAllUsers } from '../services/user.service.js';  // Corrected import for named export
import { validationResult } from 'express-validator';
import redisClint from '../services/redis.service.js';

export const creatUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await creatUser(req.body);  // Use creatUser directly
        const token = await user.generateJWT();

        delete user._doc.password;
        res.status(201).json({ user, token });
    } catch (err) {
        console.error('Error creating user:', err); // Log the error
        res.status(400).send({ message: err.message });
    }
};

export const loginController = async(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
         const {email,password}=req.body;
         const user = await userModel.findOne({email}).select('+password');
         if(!user){
            return res.status(401).json({
                errors:'Invalid Credentials'
            })
         } 
         
         const isMatch = await user.isValidPassword(password);
         if(!isMatch){
            return res.status(401).json({
                errors:'Invalid Credentials'
            })
         }

         const token = await user.generateJWT();

         delete user._doc.password;
         res.status(200).json({user,token});
         

    }catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }
};

export const profileController = async(req,res) =>{
    console.log(req.user);
    res.status(200).json({user:req.user});
}

export const logoutController = async(req,res) =>{
    try{

        const token = req.cookies?.token || 
        (req.headers?.authorization && req.headers.authorization.split(' ')[1]) ||
        req.body?.token;

        redisClint.set(token,'logout','EX',60*60*24);
        res.status(200).json({
            message:'Logged out successfully'
        });

    }
    catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }
}

export const getAllUserController = async(req,res) =>{
    try{

        const loggedInUser = await userModel.findOne({
            email:req.user.email
        })
        const userId = loggedInUser._id;
        const allusers = await getAllUsers({userId});
        return res.status(200).json({
            users:allusers
        })

    }catch(err){
        console.log(err);
        res.status(400).send(err.message);
    }
}

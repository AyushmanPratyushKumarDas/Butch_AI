import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js"
import mongoose from "mongoose";

// Create a new project
export const createProject = async ({ name, userId }) => {
    if (!name) {
        throw new Error("Project name is required");
    }

    if (!userId) {
        throw new Error("User ID is required");
    }

    // Create a new project document
    const project = await projectModel.create({
        name,
        users: [userId]   // Store the userId in the users array
    });

    return project;
};

// Get all projects for a user by userId
export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({users:userId});
    return allUserProjects
}

export const addUserToProject = async ({projectId,users,userId}) =>{
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!users) {
        throw new Error("users are required")
    }

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array")
    }

    if (!userId) {
        throw new Error("userId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }

    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    if(!project){
        throw new Error("user not belong to the project")
    }

    const updatedProject =await projectModel.findOneAndUpdate({
        _id: projectId
    },{
        $addToSet:{
            users:{
                $each:users
            }
        }
    },{ new:true})

    return updatedProject

}

export const getProjectById = async ({projectId})=>{
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')
    return project;
}

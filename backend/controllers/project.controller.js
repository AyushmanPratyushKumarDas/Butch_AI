import ProjectModel from "../models/project.model.js";
import * as projectService from "../services/project.service.js";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import path from "path";
import archiver from "archiver";
import fs from "fs";
import stream from "stream";

export const createProject = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id;
        console.log(userId)

        const newProject = await projectService.createProject({name,userId});

        res.status(201).json(newProject);

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }



}

export const getAllProject = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })
        
        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        })

        return res.status(200).json({
            projects: allUserProjects
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const addUserToProject = async (req,res) =>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
    
    try{

        const {projectId,users}=req.body;
        const loggedInUser = await userModel.findOne({
            email:req.user.email
        })
        const project = await projectService.addUserToProject({
            projectId,
            users,
            userId:loggedInUser._id
        })

        return res.status(200).json({
            project,
        })

    }catch(err){
            console.log(err);
            res.status(400).json({ error: err.message });
    }

}

export const getProjectById = async(req,res)=>{
    const  { projectId } =req.params;
    try{
        const project = await projectService.getProjectById({projectId});
        return res.status(200).json({project});

    }catch(error){
        console.log(error);
        res.status(400).json({ error: error.message });
    }
}

export const downloadProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const projectFolder = path.join(process.cwd(), "projects", projectId);

        console.log("Looking for project folder at:", projectFolder); // Debug log

        if (!fs.existsSync(projectFolder)) {
            return res.status(404).json({ error: 'Project folder not found' });
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=project_${projectId}.zip`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.directory(projectFolder, false);
        archive.pipe(res);
        archive.finalize();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const downloadZipFromFileTree = async (req, res) => {
    try {
        const { fileTree, zipName } = req.body;
        if (!fileTree || typeof fileTree !== 'object') {
            return res.status(400).json({ error: 'Invalid file tree' });
        }
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${zipName || 'project'}.zip`);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', err => { throw err; });
        archive.pipe(res);
        // fileTree: { "filename.js": { file: { contents: "..." } }, ... }
        for (const [filename, value] of Object.entries(fileTree)) {
            const contents = value.file?.contents || value.contents || '';
            archive.append(contents, { name: filename });
        }
        await archive.finalize();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
import http from 'http';
import 'dotenv/config';  // for ES6 syntax and environmental variables
import app from './app.js';  // Assuming your app.js is in the same directory
// import * as userController from './controllers/user.controller.js'; // Removed unused import
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';
import { spawn } from 'child_process';

// Add CORS headers middleware
app.use((_, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:'*'
    }
});


io.use(async(socket,next)=>{
    try{
        const token = socket.handshake.auth?.token ||  socket.handshake.headers.authorization?.split(' ')[1];

        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }


        socket.project = await projectModel.findById(projectId);





        if(!token){
            return next(new Error('Authentication Error'))
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return next(new Error('Authentication Error'))
        }

        socket.user = decoded;

        next();

    }catch(err){
        next(err);
    }
})

// Utility to emit logs to the frontend terminal via Socket.IO
function emitProjectLog(projectRoom, message, type = 'info') {
    io.in(projectRoom).emit('console_log', { message, type, timestamp: new Date().toISOString() });
}

// Utility to run a shell command and stream its output to the frontend terminal
function runCommandWithLogs(projectRoom, command, args = [], options = {}) {
    const child = spawn(command, args, { shell: true, ...options });
    emitProjectLog(projectRoom, `$ ${command} ${args.join(' ')}`, 'info');
    child.stdout.on('data', (data) => {
        emitProjectLog(projectRoom, data.toString(), 'info');
    });
    child.stderr.on('data', (data) => {
        emitProjectLog(projectRoom, data.toString(), 'error');
    });
    child.on('close', (code) => {
        emitProjectLog(projectRoom, `Process exited with code ${code}`, code === 0 ? 'info' : 'error');
    });
    return child;
}


io.on('connection', socket => {
    const projectRoom = socket.project._id.toString();
    console.log(`[SOCKET] User connected: ${socket.id}, Project: ${projectRoom}`);
    socket.join(projectRoom);
    console.log(`[SOCKET] ${socket.id} joined room: ${projectRoom}`);
    // Example: emit a log to the frontend when a user connects
    emitProjectLog(projectRoom, `[User connected: ${socket.id}]`, 'info');

    socket.on('project-message', async data => {
        console.log(`[SOCKET] ${socket.id} sending message to room ${projectRoom}:`, data);
        emitProjectLog(projectRoom, `[${socket.id}] ${JSON.stringify(data)}`, 'info');
        const message = data.message;
        const aiIsPresentInMessage = message.includes('@ai');

        if (aiIsPresentInMessage) {
            const prompt = message.replace('@ai', '');
            const result = await generateResult(prompt);
            socket.broadcast.emit('project-message', data);
            socket.broadcast.emit('project-message', {
                sender: 'BUTCH AI',
                message: result
            });
            socket.emit('project-message', {
                sender: 'BUTCH AI',
                message: result
            });
            return;
        }

        // User chat: broadcast to all in the room (including sender)
        io.to(projectRoom).emit('project-message', data);
    });
    socket.on('run-npm-install', () => {
        runCommandWithLogs(projectRoom, 'npm', ['install'], { cwd: process.cwd() });
    });
    socket.on('project-terminal-log', (data) => {
        console.log('[backend] Received project-terminal-log:', data); // Debug log
        emitProjectLog(projectRoom, data.message, data.type || 'info');
    });
    socket.on('event', () => { /* … */ });
    socket.on('disconnect', () => { /* … */ });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

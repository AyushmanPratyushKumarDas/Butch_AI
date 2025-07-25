import express from 'express';
import  morgan from 'morgan';//use to show logs of a route
import connect from './db/db.js'; 
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

connect();


const app = express();
app.use(cors());
app.use(morgan('dev'));
//middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/users',userRoutes);
app.use('/projects',projectRoutes);
app.use('/ai',aiRoutes);
app.use(cookieParser());
//routes
app.get('/',(req,res)=>{
res.send('hello');
});

export default app;

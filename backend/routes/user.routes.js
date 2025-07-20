import {Router} from 'express';
import * as userController from '../controllers/user.controller.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();


router.post('/register',
    body('email').isEmail().withMessage('Must be a valid Email address'),
    body('password').isLength({ min: 6 }).withMessage('Must be with length minimum 6'),
    userController.creatUserController);

//now create login route
router.post('/login',
        body('email').isEmail().withMessage('Must be a valid Email address'),
        body('password').isLength({ min: 6 }).withMessage('Must be with length minimum 6'),
        userController.loginController);
//profile router(protected) can be opened after login
router.get('/profile',authMiddleware.authUser, userController.profileController);
//for log_out
router.get('/logout', authMiddleware.authUser,userController.logoutController);
router.get('/all',authMiddleware.authUser,userController.getAllUserController);

export default router;
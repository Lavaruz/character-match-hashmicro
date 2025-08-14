import { Router } from 'express';
import { userCreate, userLogin, userLogout } from '../controllers/user.controller';
import { authLimiter } from '../configs/limiter';

const userRouter = Router();

userRouter.post('/login', authLimiter, userLogin);
userRouter.post('/register', authLimiter, userCreate);
userRouter.post('/logout', userLogout);

export default userRouter;

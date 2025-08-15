import { Router } from 'express';
import { userCreate, userLogin, userLogout } from '../controllers/user.controller';
import { authLimiter } from '../configs/limiter';
import { decryptBody } from '../configs/encription-helper';

const userRouter = Router();

userRouter.post('/login', authLimiter, decryptBody, userLogin);
userRouter.post('/register', authLimiter, decryptBody, userCreate);
userRouter.post('/logout', userLogout);

export default userRouter;

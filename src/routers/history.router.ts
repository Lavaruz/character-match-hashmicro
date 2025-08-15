import { Router } from 'express';
import { historyCheckMatch, historyDelete, historyGetAll, historyUpdate } from '../controllers/history.controller';
import { requireAuth } from '../configs/jwt';
import { historiesLimiter } from '../configs/limiter';
import { decryptBody } from '../configs/encription-helper';

const historyRouter = Router();

historyRouter.get('/', requireAuth, historyGetAll);
historyRouter.post('/check', requireAuth, historiesLimiter, decryptBody, historyCheckMatch);
historyRouter.put('/:id', requireAuth, historiesLimiter, decryptBody, historyUpdate);
historyRouter.delete('/:id', requireAuth, historiesLimiter, historyDelete);

export default historyRouter;

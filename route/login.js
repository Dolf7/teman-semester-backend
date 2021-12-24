import express from "express";

import { login, authenticateToken, user_after_log} from "../controllers/auth.js";

const router = express.Router();

router.get('/', authenticateToken, user_after_log);

router.post('/', login);

export default router;
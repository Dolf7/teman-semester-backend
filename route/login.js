import express from "express";

import { login } from "../controllers/users_c.js";

const router = express.Router();

router.post('/', login);

export default router;
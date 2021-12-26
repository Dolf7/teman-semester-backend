import express from "express";

import {token , delete_token} from "../controllers/auth.js";

const router = express.Router();

router.post('/', token);

router.delete('/', delete_token); //logout

export default router;
import express from "express";

import { getUsers, addUser, deleteUser, updateUser } from "../controllers/users_c.js";

const router = express.Router();

router.get('/', getUsers);

router.post('/', addUser);

router.delete('/:username', deleteUser);

router.patch('/:username', updateUser);

export default router;
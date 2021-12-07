import express from 'express'
import bodyParser from 'body-parser'
import mysql from 'mysql'
import cors from 'cors'
import bcrypt from 'bcrypt'

const app = express();
const PORT = 3001;

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));
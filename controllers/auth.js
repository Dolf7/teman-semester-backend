import { createRequire } from 'module';
import bcrypt, { genSalt } from "bcrypt";
import mysql from "mysql2"
import { request } from 'express';
import jwt from 'jsonwebtoken';
import { resourceLimits } from 'worker_threads';
const require = createRequire(import.meta.url);
require('dotenv').config();

const table = 'users';
const auth_table = 'auth_token';

const db = mysql.createConnection({
    host : process.env.db_host,
    user : process.env.db_user,
    database : process.env.db_database,
    password: process.env.db_password
})

db.connect((err) =>{
    if(err) throw err;
    console.log('mysql to auth is Connected');
})

db.query(`SET FOREIGN_KEY_CHECKS=0`, (err, result)=>{
    if(err) throw err;
})

export const token = ((req, res)=>{
    const refreshToken = req.body.token;
    db.query(`SELECT token FROM ${auth_table} WHERE token = "${refreshToken}"`, (err, result)=>{
        if(err) throw err;
        if(result[0] == null) return res.send("Token is Expires");
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
            if(err) throw err;
            const accessToken = generateAccesssToken({username:user.username});
            res.json(accessToken);
        })
    })
})

function authenticate(req, res) {
    const username = req.body.username;
    const user = {username:username};
    const accessToken = generateAccesssToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    db.query(`INSERT INTO ${auth_table} VALUES ("${refreshToken}", "${username}")`, (err, res)=>{
        if(err) throw err;
        console.log(`Refersh Token with username ${username} added to Database`);
    })
    res.json({"accessToken":accessToken, "refreshToken":refreshToken});
}

function generateAccesssToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1m'});
}

export const login = (req, res) =>{
    db.query(`SELECT * FROM ${table} WHERE username = "${req.body.username}"`, (err, result)=>{
        if(err) throw err;
        bcrypt.compare(req.body.password, result[0]["password"], (err, result)=>{
            if (err) throw err;
            if (result) {
                console.log("login successful");
                authenticate(req, res);
            } else {
                console.log("ID atau Password salah");
            }
        })
    })
}

export function authenticateToken(req, res, next){ // middleware to check authentication
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

export const user_after_log = ((req, res) => {
    db.query(`SELECT * FROM ${table} WHERE username = "${req.user.username}"`,(err, result) => {
       if (err) throw err;
       res.json(result);
    })
})

export const delete_token = ((req, res)=>{
    db.query(`DELETE FROM ${auth_table} WHERE token = "${req.body.token}"`, (err, result)=>{
        if(err) throw err;
        res.send("Logged Out");
    })
    res.sendStatus(204);
})

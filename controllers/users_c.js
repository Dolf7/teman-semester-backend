import { createRequire } from 'module';
import bcrypt, { genSalt } from "bcrypt";
import mysql from "mysql2"
import { request } from 'express';
import jwt from 'jsonwebtoken';
import { resourceLimits } from 'worker_threads';
const require = createRequire(import.meta.url);
require('dotenv').config

const table = 'users';

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    database : 'testing',
    password: 'dGVtYW5zZW1lc3Rlcgo='
})

db.connect((err) =>{
    if(err) throw err;
    console.log('mysql Connected');
})

export const getUsers = (req, res) =>{
    let sql = `SELECT * FROM ${table}`;
    db.query(sql, (err, result)=>{
        if(err) throw err;
        console.log(result);
        res.send(result);
    })
}

export const addUser = async function (req, res){
    const SaltRound = 10;
    const user = req.body;
    let sql = `INSERT INTO ${table} VALUES(`;
    Object.keys(user).forEach(key => {
        if(key == "password"){
            try {
                bcrypt.genSalt(SaltRound, (err, salt)=>{
                    bcrypt.hash(user[key], salt, (err, hash)=>{
                        sql += `"${hash}",`;        
                    })
                })
            } catch{
                res.sendStatus(501);
            }
        } else {
            sql += `"${user[key]}",`;
        }
    });
    setTimeout(()=>{
      sql = sql.slice(0, -1);
      sql += `)`;
      db.query(sql, (err, result)=>{
          if (err) throw err;
          console.log(result);
      })  
    }, 100);
    await res.send(`Success add user with username ${user['username']}`);
};

export const deleteUser = (req, res) => {
    const {username} = req.params;
    console.log(username);
    const sql = `DELETE FROM ${table} WHERE username = "${username}"`;
    db.query(sql, (err, result) =>{
        if (err) throw err;
        console.log(result);
    })
    res.send(`User with username ${username} delete from database`);
};

export const updateUser = (req, res)=>{
    const {username} = req.params;
    const updated = req.body;
    const saltRound = 10;
    let sql = `UPDATE ${table} SET `;
    Object.keys(updated).forEach(async function (key) {
        if (key == "password"){
            try {
                const salt = await bcrypt.genSalt(saltRound);
                const hash = await bcrypt.hash(updated['password'], salt);
                sql += ` ${key}= ${hash},`;
                res.sendStatus(201);
            } catch{
                res.sendStatus(501);
            }
        } else if(key == "username"){
            res.send("you can't change the username");
            res.sendStatus(501);
            return;
        } else 
        sql += ` ${key}="${updated[key]}",`;
    })
    setTimeout(function(){
        sql = sql.slice(0, -1);
        sql += ` WHERE username="${username}"`;
        db.query(sql, (err, result)=>{
            if(err) throw err;
            console.log(result);
            res.send(`Account with username "${username}" has been updated`)
        }, 1000);
    })
}

function authenticate(req, res) {
    let user;
    db.query(`SELECT ID FROM ${table} WHERE username = "${req.body.username}"`, (err, result)=>{
        if(err) throw err;
        user = {name : req.body.username};
        const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET);
        res.json({accessToken:accessToken})  
    })
}

export const login = (req, res) =>{
    db.query(`SELECT FROM ${table} WHERE username = "${req.body.username}"`, (err, result)=>{
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

export function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        if (err) return res.sendStatus(403);
        req.user = user;
        // res.send(user);
        next();
    });
}

export const user_after_log = ((req, res) => {
    db.query(`SELECT * FROM ${table} WHERE ID = "${req.user.id.ID}"`,(err, result) => {
       if (err) throw err;
       res.json(result);
    })
})
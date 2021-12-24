import { createRequire } from 'module';
import bcrypt, { genSalt } from "bcrypt";
import mysql from "mysql2"
import { request } from 'express';
import jwt from 'jsonwebtoken';
import { resourceLimits } from 'worker_threads';
const require = createRequire(import.meta.url);
require('dotenv').config();

const table = 'users';

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    database : 'testing',
    password: process.env.db_password
})

db.connect((err) =>{
    if(err) throw err;
    console.log('mysql Connected');
})

export const getUsers = (req, res) =>{
    let sql = `SELECT * FROM ${table} where username`;
    db.query(sql, (err, result)=>{
        if(err) throw err;
        console.log(result);
        res.send(result);
    })
}

export const addUser = async function (req, res){
    const saltRound = 10;
    const user = req.body;
    let sql = `INSERT INTO ${table} VALUES(`;
    Object.keys(user).forEach(key => {
        if(key == "password"){
            try {
                bcrypt.genSalt(saltRound, (err, salt)=>{
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

export const updateUser = async function (req, res){
    const saltRound = 10;
    const user = req.body;
    const {username} = req.params;
    let sql = `UPDATE ${table} SET`;
    Object.keys(user).forEach(key => {
        if(key == "password"){
            try {
                bcrypt.genSalt(saltRound, (err, salt)=>{
                    bcrypt.hash(user[key], salt, (err, hash)=>{
                        sql += ` ${key}="${hash}",`;        
                    })
                })
            } catch{
                res.sendStatus(501);
            }
        } else {
            sql += `${key}="${user[key]}",`;
        }
    });
    setTimeout(()=>{
      sql = sql.slice(0, -1);
      sql += ` WHERE username = "${username}"`;
      db.query(sql, (err, result)=>{
          if (err) throw err;
          console.log(result);
      })  
    }, 100);
    await res.send(`Success update user with username "${username}"`);
};

const express = require('express');
const userRouter = express.Router();
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

userRouter.get('/',(req,res)=>{
    res.send('Hello World');
})

// signup
userRouter.post('/signup',async(req,res)=>{
    console.log(req.body);
    const {email,password,username} = req.body;
    try{
        // check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
        if(existingUser.rows.length > 0){
            return res.status(400).json({message:'User already exists'});
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await pool.query('INSERT INTO users (email,password,username) VALUES ($1,$2,$3) RETURNING *',[email,hashedPassword,username]);
        const token = jwt.sign({id:user.rows[0].id},process.env.JWT_SECRET,{expiresIn:'1h'});
        res.json({user: user.rows[0], token});
    }catch(error){
        console.error(error);
        res.status(500).json({message:'Internal server error'});
    }
})

//login
userRouter.post('/login',async(req,res)=>{
    const {email,password} = req.body;
    try{
        const user = await pool.query('SELECT * FROM users WHERE email = $1',[email]);
        if(user.rows.length === 0){
            return res.status(401).json({message:'User doesnot exist'});
        }
        const validPassword = await bcrypt.compare(password,user.rows[0].password);
        if(!validPassword){
            return res.status(401).json({message:'Invalid credentials'});
        }
        const token = jwt.sign({id:user.rows[0].id},process.env.JWT_SECRET,{expiresIn:'1h'});
        res.status(200).json({token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:'Internal server error'});
    }
})

module.exports = userRouter;
const express = require("express");
const app = express();
const cors = require('cors');
const dotenv = require('dotenv').config();
const pool = require('./src/db');
const userRouter = require("./src/routes");

app.use(cors());
app.use(express.json());
app.use('/api/v1/users',userRouter);



function main(){
    app.listen(process.env.PORT,()=>{
        console.log(`Listening at port ${process.env.PORT}`)
    })
}

main();


import express from 'express';
const app = express();
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import {router} from './routes/router';


import {httpLogger} from './httpLogger'

dotenv.config();

const uri =  'mongodb://0.0.0.0:27017'

//mongo db connection
mongoose
 .connect(uri)
 .then(()=>console.log("Database connected"))
 .catch((err:any) => {
    console.log(err);
});


app.use(cors());
app.use(express.json());
app.use(httpLogger)

//router 
app.use(router);

const PORT = 3000
app.listen(PORT || 5000, () => {
    console.log("node server.js 3000");
});




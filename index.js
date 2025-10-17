const express=require('express');
const app=express();

require("dotenv").config();
const PORT = process.env.PORT || 4000;

//cookie-parser-> what is this? and why do we need this?
const cookieParser=require('cookie-parser');



//middleware
app.use(express.json());
app.use(cookieParser());

const {connect}=require("./config/database");
connect();

//route import and mount
const user=require("./routes/user");
app.use("/api/v1",user);

//server activation
app.listen(PORT,()=>{
    console.log(`App is listening at port ${PORT}`);
})
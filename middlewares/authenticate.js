//creating middleware
//auth , isStudent, isAdmin

const jwt=require('jsonwebtoken');
require("dotenv").config();

exports.auth=(req,res,next)=>{
    try{
        //extract jwt token  


        console.log("cookie",req.cookies?.token);
        console.log("body",req.body?.token);
        console.log("header",req.header("Authorization"));

        // cookie body or req body or req header where there is a key-value pair -> Authorization: Bearer <Token>
        const token= req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");//be careful there is a space after 'Bearer'
        if(!token)
        {
            return res.status(401).json({
                success:false,
                message:'Token missing'
            });
        }

        //verify the token(checking authenticity)
        try{//current token and secret key needed for verification
            const payload=jwt.verify(token,process.env.JWT_SECRET);//returns a decoded object
            console.log(payload);

            //req.user is not built-in, but your middleware creates it dynamically.
            req.user=payload;//store payload in request
        }catch(error){
             return res.status(401).json({
                success:false,
                message:'Token is invalid'
            });
        }
        next();//to go to next middleware
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'Something went wrong while verifying the token'
        });
    }
}


exports.isStudent=(req,res,next)=>{
    try{
        if(req.user.role !== 'Student')
        {
            return res.status(401).json({
                success:false,
                message:'Protected routes for students'
            });
        }
        next();
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'User role is not matching'
        });
    }
}

exports.isAdmin=(req,res,next)=>{
    try{
        if(req.user.role !== 'Admin')
        {
            return res.status(401).json({
                success:false,
                message:'Protected routes for admin'
            });
        }
        next();
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'User role is not matching'
        });
    }
}
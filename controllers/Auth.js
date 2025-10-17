const bcrypt=require('bcrypt');//to import bcrypt library  ..... npm i bcrypt
const User=require("../models/User");
const jwt=require('jsonwebtoken');


require("dotenv").config();


async function passwordHash(password,saltRound=10,retry=3) {
    for(let turn=1;turn<=retry;turn++)
    {
        try{
            return await bcrypt.hash(password,saltRound);
        }
        catch(error){
            console.log(`Hash attemp ${turn} failed: ${error.message}`);
            if(turn === retry)
            {
                throw new Error("Password hashing failed after multiple retries");
            }
        }
    }
}

//signup route handler
exports.signup= async(req,res)=>{
    try{
        //extract
        const {name,email,password,role}=req.body;
        //check if user already exists or not
        const existingUser=await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User already exists'
            });
        }

        //secure password
        let hashedPassword;
        try{
            hashedPassword=await passwordHash(password);//password and number of rounds
        }

        catch(error)
        {
            return res.status(500).json({
                success:false,
                message:'Error in hashing password'
            });
        }

        //create entry for User
        const user=await User.create({
            name,email,password:hashedPassword,role
        });

        return res.status(200).json({
            success:true,
            message:'User created successfully'
        });
        
    }
    catch(error){
         console.log(error);
         return res.status(500).json({
            success:false,
            message:"User cannot be registered, please try again later"
         });
    }

}


//login
exports.login= async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password)
        {
            return res.status(400).json({
                success:false,
                message:"Please fill all details carefully",
            });
        }

        //check for registred user
        let user= await User.findOne({email});

        //if not a registered user
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User is not registered sign up first!!",
            });
        }


        const payload={
            email:user.email,
            id:user._id,
            role:user.role,
        }

        //verify password and generate a JWT token
        if(await bcrypt.compare(password,user.password)){
            //password matched

            //create token
            let token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });//expiry also set

            user=user.toObject();
            user.token=token;//creates token field in user and insert token in it

            //hide password
            user.password=undefined;//removed password from the user object NOTE: password is not removed from database
            //So that hacker's don't steal your password

            const options={//expiry of the cookie
                expires: new Date(Date.now()+ 3*24*60*60*1000),//is calculating 3 days in milliseconds that's why *1000.
                httpOnly:true
            }

            //send cookie in response
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'User Logged in successfully'
            });//cookie name,cookie data, options
              //token and user are variables already defined in your code.
             //Using the shorthand just makes it cleaner — no need to repeat token: token.
        }
        else{
            //password do not match
            return res.status(403).json({
                success:false,
                message:"Password incorrect",
            });
        }

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login failure'
        });
    }
}
const express=require('express');
const router=express.Router();

const User=require('../models/User');

const {login,signup}=require("../controllers/Auth");
const {auth,isStudent,isAdmin}=require("../middlewares/authenticate");

router.post("/signup",signup);
router.post("/login",login);


//testing protected route for single middleware
router.get("/test",auth,(req,res)=>{
    res.json({
        success:true,
        message:'Welcome to the protected route for TESTS'
    })
})
//protected routes (protected using middlewares)
router.get("/student",auth,isStudent,(req,res)=>{
    res.json({
        success:true,
        message:'Welcome to the protected route for students'
    });
});

router.get("/admin",auth,isAdmin,(req,res)=>{
    res.json({
        success:true,
        message:'Welcome to the protected route for admin'
    });
});


router.get('/getEmail',auth, async(req,res)=>{
    try{
        const id=req.user.id;
        console.log("ID:",id);

        const userInfo=await User.findById(id);

        res.status(200).json({
            success:true,
            user:userInfo
        });
    }
    catch(error){
        res.status(401).json({
            success:false,
            error:error.message,
            message:"Error in getting user details"
        });
    }
});

module.exports=router;


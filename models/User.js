const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true, 
    },
    role:{
        type:String,
        enum:["Admin","Student","Visitor"]
    }
});

module.exports=mongoose.model("user",userSchema);

//trim: true
//means that any leading and trailing whitespace will automatically be removed from the string before it’s saved to the database.
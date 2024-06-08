const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()



const userSchema = new mongoose.Schema({
    fullName:{type:String},
    phone:{type:Number},
    email:{type:String},
    password:{type:String},
    image:{type:String}

},{timestamps:true})
//functions to check the user does exist or not
userSchema.statics.findByEmailAndPhone = async ({email,phone})=>{
    const userEmailExist = await UserModel.findOne({email})
    const userPhoneExist = await UserModel.findOne({phone})
    if(userEmailExist||userPhoneExist){
        throw new Error("User Already Exist")
    }
    return false
}
userSchema.statics.findByEmailAndPassword = async ({email,password})=>{
    const user = await UserModel.findOne({email})
    if(user){
        console.log(password,user.password);
        const doesPasswordMatch = await bcrypt.compare(password,user.password)
        console.log(doesPasswordMatch);
        if(!doesPasswordMatch) {throw new Error("Password Doesn't Match")}
        return user
    }
    else{
        throw new Error("User Doesn't Exist")
    }
   
}


//methods to generate jwt token
userSchema.methods.generateJwtToken = function(){
    return jwt.sign({user:this._id.toString()},'mark-down',{expiresIn:'12h'})
}
userSchema.pre('save',function(next){
    const user = this;  
    if(!user.isModified('password')) return next();
    bcrypt.genSalt(10,(error,salt)=>{
        if(error) return next(error)
        bcrypt.hash(user.password,salt,(error,hash)=>{
            if(error) return next(error)
            user.password =hash
        return next()
    })
    })
})
 
const UserModel = mongoose.model('user',userSchema)

module.exports = UserModel
const joi = require('joi')

 const validateSignUp =(userData)=>{
    const Schema = joi.object({
        fullName:joi.string().required(),
        phone:joi.number().required(),
        email:joi.string().email().required(),
        password:joi.string().required(),
        image:joi.string()
    })
    return Schema.validateAsync(userData)
}
const validateSignIn =(userData)=>{
    const Schema = joi.object({
        email:joi.string().email().required(),
        password:joi.string().required()
    })
    return Schema.validateAsync(userData)
}


module.exports={
    validateSignUp,
    validateSignIn 

}
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        minLength:[6,'email must be atleast 6 characters long'],
        maxLength:[50,'email must be atmost 50 characters long'],
    },
    password:{
        type:String,
        select:false,//don't send to frontend
    }
})

//some important methods

userSchema.statics.hashPassword = async function(password){
return await bcrypt.hash(password,10);//returns hashed password
}

userSchema.methods.isValidPassword = async function (password) {
    console.log(password, this.password);
    return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateJWT = function(){
    return jwt.sign(
        {email:this.email},
        process.env.JWT_SECRET,
        {expiresIn: '24h'}
);
}
const User = mongoose.model('user',userSchema);
export default User;
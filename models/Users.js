import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true},
});


UserSchema.pre('save' , async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password , this.password);
}

export default mongoose.model("User", UserSchema);


// This user schema shows us the structure of User collection in mongodb also we encrypt password before saving it to database
// I have created a comparePassword method for the object of UserSchema which can be used by any object of this schema.
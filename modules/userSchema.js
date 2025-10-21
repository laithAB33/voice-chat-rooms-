import mongoose,{ Schema } from "mongoose";
import validator from "validator";
const {isEmail} = validator;

const userSchema = new Schema({
    name:{
        type:String,
        required: [true,"name of the user is required"],
        trim: true 
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true
    },
    userName: {
        type: String,
        required: true, 
        unique: [true, "allready used username"],
        trim: true       // إزالة المسافات
    },
    email: {
        type: String,
        validate:{
            validator: isEmail,
            message: "this is not a valid email"
        },
        unique: [true, "invalid email or password"],
        require:[true,"the email is required"],
        minLength: 15,
    },
    password: {
        type: String,
    },
    profileImage: {
        url:{
            type:String,
            default:null,
        },
        public_id:{
            type:String,
            default:null,
        }     
    },
    isOnline: {
        type: Boolean,
        default: false   
    },
    lastSeen: {
        type: Date,
        default: Date.now 
    },
    refreshToken:{
        type: String,
    },
    accessToken:{
        type:String,
    }
}, {
    timestamps: true     // يضيف createdAt و updatedAt تلقائياً
});

let User = mongoose.model('User', userSchema);

export{User}
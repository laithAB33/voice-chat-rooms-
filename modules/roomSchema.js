import mongoose,{ Schema } from "mongoose";
import { AppError } from "../utils/appError.js";

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 4,
    },
    description: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        unique: [true,"user can crate only one room"]
    },
    participants:{ 
        default:[],
        type:[{
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['member', 'admin','owner'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        hasVoiceAccess:{
            type:Boolean,
            default:false
        },
        isMuted:{
            type:Boolean
        },
        isSpeaking:{
            type:Boolean
        }
    }]
    },
    isActive: {
        type:String,
        default:"active",
        enum: ['notactive', 'active',],
    },
    maxParticipants: {
        type: Number,
        default: 50
    },
    maxVoiceParticipants:{
        type:Number,
        default:4
    },
    image: {
        url:{
            type:String,
            default:null,
        },
        public_id:{
            type:String,
            default:null,
        }     
    },
    banList:{
        default:[],
        type:[{
            userID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            start:{
                type:Date,
                default:Date.now(),
            },
            end:{
                type:Date,
                default:null
            },
        }]
    },
    chatActive:{
        type:String,
        default:"active",
        enum: ['notactive', 'active',],
    }

}, {
    timestamps: true
});

roomSchema.methods.isFull = function(){
    return this.participants.length >= this.maxParticipants
}

roomSchema.methods.addPerson = async function(userID,role){

    if(this.participants.find( user => String(user.userID) === String(userID) )) return;

    this.participants.push({userID,role});

    await this.save();
}

roomSchema.methods.removePerson = async function(userID){

    this.participants = this.participants.filter(user => String(user.userID) != String(userID));

    return this.save();
} 

let Room = mongoose.model('Room', roomSchema);

export {Room};
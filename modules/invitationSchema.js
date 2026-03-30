import mongoose,{Schema} from "mongoose";

const invitationSchema = new Schema({
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Room",
        required:true,
    },
    delivered:{
        type:Boolean,
        default:false
    },
    type:{
        type:String,
        enum: ['toRoom', 'toVoiceSeat'],
    }
}, {
    timestamps: true
});

let Invitation = mongoose.model('invitation', invitationSchema);

export{Invitation};
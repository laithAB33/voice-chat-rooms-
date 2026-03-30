import mongoose,{Schema} from "mongoose";

const priviteMessageSchema = new Schema({
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
    message: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file','system'],
        default: 'text'
    },
    fileUrl: {
        url:{
            type:String,
            default:null,
        },
        public_id:{
            type:String,
            default:null,
        }
    },
    delivered:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
});

let PriviteMessage = mongoose.model('priviteMessage', priviteMessageSchema);

export{PriviteMessage};
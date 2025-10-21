import mongoose,{Schema} from "mongoose";

const messageSchema = new Schema({
    roomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
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
    }
}, {
    timestamps: true
});

messageSchema.index({ roomId: 1, createdAt: 1 });

let Message = mongoose.model('Message', messageSchema);

export{Message};
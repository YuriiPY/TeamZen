import mongoose from "mongoose";    

export const projectsSchema = new mongoose.Schema({
    clientIp: {
        type: String,
        require: true
    },
    projectName: {
        type:String,
        require: true        
    },
    tasks: [{
        TaskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tasks'
        }
    }],
    status: {
        type: String,
        enum: ["process", "completed", "postponed"],
        default: "process"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
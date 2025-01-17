import mongoose from "mongoose"

export const projectsSchema = new mongoose.Schema({
    projectName: {
        type:String,
        require: true        
    },
    tasks: [{
        name: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: false,
            enum: ["process", "completed"], 
            default: "process"
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
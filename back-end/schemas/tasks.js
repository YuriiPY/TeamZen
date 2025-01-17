import mongoose from "mongoose"

export const tasksSchema = new mongoose.Schema({
    taskName: {
        type: String,
        require: true
    },
    createTime: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updateTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["added", "process", "completed", "postponed"],
        default: "added"
    }
}, { timestamps: true });

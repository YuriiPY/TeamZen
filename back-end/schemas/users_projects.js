import mongoose from "mongoose"

export const userProjectsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'projects',
        required: true
    },
    assignedAt: {
        type: Date,
        default: Date.now
    }
});
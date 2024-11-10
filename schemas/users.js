import mongoose from "mongoose";

import {Roles} from '../constants.js'

export const usersSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        min: [18, "Users must be adults"],
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password:  {
        type: String,
        required: true,
        min: [3, "password must be at least charac"]
    },
    role: {
        type: String,
        enum: [Roles.ADMIN, Roles.USER],
        default: Roles.USER
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

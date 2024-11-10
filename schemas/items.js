import mongoose from "mongoose";

import {enumList} from '../constants.js'

export const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: enumList,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        required: true,
        default: true
    },
    description: {
        type: String,
        default: 'No description provided'
    }
});
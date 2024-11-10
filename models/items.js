import mongoose from 'mongoose'

import {itemsSchema} from '../schemas/items.js'

const Items = mongoose.model("items", itemsSchema);

export default Items;
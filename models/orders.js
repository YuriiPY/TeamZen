import mongoose from 'mongoose'

import {orderSchema} from '../schemas/orders.js'

const Orders = mongoose.model("orders", orderSchema);

export default Orders;
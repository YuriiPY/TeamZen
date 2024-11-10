import express from "express"; 
import mongoose from "mongoose";

import UsersRouter from './routes/users.js';
import OrdersRouter from './routes/order.js'
import ItemsRouter from './routes/items.js'

const PORT = 3000;
const DATABASE_URL = 'mongodb://localhost:27017/'

const server = express();

server.get('/', (req, res) => {
    res.send('Hello world');
    // res.send(dymmyData)
});

server.use(express.json());
server.use('/users', UsersRouter);
server.use('/orders', OrdersRouter);
server.use('/items', ItemsRouter);

server.listen(PORT, async () => {
    console.log(`Server listens on port${PORT}`)
    try {
        await mongoose.connect(DATABASE_URL);  
        console.log(`Database connected at URL${DATABASE_URL}`)  
    }catch (error) {
        console.log(error);
    }
});
import express from "express"
import mongoose from "mongoose"
import morgan from "morgan";

import ProjectsRouter from './routes/projects.js'
import UsersRouter from './routes/users.js'

const PORT = 4000;
const DATABASE_URL = 'mongodb://localhost:27017/'

const server = express();

server.use(morgan('dev'));
server.get('/', (req, res) => {
    res.send('Hello world');
});

import cors from 'cors'

server.use(cors({ origin: 'http://localhost:3000' }));
server.use(express.json());
server.use('/project', ProjectsRouter);
server.use('/user', UsersRouter);

server.set('trust proxy', true);

server.listen(PORT, async () => {
    console.log(`Server listens on port${PORT}`)
    try {
        await mongoose.connect(DATABASE_URL);  
        console.log(`Database connected at URL${DATABASE_URL}`)  
    }catch (error) {
        console.log(error);
    }
}); 
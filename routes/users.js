import express from "express";
import jwt from 'jsonwebtoken';

import Users from "../models/users.js";
import { JWT_SECRET, Roles } from "../constants.js"
import { authorizationMiddleware } from "../middleware/auth.js";
import { adminCheckMiddleware } from "../middleware/roleCheck.js";
export const router = express.Router();


router.get('/hello', async (req, res) => {
    res.send('Hello world from user router')
});

router.get('/', async (req, res) => {
    try {
        const allUsers = await Users.find();
        res.send(allUsers);
    } catch (error) {
        console.log(error),
            res.status(500).send(error.message);
    }
})

router.post('/signup', async (req, res) => {
    if (!req.body) {
        return res.status(400).send('No body provided')
    }
    const { email, password } = req?.body;

    if (!email || !password) {
        return res.status(400).send('fill required fields');
    }


    try {
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).send("Users with this email allready exist")
        }
        const newUser = await Users.create({ email, password });
    } catch (error) {
        res.status(500).send(error.message);
    }
    res.send("Users was created")
})

router.post('/login', async (req, res) => {
    const { email, password } = req?.body;

    if (!email || !password) {
        return res.status(400).send('No cridentials provided');
    }

    try {
        const existingUser = await Users.findOne({ email });
        if (!existingUser) {
            return res.status(401).send("Invalid credentials");
        }
        const token = jwt.sign({ id: existingUser._id, email: existingUser.email, role: existingUser.role }, JWT_SECRET, { expiresIn: '15m' });
        res.status(200).send(token)
    } catch (error) {
        res.status(500).send(error.message);
    }
})

router.get('/me', authorizationMiddleware, async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(400).send("No token provided");
    }

    try {
        const user = req.userVer;

        return res.status(200).send(user);
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

router.patch('/:id', authorizationMiddleware, async (req, res) => {
    const userToUpdateId = req.params.id;
    const { firstName, lastName, age, password, role, email } = req.body;
    const token = req.headers.authorization;
    try {
        const verificationResult = jwt.verify(token, JWT_SECRET);

        if (!verificationResult) {
            return res.status(401).send("Invalid token");
        }

        const user = req.userVer;


        if (userToUpdateId !== user.id && user.role !== Roles.ADMIN) {
            return res.status(403).send('Not allowed to update');
        }

        const userToUpdate = await Users.findById(userToUpdateId);
        if (!userToUpdate) {
            return res.status(400).send("User to update not found");
        }

        const updatedUser = await Users.updateOne(userToUpdateId, { firstName, lastName, age, password, role, email }, { new: true });
        return res.status(200).send(updatedUser);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/all', adminCheckMiddleware, async (req, res) => {

    try {
        const user = req.userVer;

        const users = await Users.find();
        return res.status(200).send(users);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.delete('/:id', authorizationMiddleware, async (req, res) => {
    const userToDeleteId = req.params.id;

    try {
        const user = req.userVer;

        if (userToDeleteId !== user.id && user.role !== Roles.ADMIN) {
            return res.status(403).send("Operation not allowed");
        }

        const deletedUser = await Users.findOneAndDelete({ _id: userToDeleteId });
        return res.status(200).send(deletedUser);
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.get('/singleEndpointMiddleware', (req, res) => {
    return res.status(200).send("Response");
});
export default router;
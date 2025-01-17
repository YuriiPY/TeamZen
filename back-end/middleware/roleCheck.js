import jwt from 'jsonwebtoken';

import Users from "../models/users.js";
import { JWT_SECRET, Roles} from "../constants.js";


export const adminCheckMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send("NO token provided")
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);

        const user = await Users.findById(verified.id);

        if (!user) {
            return res.status(404).send('User not found');
        } else if (user.role !== Roles.ADMIN) {
            return res.status(404).send('Access denied');
        } 

        req.userVer = user;
        next();

    } catch (error) {
        res.status(401).send("Invalid token");
    }
};
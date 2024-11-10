import express from "express";
import jwt from 'jsonwebtoken';

import Items from "../models/items.js";
import Orders from "../models/orders.js";
import { JWT_SECRET, Roles } from "../constants.js";
import { authorizationMiddleware } from "../middleware/auth.js";
import { adminCheckMiddleware } from "../middleware/roleCheck.js";
import Users from "../models/users.js";
export const router = express.Router();

router.post('/add', authorizationMiddleware, async (req, res) => {
    if (!req.body) {
        return res.status(400).send('No body provided')
    }

    const user = req.userVer;
    const items = req?.body.items;

    try {
        if (!items || items.lenght === 0) {
            return res.status(400).send("Items can`t be empty");
        }

        let totalAmount = 0;
        let orderItems = [];

        for (const itemData of items) {
            const { itemId, quantity } = itemData;
            if (!quantity || quantity === 0) {
                continue
            }

            const item = await Items.findById(itemId);

            if (!item) {
                return res.status(400).send(`Item with id -> ${itemId} not found`)
            }

            if (item.available === false) {
                return res.status(400).send(`Item -> ${item.name} not available now, Sorry:)`)
            }

            orderItems.push({ itemId: itemId, quantity, quantity, price: item.price });
            totalAmount += item.price * quantity;
        }

        const newOrder = await Orders.create({
            userId: user._id,
            items: orderItems,
            totalAmount: totalAmount,
            status: 'pending',
            createdAt: Date.now()
        });

        return res.status(200).send({
            message: "Order sucssesfuly created!",
            order: newOrder
        })
    } catch (error) {
        res.status(500).send(error.message);
    }

});


router.patch('/edite', authorizationMiddleware, async (req, res) => {
    if (!req.body) {
        return res.status(400).send('No body provided')
    }

    const user = req.userVer;
    const { orderId, updates } = req?.body;

    try {
        if (!updates || Object.keys(updates).length === 0) {
            // DELETE Order if updates is empty 
            // const deletedOrder = await Orders.findByIdAndDelete(orderId);

            // if (!deletedOrder) {
            //     return res.status(500).send("Something went wrong :(")
            // }

            // return res.status(200).send(`Order by id ${deletedOrder.id} was deleted`); 

            return res.status(400).send("Updates can`t be empty");
        }

        let totalAmount = 0;
        let orderItems = [];

        for (const itemData of updates) {
            const { itemId, quantity } = itemData;
            if (!quantity || quantity === 0) {
                continue
            }

            const item = await Items.findById(itemId);

            if (!item) {
                return res.status(400).send(`Item with id -> ${itemId} not found`)
            }

            if (item.available === false) {
                return res.status(400).send(`Item -> ${item.name} not available now, Sorry:)`)
            }

            orderItems.push({ itemId: itemId, quantity, quantity, price: item.price });
            totalAmount += item.price * quantity;
        }

        const updatedOrder = await Orders.findByIdAndUpdate(
            { _id: orderId, userId: user.id },
            { items: orderItems, totalAmount: totalAmount},
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).send("Order not found or You are`t autohorized to edit this order")
        }

        return res.status(200).send({
            message: "Order sucssesfuly updated!",
            order: updatedOrder
        })

    } catch (error) {
        res.status(500).send(error.message);
    }

});

router.delete('/delete', authorizationMiddleware, async (req, res) => {
    if (!req.body) {
        return res.status(400).send('No body provided')
    }

    const user = req.userVer;
    const { orderId } = req?.body;

    try {
        const deletedOrder = await Orders.findByIdAndDelete(
            { _id: orderId, userId: user.id }
        );

        if (!deletedOrder) {
            return res.status(404).send("Order not found or You are`t autohorized to edit this order")
        }

        return res.status(200).send("Order sucssesfuly deleted!")

    } catch (error) {
        res.status(500).send(error.message);
    }

});

router.get('/find/:id', authorizationMiddleware, async (req, res) => {
    const user = req.userVer;
    const orderId = req.params.id;

    try {
        if (!orderId) {
            return res.status(404).send("No order ID provided!")
        }

        const order = await Orders.findOne({ _id: orderId, userId: user.id })

        if (!order) {
            return res.status(404).send("Order not found or You are`t autohorized to edit this order")
        }

        return res.status(200).send({
            message: "Order sucssesfuly deleted!",
            order: order
        })

    } catch (error) {
        res.status(500).send(error.message);
    }

});

router.get('/get-all', authorizationMiddleware, async (req, res) => {
    const user = req.userVer;
    try {
        const orders = await Orders.find({ userId: user.id })

        if (orders.length === 0) {
            return res.status(404).send("Order not found or You are`t autohorized to edit this order")
        }

        return res.status(200).send({
            message: "Your orders:",
            orders: orders
        })

    } catch (error) {
        res.status(500).send(error.message);
    }

});

router.patch('/get-all/:userId', adminCheckMiddleware, async (req, res) => {
    const userId = req.params.userId
    try {
        const user = await Users.findById(userId);

        if (!user) {
            return res.status(404).send("User not found")
        }

        const orders = await Orders.find({ userId: userId })

        if (orders.length === 0) {
            return res.status(404).send(`${user.firstName} don\`t have orders`)
        }

        return res.status(200).send({
            message: `${user.firstName}\`s orders: `,
            orders: orders
        })

    } catch (error) {
        res.status(500).send(error.message);
    }

});

export default router;
import express from "express";
import jwt from 'jsonwebtoken';

import Items from "../models/items.js";
import { JWT_SECRET } from "../constants.js"
import { authorizationMiddleware } from "../middleware/auth.js";
import { adminCheckMiddleware } from "../middleware/roleCheck.js";
export const router = express.Router();

router.post('/add-item', adminCheckMiddleware, async (req, res) => {
    if (!req.body) {
        return res.status(400).send('No body provided')
    }

    const { name, category, price, available, description } = req?.body;


    try {
        const isItemExist = await Items.findOne({ name });
        if (isItemExist) {
            return res.status(400).send("Items with same name already exist")
        }
        const Item = await Items.create({
            name,
            category,
            price,
            available,
            description
        });

        return res.status(200).send(`Items -> ${Item.name} was created`);
    } catch (error) {
        res.status(500).send(error.message);
    }

});

router.post('/add-items', adminCheckMiddleware, async (req, res) => {
    // Перевірка, чи є тіло запиту
    if (!req.body || !Array.isArray(req.body)) {
        return res.status(400).send('No valid body provided. Expected an array of items.');
    }

    const items = req.body;

    try {
        // Перевірка на наявність предметів з такою ж назвою
        const existingItems = await Items.find({name: {$in: items.map(item => item.name)}});

        // Якщо знайдено такі ж предмети
        if (existingItems.length > 0) {
            const existingNames = existingItems.map(item => item.name);
            return res.status(400).send({
                message: "Some items with the same name already exist.",
                existingNames: existingNames
            });
        }

        // Додавання нових предметів до бази даних
        const newItems = await Items.insertMany(items);

        return res.status(200).send({
            message: `${newItems.length} items were successfully created!`,
            newItems: newItems
        });

    } catch (error) {
        // Обробка помилки
        console.error(error);
        res.status(500).send({
            message: "An error occurred while adding items.",
            error: error.message
        });
    }
});

router.patch('/update-item/:id', adminCheckMiddleware, async (req, res) => {
    if (!req.body) {
        return res.status(400).send('No body provided')
    }

    const itemId = req.params.id;
    const updates = req.body;

    try {
        const isItemExist = await Items.findById(itemId);
        if (!isItemExist) {
            return res.status(404).send("Items not found");
        }

        const updatedItem = await Items.findByIdAndUpdate(
            itemId,
            updates,
            { new: true, runValidators: true }
        )

        if (!updatedItem) {
            return res.status(500).send("Something went wrong :(")
        }

        return res.status(200).send({
            message: `Item -> ${updatedItem.name} was updated successfully.`,
            newData: updatedItem
        });

    } catch (error) {
        res.status(500).send(error.message);
    }

});

router.delete('/delete-item/:id', adminCheckMiddleware, async (req, res) => {
    if (!req.body) {
        return res.status(400).send('No body provided')
    }

    const itemId = req.params.id;

    try {
        const isItemExist = await Items.findById(itemId);
        if (!isItemExist) {
            return res.status(404).send("Items not found");
        }

        deletedItem = await Items.findByIdAndDelete(itemId)

        return res.status(200).send({
            message: `Item -> ${updatedItem.name} was deleted successfully.`,
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/get-items/:id', async (req, res) => {
    const itemId = req.params.id;

    try {
        const item = await Items.findById(itemId);

        if (!item) {
            return res.status(404).send("Item not found");
        }

        return res.status(200).send(`Your item:\n ${item}`)
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/get-items', async (req, res) => {
    try {
        const items = await Items.find();

        if (!items) {
            return res.status(500).send("Something went wrong :(");
        }

        return res.status(200).send(items);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/pag-get-items', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skipItems = (page - 1) * limit;

    try {
        const items = await Items.find().skip(skipItems).limit(parseInt(limit)).exec();

        if (!items) {
            return res.status(500).send("Something went wrong :(");
        }

        const totalItems = await Items.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).send({
            items,
            totalItems,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/price/:maxPrice', async (req, res) => {
    const maxPrice = parseInt(req.params.maxPrice);

    try {
        const items = await Items.find({ price: { $lt: maxPrice } });

        if (!items) {
            return res.status(500).send("Something went wrong :(");
        }

        return res.status(200).send({
            message: `Items found ${items.length}`,
            items: items
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/available', async (req, res) => {

    try {
        const items = await Items.find({ available: true });

        if (!items) {
            return res.status(500).send("Something went wrong :(");
        }

        return res.status(200).send({
            message: `Items found ${items.length}`,
            items: items
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default router;
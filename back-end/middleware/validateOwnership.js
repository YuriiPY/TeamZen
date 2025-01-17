import express from "express";
import UserProject from "../models/users_projects.js";


export async function validateOwnership(req, res, next) {
    const { project_id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).send("User ID is required.");
    }

    try {
        const userProject = await UserProject.findOne({ userId, projectId: project_id });

        if (!userProject) {
            return res.status(403).send("Access denied. You do not own this project.");
        }

        next();
    } catch (error) {
        res.status(500).send(error.message);
    }
}
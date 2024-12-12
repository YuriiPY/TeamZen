import express from "express"

import Projects from "../models/projects.js"
import Tasks from "../models/tasks.js"

export const router = express.Router();

// Create a project
router.post('/add', async (req, res) => {
    if (!req.body) {
        return res.status(400).send('No body provided');
    }

    try {
        const projectName = req.body.project;
        if (!projectName || projectName.length === 0) {
            return res.status(400).send("Project name can't be empty");
        }

        const clientIP = req.ip;

        const newProject = await Projects.create({
            projectName: projectName,
            clientIP: clientIP
        });

        return res.status(200).send({
            message: "Project successfully created!",
            project: newProject
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Edit a project
router.post('/edit/:project_id', async (req, res) => {
    const projectId = req.params.project_id;
    const clientIP = req.ip;

    try {
        const { status = null, projectName = null } = req.body.project;
        if (!projectName || projectName.length === 0) {
            return res.status(400).send("Project name can't be empty");
        }

        const updatedProject = await Projects.findOneAndUpdate(
            { _id: projectId, clientIP },
            { projectName: projectName, status: status || "process" },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).send("Project not found or access denied");
        }

        return res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Remove a project
router.post('/remove/:project_id', async (req, res) => {
    const projectId = req.params.project_id;
    const clientIP = req.ip;

    try {
        const removedProject = await Projects.findOneAndDelete({
            _id: projectId,
            clientIP
        });

        if (!removedProject) {
            return res.status(404).send("Project not found or access denied");
        }

        return res.status(200).send({
            message: "Project successfully removed!",
            project: removedProject
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all projects for the current IP
router.get('/get-all', async (req, res) => {
    const clientIP = req.ip;

    try {
        const allProjects = await Projects.find({ clientIP });
        res.status(200).json(allProjects);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a specific project by ID
router.get('/:project_id', async (req, res) => {
    const projectId = req.params.project_id;
    const clientIP = req.ip;

    try {
        const project = await Projects.findOne({ _id: projectId, clientIP });

        if (!project) {
            return res.status(404).send("Project not found or access denied");
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all tasks for a project
router.get('/:project_id/tasks', async (req, res) => {
    const projectId = req.params.project_id;
    const clientIP = req.ip;

    try {
        const project = await Projects.findOne({ _id: projectId, clientIP }).populate("tasks.TaskId");

        if (!project) {
            return res.status(404).send("Project not found or access denied");
        }

        res.status(200).json(project.tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add a task to a project
router.post('/:project_id/add-task', async (req, res) => {
    const projectId = req.params.project_id;
    const clientIP = req.ip;
    const { taskName, description } = req.body;

    try {
        const project = await Projects.findOne({ _id: projectId, clientIP });

        if (!project) {
            return res.status(404).send("Project not found or access denied");
        }

        const newTask = await Tasks.create({ taskName, description });

        project.tasks.push({ TaskId: newTask._id });
        await project.save();

        res.status(200).json(newTask);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a task from a project
router.delete('/:project_id/tasks/:task_id', async (req, res) => {
    const { project_id, task_id } = req.params;
    const clientIP = req.ip;

    try {
        const project = await Projects.findOne({ _id: project_id, clientIP });

        if (!project) {
            return res.status(404).send("Project not found or access denied");
        }

        project.tasks = project.tasks.filter(task => task.TaskId.toString() !== task_id);
        await project.save();

        await Tasks.findByIdAndDelete(task_id);

        res.status(200).json({ message: "Task deleted successfully!" });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Edit a task in a project
router.patch('/:project_id/tasks/edit/:task_id', async (req, res) => {
    const { project_id, task_id } = req.params;
    const clientIP = req.ip;
    const { taskName, description, status } = req.body;

    try {
        const project = await Projects.findOne({ _id: project_id, clientIP });

        if (!project) {
            return res.status(404).send("Project not found or access denied");
        }

        const updatedTask = await Tasks.findByIdAndUpdate(
            task_id,
            { taskName, description, status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            message: "Task successfully updated!",
            updatedTask: updatedTask
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

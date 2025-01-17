import express from "express"

import { validateOwnership } from '../middleware/validateOwnership.js'
import Projects from "../models/projects.js"
import Tasks from "../models/tasks.js"
import UserProject from '../models/users_projects.js'

export const router = express.Router();

// Create a project
router.post('/add', async (req, res) => {
    try {
        const { projectName, tasks, userId } = req.body;

        if (!projectName || !userId) {
            return res.status(400).send("Project name and user ID are required.");
        }

        // Create the project
        const newProject = await Projects.create({ projectName, tasks});
        console.log(newProject)

        // Create a user-project link
        await UserProject.create({
            userId,
            projectId: newProject._id
        });

        return res.status(200).send(newProject);
    } catch (error) {
        console.log(error)
        res.status(500).send(error.message);
    }
});

// Edit a project
router.patch('/edit/:project_id', validateOwnership, async (req, res) => {
    const projectId = req.params.project_id;

    try {
        const { status, projectName } = req.body;

        if (!projectName) {
            return res.status(400).send("Project name can't be empty.");
        }

        const updatedProject = await Projects.findByIdAndUpdate(
            projectId,
            { projectName, status: status || "process" },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).send("Project not found.");
        }

        return res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Remove a project
router.delete('/remove/:project_id', validateOwnership, async (req, res) => {
    const projectId = req.params.project_id;

    try {
        const removedProject = await Projects.findByIdAndDelete(projectId);

        if (!removedProject) {
            return res.status(404).send("Project not found.");
        }

        await UserProject.deleteMany({ projectId });

        return res.status(200).send({
            message: "Project successfully removed!",
            project: removedProject
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all projects for a user
// router.get('/get-all/:user_id', async (req, res) => {
//     const userId = req.params.user_id;

//     try {
//         const userProjects = await UserProject.find({ userId }).populate('projectId');
//         const projects = userProjects.map(up => up.projectId);

//         res.status(200).json(projects);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });


router.post('/get-all', async (req, res) => {
    const userId = req.body;

    try {
        const userProjects = await UserProject.find({ userId }).populate('projectId');
        
        
        const projects = userProjects.map(up => up.projectId);

        res.status(200).json(projects); 
    } catch (error) {
        res.status(500).send(error.message); 
    }
});

// Get a project by ID
router.get('/:project_id', validateOwnership, async (req, res) => {
    const projectId = req.params.project_id;

    try {
        const project = await Projects.findById(projectId);

        if (!project) {
            return res.status(404).send("Project not found.");
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.patch('/edit-status/:project_id', async (req, res) => {
    const projectId = req.params.project_id;
    const { status } = req.body;

    try {
        const updatedProject = await Projects.findByIdAndUpdate(
            projectId,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedProject) {
            return res.status(404).send("Project not found.");
        }

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.patch('/:project_id/tasks/:task_id', async (req, res) => {
    const { project_id, task_id } = req.params;
    const { status } = req.body;

    try {
        const project = await Projects.findById(project_id);

        if (!project) {
            return res.status(404).send("Project not found.");
        }

        const task = project.tasks.id(task_id);

        if (!task) {
            return res.status(404).send("Task not found.");
        }

        task.status = status; 
        await project.save();

        res.status(200).json(task);
    } catch (error) {
        res.status(500).send(error.message);
    }
});



router.patch('/update-task-status', validateOwnership, async (req, res) => {
    try {
        const { projectId, taskId, newStatus } = req.body;

        if (!projectId || !taskId || !newStatus) {
            return res.status(400).json({ message: "Project ID, Task ID, and new status are required." });
        }

        const project = await Projects.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        const task = project.tasks.find((t) => t.TaskId.toString() === taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        task.status = newStatus;
        await project.save();

        res.status(200).json({ message: "Task status updated successfully!", task });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add a task to a project
router.post('/:project_id/add-task', validateOwnership, async (req, res) => {
    const projectId = req.params.project_id;
    const { taskName, description } = req.body;

    try {
        const project = await Projects.findById(projectId);

        if (!project) {
            return res.status(404).send("Project not found.");
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
router.delete('/:project_id/tasks/:task_id', validateOwnership, async (req, res) => {
    const { project_id, task_id } = req.params;

    try {
        const project = await Projects.findById(project_id);

        if (!project) {
            return res.status(404).send("Project not found.");
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
router.patch('/:project_id/tasks/edit/:task_id', validateOwnership, async (req, res) => {
    const { task_id } = req.params;
    const { taskName, description, status } = req.body;

    try {
        const updatedTask = await Tasks.findByIdAndUpdate(
            task_id,
            { taskName, description, status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found." });
        }

        res.status(200).json({
            message: "Task successfully updated!",
            updatedTask
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a task by ID
router.get('/:project_id/tasks/:task_id', validateOwnership, async (req, res) => {
    const { task_id } = req.params;

    try {
        const task = await Tasks.findById(task_id);

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all tasks for a project
router.get('/:project_id/tasks', validateOwnership, async (req, res) => {
    const { project_id } = req.params;

    try {
        const project = await Projects.findById(project_id).populate('tasks.TaskId');

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        res.status(200).json(project.tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default router;
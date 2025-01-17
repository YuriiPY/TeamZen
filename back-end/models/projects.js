import mongoose from 'mongoose'

import {projectsSchema} from '../schemas/projects.js'

const Projects = mongoose.model("projects", projectsSchema);

export default Projects;
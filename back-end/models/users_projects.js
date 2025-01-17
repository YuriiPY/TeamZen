import mongoose from 'mongoose';
import { userProjectsSchema } from '../schemas/users_projects.js';

const UserProject = mongoose.model("userProjects", userProjectsSchema);

export default UserProject;
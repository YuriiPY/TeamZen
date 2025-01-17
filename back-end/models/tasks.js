import mongoose from 'mongoose'

import {tasksSchema} from '../schemas/tasks.js'

const Tasks = mongoose.model("tasks", tasksSchema);

export default Tasks;
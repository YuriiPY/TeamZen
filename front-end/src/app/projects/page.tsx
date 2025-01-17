'use client'
import { CircleMinus, DiamondPlus } from 'lucide-react'
import { FormEventHandler, useState } from 'react'

import Header from '@/components/Header'
import { useSession } from 'next-auth/react'
import { toast, ToastContainer } from 'react-toastify'


export default function Projects() {
    const [tasks, setTasks] = useState<{ name: string }[]>([])
    const session = useSession()


    const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        const data = {
            projectName: formData.get('projectName')
        }

        try {

            const filteredTasks = tasks.filter(task => task.name.trim() !== '')

            if (!session.data?.user?.name?.userId) {
                const projects = JSON.parse(localStorage.getItem("projects") || "[]")
                projects.push({
                    "projectName": data.projectName,
                    tasks: [filteredTasks]
                })
                localStorage.setItem("projects", JSON.stringify(projects))
                toast.success('Project successfully added!', {
                    position: 'top-right',
                    autoClose: 3000,
                })
                return
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/project/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "projectName": data.projectName,
                    "tasks": filteredTasks,
                    "userId": session.data?.user?.name?.userId
                })
            })

            if (!response.ok) {
                return null
            }

            const newProject = await response.json()
            const projects = JSON.parse(localStorage.getItem("projects") || "[]")
            projects.push(newProject)
            localStorage.setItem("projects", JSON.stringify(projects))

            toast.success('Project successfully added!', {
                position: 'top-right',
                autoClose: 3000,
            })


        } catch (error) {
            console.error('Authorization error:', error)
            return null
        }

    }

    const addTaskField = () => {
        setTasks([...tasks, { name: '' }])
    }
    const handleTaskChange = (index: number, value: string) => {
        const updatedTasks = [...tasks]
        updatedTasks[index] = { name: value } // Оновлюємо конкретне завдання
        setTasks(updatedTasks)
    }
    const removeTask = (index: number) => {
        const updatedTasks = tasks.filter((_, taskIndex) => taskIndex !== index)
        setTasks(updatedTasks)
    }
    console.log("h", session)
    return (
        <>
            <Header />
            <ToastContainer />
            <form onSubmit={handleSubmit} className='add-project-form'>
                <label htmlFor="projectName">Project Name:</label>
                <input type="text" id="projectName" name="projectName" required />

                <div>
                    <label>Tasks:</label>
                    {tasks.map((task, index) => (
                        <div key={index} className='form-task'>
                            <input type="text" value={task.name}
                                onChange={(e) => handleTaskChange(index, e.target.value)}
                                placeholder={`Task ${index + 1}`}
                                name={`task-${index}`}
                            />
                            <button className='from-btn-delete-task' onClick={() => removeTask(index)}> <CircleMinus /></button>
                        </div>
                    ))}
                </div>
                <div className='form-btn-container'>
                    <button type="button" onClick={addTaskField} className='add-task-button form-big-btn'>
                        <DiamondPlus size={24} />
                        Add Task
                    </button>
                    <button type="submit" className='form-big-btn'>Save Project</button>
                </div>
            </form >
        </>
    )
}
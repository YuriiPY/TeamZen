'use client'

import Header from '@/components/Header'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Project {
    _id: string
    projectName: string
    tasks: { name: string; status: string }[]
    status: string
    createdAt: string
}

export default function Home() {
    const router = useRouter()
    const { data: session } = useSession()

    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)



    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const oldProjects = JSON.parse(localStorage.getItem("projects") || "[]")
                if (oldProjects.length > 0) {
                    setProjects(oldProjects)
                }

                if (session?.user?.name?.userId) {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/project/get-all`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "userId": session?.user?.name?.userId,
                        }),
                    })

                    if (!response.ok) {
                        throw new Error("Failed to fetch projects")
                    }

                    const data: Project[] = await response.json()
                    setProjects(data)

                    localStorage.setItem("projects", JSON.stringify(data))
                }
            } catch (error) {
                console.error('Error fetching projects:', error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.name?.userId) {
            fetchProjects()
        }
    }, [session?.user?.name?.userId])


    const updateProjectStatus = async (projectId: string, newStatus: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/project/edit-status/${projectId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                throw new Error('Failed to update project status')
            }

            const updatedProject = await response.json()

            // Оновлюємо статус у локальному сховищі
            setProjects(prevProjects => {
                const updatedProjects = prevProjects.map(project =>
                    project._id === updatedProject._id ? updatedProject : project
                )
                localStorage.setItem("projects", JSON.stringify(updatedProjects)) // Оновлення в localStorage
                return updatedProjects
            })

        } catch (error) {
            console.error('Error updating project status:', error)
        }
    }

    const updateTaskStatus = async (projectId: string, taskId: string, newStatus: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/project/${projectId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                throw new Error('Failed to update task status')
            }

            const updatedTask = await response.json()

            setProjects(prevProjects => {
                const updatedProjects = prevProjects.map(project => {
                    if (project._id === projectId) {
                        return {
                            ...project,
                            tasks: project.tasks.map(task =>
                                task._id === updatedTask._id ? updatedTask : task
                            ),
                        }
                    }
                    return project
                })
                localStorage.setItem("projects", JSON.stringify(updatedProjects)) // Оновлення в localStorage
                return updatedProjects
            })

        } catch (error) {
            console.error('Error updating task status:', error)
        }
    }


    console.log(projects)
    return (
        <>
            <Header />
            <div className="projects-header">
                <h2 className="projects-title">Projects</h2>
                <button className="add-button" onClick={() => router.push("/projects")}>+</button>
            </div>
            <div className="project-list">
                {loading ? (
                    <p>Loading projects...</p>
                ) : projects.length > 0 ? (
                    projects.map((project) => (
                        <div key={project._id} className="project-item">
                            <h3>{project.projectName}</h3>
                            <p>Status:
                                <button className='status-btn' onClick={() => updateProjectStatus(project._id, project.status === 'process' ? 'completed' : 'process')}>
                                    {<span style={{
                                        color: project.status === 'process' ? '#ba0000' : '#00ba00',
                                        fontWeight: 'bold',
                                    }}>{project.status} </span>}
                                </button>
                            </p>
                            <div className='task-container'>
                                {project.tasks.map((task, index) => (
                                    <p key={index}>
                                        <strong>Task Name:</strong> {task.name} |  <strong>Status:</strong >
                                        <button className='status-btn' onClick={() => updateTaskStatus(project._id, task._id, task.status === 'process' ? 'completed' : 'process')}>
                                            {<span style={{
                                                color: task.status === 'process' ? '#ba0000' : '#00ba00',
                                                fontWeight: 'bold',
                                            }}>{task.status} </span>}
                                        </button>
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No projects available. Click {'+'} to add a new project.</p>
                )}
            </div >
        </>
    )
}

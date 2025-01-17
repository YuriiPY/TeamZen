'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface Task {
    name: string
    status: string
    createdAt: string
}

interface Project {
    _id: string
    projectName: string
    tasks: Task[]
    status: string
    createdAt: string
}

export default function Calendar() {
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

    const renderCalendar = () => {
        const calendar = []

        for (let i = 1; i <= 31; i++) {
            const date = new Date(2025, 0, i) // Визначаємо місяць, наприклад, січень (0)
            const dayTasks = projects.flatMap(project =>
                project.tasks.filter(task => new Date(task.createdAt).getDate() === i)
            )

            calendar.push(
                <div key={i} className="calendar-day">
                    <span>{i}</span>
                    <div className="tasks">
                        {dayTasks.map((task, index) => (
                            <div
                                key={index}
                                className={`task ${task.status === 'process' ? 'task-process' : 'task-completed'}`}
                            >
                                {task.name}
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        return calendar
    }

    return (
        <div className="calendar">
            {loading ? <p>Loading...</p> : renderCalendar()}
        </div>
    )
}

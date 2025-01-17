'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Register() {
    const [fields, setFields] = useState({
        "name": "",
        "email": "",
        "password": ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        setFields((prevFields) => ({
            ...prevFields,
            [name]: value,
        }))
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()


        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fields)
            })

            const result = await response.text()

            console.log('Response:', result)
            if (response.ok) {
                alert(result)
                router.push("/api/auth/signin")
            } else {
                alert(`Error: ${result}`)
            }
        } catch (error) {
            console.error('Signup error:', error)
        }
    }

    const router = useRouter()

    return (
        <div className='container-for-form'>
            <form onSubmit={handleSubmit} className='registration-form'>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={fields.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={fields.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={fields.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Register</button>
                <hr></hr>
                <span> Or if you have an account <Link href='/api/auth/signin'>login</Link></span>
            </form>
        </div>
    )
}

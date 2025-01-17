import type { AuthOptions, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authConfig: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
        Credentials({
            credentials: {
                email: {label: 'email', type: 'email', required:true},
                password: {label: 'password', type: 'password', required:true},
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_URL}/user/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        })
                    })
                    

                    if(!response.ok) {
                        return null
                    }
                    
                    const data = await response.json()
                    

                    return {
                        id: data.userId,
                        name: data,
                        email: credentials.email,
                    } as User
                } catch (error) {
                    console.error('Authorization error:', error);
                    return null;
                }

                return null
            },
        })
    ],
}

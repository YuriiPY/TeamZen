'use client'
import gsap from 'gsap'
import { Sparkle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import 'react-toastify/dist/ReactToastify.css'

export default function RootElement() {
    const logoRef = useRef(null)
    const router = useRouter()
    const { data: session, status } = useSession()
    console.log(session, status)

    useEffect(() => {
        gsap.to(logoRef.current, {
            y: -20,
            repeat: -1,
            yoyo: true,
            duration: 1.5,
        })
    }, [])
    return (
        <div className='root-page'>
            <div className='backGroundOverlay'></div>
            <Image ref={logoRef} src="/logo.png" alt="Logo" width={700} height={700} />

            <div className='root-btn-container'>
                <button className='root-btn' onClick={() => {
                    if (status === "authenticated") {
                        router.push('/home')
                    } else {
                        router.push("/register")
                    }
                }}>
                    <Sparkle />
                    Get started
                </button>
            </div>
        </div>
    )
}
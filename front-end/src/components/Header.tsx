'use client'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'


import Link from 'next/link'
import SideBar from './SideBar'

export default function Header() {
    const [SideBarState, setSideBarState] = useState(false)
    const session = useSession()

    const toggleSideBar = () => {
        setSideBarState((prevState) => !prevState)
    }
    return (
        <>
            <header>
                <div className="menu-icon" onClick={toggleSideBar}>☰</div>
                <Link href='/home'><Image src="/logo.png" alt="Logo" className="logo" width={70} height={70} /></Link>
                <div className='user-info'>
                    {session?.data && <div className='sing-out' onClick={() => signOut({ callbackUrl: "/" })}><span>Sing Out</span></div>}
                    <div className="icons">
                        <h1 className='user-email'>{session?.data?.user?.email}</h1>
                        {session?.data?.user?.image && <Image src={session?.data?.user?.image} alt={''} width={50} height={50}></Image>}
                        <div className="settings-icon">⚙</div>
                    </div>
                </div>
            </header >
            <SideBar state={SideBarState} toggle={toggleSideBar} />
        </>
    )
}
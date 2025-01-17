'use client'

import { useRef } from 'react'
import Link from 'next/link'

interface SideBarProps {
    state: boolean
    toggle: () => void
}

export default function SideBar({ state, toggle }: SideBarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null)

    return (
        <div>
            <div
                ref={sidebarRef}
                id="sidebar"
                className="sidebar"
                style={{
                    width: state ? '250px' : '0',
                    transition: 'width 0.3s',
                    overflow: 'hidden',
                }}
            >
                <div className="sidebar-header">
                    <span className="sidebar-title">TeamZen</span>
                    <span className="close-icon" onClick={toggle}>
                        ✕
                    </span>
                </div>
                <ul className="sidebar-links">
                    <li><Link href={"/projects"}>Projects</Link></li>
                    <li><Link href={"/calendar"}>Calendar</Link></li>
                </ul>
            </div>
        </div>
    )
}

'use client'

import { useEffect } from 'react'
import HeroSection from '@/components/HeroSection'
import FeaturesShowcase from '@/components/FeaturesShowcase'

export default function Home() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cursor = document.createElement('div')
      cursor.className = 'cursor-glow'
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`
      document.body.appendChild(cursor)

      setTimeout(() => {
        cursor.remove()
      }, 500)
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-[#0e0014] to-[#1a0029] overflow-hidden">
      <div className="bg-mesh fixed inset-0 opacity-5"></div>
      <HeroSection />
      <div className="w-full mt-[-4rem]">
        <FeaturesShowcase />
      </div>
    </main>
  )
}


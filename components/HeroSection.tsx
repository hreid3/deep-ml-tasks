'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const Particle = ({ index }: { index: number }) => {
  const seed = index * 1000;
  const size = seededRandom(seed) * 4 + 1;
  const initialX = seededRandom(seed + 1) * 100;
  const initialY = seededRandom(seed + 2) * 100;

  return (
    <motion.div
      className="absolute rounded-full bg-purple-500 opacity-50"
      style={{
        width: size,
        height: size,
        left: `${initialX}%`,
        top: `${initialY}%`,
      }}
      animate={{
        x: [0, seededRandom(seed + 3) * 100 - 50, 0],
        y: [0, seededRandom(seed + 4) * 100 - 50, 0],
      }}
      transition={{
        duration: seededRandom(seed + 5) * 10 + 10,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  )
}

export default function HeroSection() {
  const particlesRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (particlesRef.current) {
        const { left, top, width, height } = particlesRef.current.getBoundingClientRect()
        const x = (e.clientX - left) / width
        const y = (e.clientY - top) / height

        particlesRef.current.style.setProperty('--mouse-x', x.toString())
        particlesRef.current.style.setProperty('--mouse-y', y.toString())
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-purple-950 to-black">
      <div ref={particlesRef} className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, index) => (
          <Particle key={index} index={index} />
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 text-gradient"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Power Your Applications with Enterprise ML
        </motion.h1>
        <motion.p 
          className="text-xl mb-8 text-purple-200 max-w-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Harness the power of Robons AI&apos;s Deep ML Tasks API to transform your data into intelligent insights and automate complex processes.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => router.push('/api-doc')}
          >
            Explore API Docs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  )
}


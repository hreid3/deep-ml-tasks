import React from 'react'
import { Button } from "@/components/ui/button"

export default function HeroSectionFallback() {
  return (
    <section className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-purple-900 to-black">
      <div className="z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
          Power Your Applications with Enterprise ML
        </h1>
        <p className="text-xl mb-8 text-purple-200">
          Harness the power of Robons AI's Deep ML Tasks API
        </p>
        <Button size="lg" className="bg-purple-800 hover:bg-purple-900 text-white">
          Explore API Docs
        </Button>
      </div>
    </section>
  )
}


// @ts-nocheck
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { Button } from "@/components/ui/button"

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.001
      groupRef.current.rotation.y += 0.002
    }
  })

  useEffect(() => {
    const group = new THREE.Group()
    const geometry = new THREE.SphereGeometry(0.138, 32, 32)
    const material = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1,
    })

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(
        (Math.random() * 4.8 - 2.4),
        (Math.random() * 4.8 - 2.4),
        (Math.random() * 4.8 - 2.4)
      )
      group.add(mesh)
    }

    for (let i = 0; i < 40; i++) {
      const startNode = group.children[Math.floor(Math.random() * group.children.length)]
      const endNode = group.children[Math.floor(Math.random() * group.children.length)]
      
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.4 })
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([startNode.position, endNode.position])
      const line = new THREE.Line(lineGeometry, lineMaterial)
      group.add(line)
    }

    if (groupRef.current) {
      groupRef.current.add(group)
    }
  }, [])

  return <group ref={groupRef} />
}

function ShimmeringBackground() {
  return (
    <Sphere args={[30, 100, 100]}>
      <MeshDistortMaterial
        color="#05000a"
        attach="material"
        distort={0.4}
        speed={4}
        roughness={1}
      />
    </Sphere>
  )
}

function FixedLight() {
  return <directionalLight position={[0, 5, 0]} intensity={2} color="#ffffff" />
}

export default function HeroSection() {
  return (
    <section className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.2} />
          <FixedLight />
          <ShimmeringBackground />
          <NeuralNetwork />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
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


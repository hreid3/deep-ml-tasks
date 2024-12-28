import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function NeuralNetwork() {
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
      const startNode = group.children[Math.floor(Math.random() * group.children.length)] as THREE.Mesh
      const endNode = group.children[Math.floor(Math.random() * group.children.length)] as THREE.Mesh
      
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


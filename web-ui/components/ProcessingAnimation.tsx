"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ProcessingAnimation({ size = 300 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.z = 5

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Geometry - torus knot with simple lighting
    const geometry = new THREE.TorusKnotGeometry(0.9, 0.3, 120, 16)
    const material = new THREE.MeshStandardMaterial({ color: 0x7c3aed, metalness: 0.2, roughness: 0.3, emissive: 0x1f0f3f, emissiveIntensity: 0.2 })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Particles
    const particleGeometry = new THREE.BufferGeometry()
    const count = 300
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 8
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, opacity: 0.7, transparent: true })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(5, 5, 5)
    scene.add(dir)

    // Resize handler
    const onResize = () => {
      if (!container) return
      const { clientWidth, clientHeight } = container
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    const start = performance.now()
    const tick = () => {
      const t = (performance.now() - start) / 1000
      mesh.rotation.x = t * 0.6
      mesh.rotation.y = t * 0.9
      particles.rotation.y = t * 0.1
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      // dispose geometry/materials
      geometry.dispose()
      material.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      if (container && renderer.domElement) container.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: 300, borderRadius: 12, overflow: 'hidden' }} />
  )
}

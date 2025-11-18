'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeScene({ 
  beforeUrl, 
  afterUrl, 
  progress = 1 
}: { 
  beforeUrl?: string; 
  afterUrl?: string; 
  progress?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    mesh?: THREE.Mesh;
    animationId?: number;
  } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111111)

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 5, 5)
    scene.add(dir)

    sceneRef.current = { scene, camera, renderer }

    // Resize handler
    const onResize = () => {
      if (!container) return
      const { clientWidth, clientHeight } = container
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }
    window.addEventListener('resize', onResize)

    // Animation loop
    const start = performance.now()
    const animate = () => {
      const t = (performance.now() - start) / 1000
      
      if (sceneRef.current?.mesh) {
        sceneRef.current.mesh.rotation.x = t * 0.3
        sceneRef.current.mesh.rotation.y = t * 0.5
      }
      
      renderer.render(scene, camera)
      sceneRef.current!.animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId)
      }
      renderer.dispose()
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Update texture when URLs change
  useEffect(() => {
    if (!sceneRef.current || !afterUrl) return

    const { scene } = sceneRef.current

    // Remove old mesh
    if (sceneRef.current.mesh) {
      scene.remove(sceneRef.current.mesh)
      sceneRef.current.mesh.geometry.dispose()
      ;(sceneRef.current.mesh.material as THREE.Material).dispose()
    }

    // Load texture and create plane
    const loader = new THREE.TextureLoader()
    loader.load(afterUrl, (texture) => {
      const aspect = texture.image.width / texture.image.height
      const geometry = new THREE.PlaneGeometry(3 * aspect, 3)
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geometry, material)
      
      if (sceneRef.current) {
        sceneRef.current.scene.add(mesh)
        sceneRef.current.mesh = mesh
      }
    })
  }, [afterUrl])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[300px] rounded-lg overflow-hidden shadow-card bg-gray-900"
    />
  )
}

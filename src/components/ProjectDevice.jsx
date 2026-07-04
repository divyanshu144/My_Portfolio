import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox, OrbitControls } from '@react-three/drei'

const LaptopModel = ({ selectedProjectIndex, title }) => {
  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 320
    const ctx = canvas.getContext('2d')

    // Navy-to-dark-blue background
    const grad = ctx.createLinearGradient(0, 0, 512, 320)
    grad.addColorStop(0, '#080c10')
    grad.addColorStop(1, '#0a1e2e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 320)

    // Ghost project number (large, dark)
    ctx.font = '900 180px Arial, sans-serif'
    ctx.fillStyle = '#0e1e2d'
    ctx.textAlign = 'left'
    ctx.fillText(String(selectedProjectIndex + 1).padStart(2, '0'), 16, 210)

    // Project short title (white, centered)
    const shortTitle = title.split(' — ')[0]
    ctx.font = '600 26px Arial, sans-serif'
    ctx.fillStyle = '#f0f4f8'
    ctx.textAlign = 'center'
    ctx.fillText(shortTitle, 256, 252)

    // Sky-blue underline
    ctx.fillStyle = '#38bdf8'
    ctx.fillRect(256 - 50, 262, 100, 2)

    return new THREE.CanvasTexture(canvas)
  }, [selectedProjectIndex, title])

  return (
    <group position={[0, -0.6, 0]}>
      {/* Laptop base / keyboard unit */}
      <RoundedBox args={[3.2, 0.15, 2.2]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0d1117" roughness={0.7} metalness={0.3} />
      </RoundedBox>

      {/* Screen assembly — grouped so the surface stays flush with the panel */}
      <group position={[0, 1.2, -1.05]} rotation={[-0.25, 0, 0]}>
        {/* Screen panel (back of lid) */}
        <RoundedBox args={[3.2, 2.1, 0.1]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#0d1117" roughness={0.7} metalness={0.3} />
        </RoundedBox>
        {/* Screen surface — 0.056 in front of panel to avoid z-fighting */}
        <mesh position={[0, 0, 0.056]}>
          <planeGeometry args={[2.9, 1.85]} />
          <meshBasicMaterial map={screenTexture} />
        </mesh>
      </group>
    </group>
  )
}

const ProjectDevice = ({ selectedProjectIndex, title }) => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-4, 2, 3]} color="#38bdf8" intensity={0.4} />
      <LaptopModel selectedProjectIndex={selectedProjectIndex} title={title} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 2}
        enableZoom={false}
        enablePan={false}
      />
    </>
  )
}

export default ProjectDevice

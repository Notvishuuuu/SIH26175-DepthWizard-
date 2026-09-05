import { forwardRef, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'

const MOVE_SPEED = 18
const BOOST_MULTIPLIER = 2.6

export const OrbitCameraRig = forwardRef(function OrbitCameraRig({ autoRotate, target }, ref) {
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
      target={target}
      minDistance={5}
      maxDistance={140}
      maxPolarAngle={Math.PI * 0.495}
    />
  )
})

export function FlyCameraRig({ active, boundsRadius = 60 }) {
  const { camera, gl } = useThree()
  const lockRef = useRef()
  const keys = useRef({})
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (!active) return
    const onKeyDown = (e) => { keys.current[e.code] = true }
    const onKeyUp = (e) => { keys.current[e.code] = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      keys.current = {}
    }
  }, [active])

  useFrame((_, delta) => {
    if (!active) return
    const k = keys.current
    const speed = MOVE_SPEED * (k['ShiftLeft'] || k['ShiftRight'] ? BOOST_MULTIPLIER : 1) * delta

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize()

    const move = new THREE.Vector3()
    if (k['KeyW'] || k['ArrowUp']) move.add(forward)
    if (k['KeyS'] || k['ArrowDown']) move.sub(forward)
    if (k['KeyD'] || k['ArrowRight']) move.add(right)
    if (k['KeyA'] || k['ArrowLeft']) move.sub(right)
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed)

    if (k['KeyE']) move.y += speed
    if (k['KeyQ']) move.y -= speed

    camera.position.add(move)

    // Soft world bounds so the camera can't fly off into the void.
    const dist = Math.hypot(camera.position.x, camera.position.z)
    if (dist > boundsRadius) {
      const scale = boundsRadius / dist
      camera.position.x *= scale
      camera.position.z *= scale
    }
    camera.position.y = Math.max(1, Math.min(camera.position.y, 80))
  })

  if (!active) return null

  return (
    <PointerLockControls
      ref={lockRef}
      selector="#terrain-canvas"
      onLock={() => setLocked(true)}
      onUnlock={() => setLocked(false)}
    />
  )
}

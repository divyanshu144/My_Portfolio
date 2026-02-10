import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DoubleSide } from 'three';

const Target = (props) => {
  const targetRef = useRef();

  useGSAP(() => {
    gsap.to(targetRef.current.position, {
      y: targetRef.current.position.y + 0.5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
    });
  });

  return (
    <group {...props} ref={targetRef} rotation={[0, Math.PI / 5, 0]} scale={1.5}>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 32]} />
        <meshStandardMaterial color="#2b2b2b" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshStandardMaterial color="#9aa4b2" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <torusGeometry args={[0.35, 0.08, 16, 64]} />
        <meshStandardMaterial color="#ff4d4d" emissive="#8a1f1f" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.7, 0.02]}>
        <circleGeometry args={[0.22, 32]} />
        <meshStandardMaterial color="#f8f8f8" side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.7, 0.03]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial color="#ff4d4d" emissive="#8a1f1f" emissiveIntensity={0.4} side={DoubleSide} />
      </mesh>
    </group>
  );
};

export default Target;

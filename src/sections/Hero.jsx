import { PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import HackerRoom from '../components/HackerRoom'
import CanvasLoader from '../components/CanvasLoader'
import { useMediaQuery } from 'react-responsive'
import { calculateSizes } from '../constants'
import HeroCamera from '../components/HeroCamera'
import Button from '../components/Button'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const Hero = () => {

    const isSmall = useMediaQuery({maxWidth: 400})
    const isMobile = useMediaQuery({maxWidth: 768})
    const isTablet = useMediaQuery({minWidth: 768, maxWidth: 1024})

    const sizes = calculateSizes(isSmall, isMobile, isTablet)

    const cardARef = useRef(null)
    const cardBRef = useRef(null)
    const cardCRef = useRef(null)

    useGSAP(() => {
      [cardARef, cardBRef, cardCRef].forEach((ref, i) => {
        if (!ref.current) return
        gsap.to(ref.current, {
          y: '-=10',
          duration: 3 + i * 0.7,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.9,
        })
      })
    }, [])

  return (
   <section className="min-h-screen w-full flex flex-col relative">
        <div className="w-full mx-auto flex flex-col sm:mt-36 mt-20 c-space gap-3">
            <p className="sm:text-3xl text-2xl font-bold text-white text-center font-generalsans">
                Hi, I am Divyanshu Charak <span className="waving-hand">👋</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <span className="hero-badge hero-badge--ai">AI Engineer</span>
              <span className="hero-badge hero-badge--fs">Full-Stack Dev</span>
              <span className="hero-badge hero-badge--ds">MSc Data Science</span>
            </div>
        </div>

        <div className="w-full h-full absolute inset-0 mt-4">
            <Canvas className="w-full h-full">
                <Suspense fallback={<CanvasLoader/>}>
                    <PerspectiveCamera makeDefault position={[0,0,20]} />

                    <HeroCamera isMobile = {isMobile}>
                        <HackerRoom
                            position={sizes.deskPosition}
                            rotation={[0, -Math.PI, 0]}
                            scale={sizes.deskScale}
                        />
                    </HeroCamera>

                    <ambientLight intensity={1} />
                    <directionalLight position ={[10,10,10]} intensity={0.5} />
                </Suspense>

            </Canvas>

        </div>

        {/* Floating stat cards — desktop only */}
        <div ref={cardARef} className="stat-card hidden sm:flex flex-col gap-1 bottom-32 left-8">
          <p className="stat-card_label">ML Pipeline</p>
          <p className="stat-card_value">1.8M</p>
          <p className="stat-card_sub">EPC records processed</p>
        </div>

        <div ref={cardBRef} className="stat-card hidden sm:flex flex-col gap-1 top-40 right-8">
          <p className="stat-card_label">PromptOps</p>
          <p className="stat-card_value">9×</p>
          <p className="stat-card_sub">eval engine speedup</p>
        </div>

        <div ref={cardCRef} className="stat-card hidden sm:flex flex-col gap-1 bottom-52 right-12">
          <p className="stat-card_label">UK Work Rights</p>
          <p className="stat-card_value">✓</p>
          <p className="stat-card_sub">Graduate Route · no sponsorship</p>
        </div>

        <div className="absolute bottom-7 left-0 right-0 w-full z-10 c-space">
            <a href="#about" className="w-fit">
                <Button name="Let's work together" isBeam containerClass="sm:w-fit w-full sm:min-w-96" />
            </a>

        </div>

   </section>
  )
}

export default Hero

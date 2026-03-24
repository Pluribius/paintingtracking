"use client";

import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, useTexture, Text, Html } from "@react-three/drei";
import * as THREE from "three";

function DebugHUD() {
  const { camera, mouse, viewport } = useThree();
  const zoomRef = useRef<HTMLSpanElement>(null!);
  const mouseXRef = useRef<HTMLSpanElement>(null!);
  const mouseYRef = useRef<HTMLSpanElement>(null!);
  const paintingScale = 5.2;

  useFrame(() => {
    const lx = (mouse.x * viewport.width) / (2 * paintingScale);
    const ly = (mouse.y * viewport.height) / (2 * paintingScale);

    // Direct DOM updates are 100x faster than React state for HUDs
    if (zoomRef.current) zoomRef.current.innerText = camera.position.z.toFixed(2);
    if (mouseXRef.current) mouseXRef.current.innerText = lx.toFixed(3);
    if (mouseYRef.current) mouseYRef.current.innerText = ly.toFixed(3);
  });

  return (
    <Html fullscreen pointerEvents="none">
      <div className="absolute top-8 right-32 bg-[#EB3E22]/20 backdrop-blur-md border border-[#EB3E22]/30 p-4 rounded-xl font-mono text-sm text-[#EB3E22] pointer-events-none select-none">
        <div className="font-bold border-b border-[#EB3E22]/20 pb-2 mb-2 uppercase tracking-widest text-xs">Diagnostic HUD</div>
        <div className="space-y-1">
          <div className="flex justify-between gap-8">
            <span className="opacity-70">Zoom (Z):</span>
            <span ref={zoomRef} className="font-bold">8.00</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="opacity-70">Mouse X:</span>
            <span ref={mouseXRef} className="font-bold">0.000</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="opacity-70">Mouse Y:</span>
            <span ref={mouseYRef} className="font-bold">0.000</span>
          </div>
        </div>
      </div>
    </Html>
  );
}



function EyesFollowTarget({ paintingTexture, eyeTexture, backgroundTexture, whiteBgTexture }: any) {
  const { mouse } = useThree();
  const mainGroupRef = useRef<THREE.Group>(null!);
  const leftEyeRef = useRef<THREE.Group>(null!);
  const rightEyeRef = useRef<THREE.Group>(null!);
  const text1Ref = useRef<THREE.Group>(null!);
  const text2Ref = useRef<THREE.Group>(null!);
  const text3Ref = useRef<THREE.Group>(null!);

  const eyePositions = useMemo(() => ({
    left: new THREE.Vector3(0.452, 0.188, -0.01),
    right: new THREE.Vector3(0.562, 0.165, -0.01)
  }), []);

  const eyeScale = 0.03;
  // Parallax configuration for a more natural feel
  const config = {
    pupilFollow: 0.005,      // How much the pupils follow the mouse
    eyeRotate: 0.1,          // Subtle rotation of the eye plane
    textParallax: 0.01,      // Text moves more to show depth
    paintingParallax: 0.05,  // Painting itself moves slightly
    smoothness: 0.2          // Lerp factor
  };

  const isMouseActive = useRef(true);
  const manualReset = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);

  useEffect(() => {
    const handleEnter = () => { isMouseActive.current = true; };
    const handleLeave = () => { isMouseActive.current = false; };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        manualReset.current = true;
      }
    };

    window.addEventListener("mouseenter", handleEnter);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleLeave);
    window.addEventListener("focus", handleEnter);

    return () => {
      window.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleLeave);
      window.removeEventListener("focus", handleEnter);
    };
  }, []);

  useFrame(() => {
    // Detect movement to break manual reset
    if (Math.abs(mouse.x - lastMouseX.current) > 0.001 || Math.abs(mouse.y - lastMouseY.current) > 0.001) {
      manualReset.current = false;
    }
    lastMouseX.current = mouse.x;
    lastMouseY.current = mouse.y;

    const tx = (isMouseActive.current && !manualReset.current) ? mouse.x : 0;
    const ty = (isMouseActive.current && !manualReset.current) ? mouse.y : 0;

    // Asymmetric horizontal eye movement: limit right (+x), extend left (-x)
    // We shift the range from [-1, 1] to [-1.8, 0.7] behavior to favor leftward reach
    const eyeTx = tx > 0 ? tx * 0.7 : tx * 1.8;

    // 1. Move the Main Painting Group
    if (mainGroupRef.current) {
      mainGroupRef.current.position.x = THREE.MathUtils.lerp(mainGroupRef.current.position.x, tx * config.paintingParallax, config.smoothness);
      mainGroupRef.current.position.y = THREE.MathUtils.lerp(mainGroupRef.current.position.y, ty * config.paintingParallax, config.smoothness);
    }

    // 2. Move the Eyes (Pupil Follow + Plane Rotation)
    [leftEyeRef, rightEyeRef].forEach((ref, index) => {
      if (ref.current) {
        const home = index === 0 ? eyePositions.left : eyePositions.right;

        // Horizontal and vertical shift (Follow)
        const targetX = home.x + (eyeTx * config.pupilFollow);
        const targetY = home.y + (ty * config.pupilFollow);

        ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, config.smoothness);
        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, config.smoothness);

        // Rotation for a 3D effect
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, eyeTx * config.eyeRotate, config.smoothness);
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -ty * config.eyeRotate, config.smoothness);
      }
    });

    // 3. Move Text layers independently for depth
    if (text1Ref.current) {
      text1Ref.current.position.x = THREE.MathUtils.lerp(text1Ref.current.position.x, -0.2 + (tx * config.textParallax), config.smoothness);
      text1Ref.current.position.y = THREE.MathUtils.lerp(text1Ref.current.position.y, 0.2 + (ty * config.textParallax), config.smoothness);
    }
    if (text2Ref.current) {
      text2Ref.current.position.x = THREE.MathUtils.lerp(text2Ref.current.position.x, -0.05 + (tx * -config.textParallax * 0.5), config.smoothness);
      text2Ref.current.position.y = THREE.MathUtils.lerp(text2Ref.current.position.y, -0.15 + (ty * -config.textParallax * 0.5), config.smoothness);
    }
    if (text3Ref.current) {
      text3Ref.current.position.x = THREE.MathUtils.lerp(text3Ref.current.position.x, 0.15 + (tx * config.textParallax * 0.8), config.smoothness);
      text3Ref.current.position.y = THREE.MathUtils.lerp(text3Ref.current.position.y, -0.45 + (ty * config.textParallax * 0.8), config.smoothness);
    }
  });

  const aspect = paintingTexture.image.width / paintingTexture.image.height;
  return (
    <group scale={5.2} ref={mainGroupRef}>
      <group ref={text1Ref} position={[-0.2, 0.2, -0.05]}>
        <Text
          fontSize={0.25}
          color="#EB3E22"
          font="/fonts/PlayfairDisplay-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          THE ART
        </Text>
      </group>

      <group ref={text2Ref} position={[-0.05, -0.15, -0.05]}>
        <Text
          fontSize={0.25}
          color="#EB3E22"
          font="/fonts/PlayfairDisplay-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          TELLS
        </Text>
      </group>


      <mesh position={[0.3, 0, 0]}>
        <planeGeometry args={[aspect, 1]} />
        <meshBasicMaterial map={paintingTexture} transparent />
      </mesh>

      {/* White background layer furthest back */}
      <mesh position={[0, 0, -0.2]} scale={2.5}>
        <planeGeometry args={[aspect * 1.5, 1.5]} />
        <meshBasicMaterial map={whiteBgTexture} transparent />
      </mesh>

      {/* Painting texture layer behind the eyes */}
      <mesh position={[0.303, 0.01, -0.02]}>
        <planeGeometry args={[aspect, 1]} />
        <meshBasicMaterial map={backgroundTexture} transparent />
      </mesh>

      <group ref={leftEyeRef} position={eyePositions.left}>
        <mesh>
          <planeGeometry args={[eyeScale, eyeScale]} />
          <meshBasicMaterial map={eyeTexture} transparent />
        </mesh>
      </group>

      <group ref={rightEyeRef} position={eyePositions.right}>
        <mesh>
          <planeGeometry args={[eyeScale, eyeScale]} />
          <meshBasicMaterial map={eyeTexture} transparent />
        </mesh>
      </group>
    </group>
  );
}

function MainScene() {
  const [painting, eye, texture, whiteBg] = useTexture([
    "/girl_eyeless.png",
    "/eye.png",
    "/texture.png",
    "/white_background.jpg"
  ]);
  return (
    <EyesFollowTarget
      paintingTexture={painting}
      eyeTexture={eye}
      backgroundTexture={texture}
      whiteBgTexture={whiteBg}
    />
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0 bg-[#F9F6F1]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#F9F6F1"]} />
          <ambientLight intensity={1} />
          <DebugHUD />
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <MainScene />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}

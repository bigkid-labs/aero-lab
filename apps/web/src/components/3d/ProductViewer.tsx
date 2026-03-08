"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1f1f1f" wireframe />
    </mesh>
  );
}

interface ProductViewerProps {
  modelKey: string;
}

export function ProductViewer({ modelKey }: ProductViewerProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    fetch(`${apiBase}/api/v1/storage/presigned?key=${encodeURIComponent(modelKey)}`)
      .then((res) => {
        if (!res.ok) throw new Error("presigned URL fetch failed");
        return res.json() as Promise<{ url: string }>;
      })
      .then((data) => setModelUrl(data.url))
      .catch(() => setError(true));
  }, [modelKey]);

  if (error) {
    return (
      <div style={placeholderStyle}>
        <span style={labelStyle}>3D MODEL UNAVAILABLE</span>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div style={placeholderStyle}>
        <span style={labelStyle}>LOADING MODEL...</span>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0.5, 3], fov: 45 }}
      style={{ width: "100%", height: "100%", background: "var(--aero-surface)" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -2, -5]} intensity={0.3} />

      <Suspense fallback={<LoadingPlaceholder />}>
        <Model url={modelUrl} />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}

const placeholderStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "var(--aero-surface)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.6rem",
  letterSpacing: "0.2em",
  color: "var(--aero-grey-dim)",
  textTransform: "uppercase",
};

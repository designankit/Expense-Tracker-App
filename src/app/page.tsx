'use client';

import Image from "next/image";
import PixelBlast from './components/animations/pixel-blast';
import PillNav from './components/animations/nav-pill';

export default function Home() {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Expenses', href: '/expenses' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Settings', href: '/settings' }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Pill Navigation */}
      <PillNav
        items={navItems}
        activeHref="/"
        variant="glass"
        className="w-full"
      />

      {/* PixelBlast Background */}
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent 
        />
      </div>
    </div>
  );
}

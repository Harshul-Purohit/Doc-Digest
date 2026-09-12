'use client';

import React, { useEffect, useRef } from 'react';

export function VantaWavesBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let effect: any = null;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });
    };

    const init = async () => {
      try {
        // Step 1: Load Three.js r134
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        // Step 2: Load Vanta Waves
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.waves.min.js');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (win.VANTA && win.VANTA.WAVES && vantaRef.current && !effect) {
          effect = win.VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x180b47,
            shininess: 30.0,
            waveHeight: 15.0,
            waveSpeed: 1.0,
            zoom: 1.0,
          });

          // Trigger resize so canvas recalculates full screen bounds
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 100);
        }
      } catch (err) {
        console.error('Failed to load or init Vanta Waves:', err);
      }
    };

    init();

    return () => {
      if (effect) {
        try {
          effect.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 top-0 left-0 w-screen h-screen min-h-screen pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

export default VantaWavesBackground;

'use client';

import { useEffect, useState, useRef } from 'react';

export default function EarningsCounter({ targetUsdc }: { targetUsdc: number }) {
  const [displayedUsdc, setDisplayedUsdc] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const previousTarget = useRef(targetUsdc);

  useEffect(() => {
    // If the target increases (e.g. realtime update), trigger pulse
    if (targetUsdc > previousTarget.current) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }
    previousTarget.current = targetUsdc;

    const duration = 1500; // 1.5 seconds
    const startValue = displayedUsdc;
    const endValue = targetUsdc;
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentVal = startValue + (endValue - startValue) * easeProgress;
      setDisplayedUsdc(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayedUsdc(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetUsdc]); // Only re-run when targetUsdc changes

  return (
    <div 
      className={`text-5xl font-black tabular-nums transition-colors duration-500 ${isPulsing ? 'animate-pulse text-[var(--accent-green)]' : 'text-[var(--usdc-blue)]'}`}
      style={{ color: isPulsing ? 'var(--accent-green)' : 'var(--usdc-blue)' }}
    >
      ${displayedUsdc.toFixed(4)}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import EarningsCounter from './EarningsCounter';

export default function EarningsWidget({ initialUsdc }: { initialUsdc: number }) {
  const [usdc, setUsdc] = useState(initialUsdc);

  // In a real app, we'd use Supabase Realtime here.
  // For MVP demo, we just display the initial prop which might get updated by the parent polling.
  useEffect(() => {
    setUsdc(initialUsdc);
  }, [initialUsdc]);

  return (
    <div 
      className="p-6 rounded-xl border flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
        Total Earned
      </div>
      <EarningsCounter targetUsdc={usdc} />
      <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        USDC on Arc
      </div>
    </div>
  );
}

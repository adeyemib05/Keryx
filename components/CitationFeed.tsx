'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CitationFeed({ 
  initialPayments 
}: { 
  initialPayments: any[] 
}) {
  const [payments, setPayments] = useState<any[]>(initialPayments);

  useEffect(() => {
    setPayments(initialPayments);
    
    const channel = supabase
      .channel('citation_payments_feed')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'citation_payments' },
        (payload) => {
          setPayments(prev => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe((status, err) => {
        if (err) console.error("Realtime requires replication enabled on 'citation_payments'", err);
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialPayments]);

  if (payments.length === 0) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        No citations yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map((payment) => (
        <div 
          key={payment.id} 
          className="p-4 rounded-lg border text-sm flex items-center justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <span style={{ color: 'var(--accent-green)' }} className="font-semibold">
              +${Number(payment.amount_usdc).toFixed(4)} USDC
            </span>
            <span style={{ color: 'var(--text-secondary)' }} className="mx-2">·</span>
            <span style={{ color: 'var(--text-primary)' }}>
              Agent cited "{payment.articles?.title || 'Unknown Article'}"
            </span>
          </div>
          {payment.arc_tx_hash && (
            <a 
              href={`https://testnet.arcscan.app/tx/${payment.arc_tx_hash}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs hover:underline"
              style={{ color: 'var(--accent-blue)' }}
            >
              View on Arc ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

import React, { useMemo, useEffect, useRef, useState } from 'react';

export interface SurfaceStatesData {
  kpoints: { label: string; index: number }[];
  energyMin: number;
  energyMax: number;
  spectral: number[][];
  surfaceBands?: { k: number; energy: number }[][];
}

interface SurfaceStatesChartProps {
  data?: SurfaceStatesData;
  height?: number;
  className?: string;
}

function generateMockSurfaceStates(): SurfaceStatesData {
  const kpath = [
    { label: 'Γ', index: 0 },
    { label: 'M', index: 60 },
    { label: 'K', index: 120 },
    { label: 'Γ', index: 180 },
  ];
  const nk = 181;
  const ne = 160;
  const eMin = -3;
  const eMax = 3;

  const spectral: number[][] = [];
  const eDelta = (eMax - eMin) / (ne - 1);

  const bands = [
    { centerK: 0, widthK: 90, centerE: -1.2, widthE: 0.25, amp: 0.85, skew: 0.008 },
    { centerK: 60, widthK: 80, centerE: 0.0, widthE: 0.18, amp: 0.95, skew: -0.005 },
    { centerK: 120, widthK: 90, centerE: 0.6, widthE: 0.22, amp: 0.9, skew: 0.006 },
    { centerK: 180, widthK: 70, centerE: -0.4, widthE: 0.2, amp: 0.88, skew: -0.007 },
  ];

  for (let ie = 0; ie < ne; ie++) {
    const row: number[] = [];
    const e = eMin + ie * eDelta;
    for (let ik = 0; ik < nk; ik++) {
      let val = 0.02 + Math.random() * 0.04;
      const k = ik;
      for (const b of bands) {
        const dk = k - b.centerK;
        const eShift = b.centerE + b.skew * dk * (1 - Math.abs(dk) / (b.widthK * 1.2));
        const kEnv = Math.exp(-(dk * dk) / (2 * b.widthK * b.widthK * 0.6));
        const eEnv = Math.exp(-((e - eShift) * (e - eShift)) / (2 * b.widthE * b.widthE));
        val += b.amp * kEnv * eEnv;
      }
      val += (Math.random() - 0.5) * 0.03;
      row.push(Math.max(0, Math.min(1, val)));
    }
    spectral.push(row);
  }

  const surfaceBands: { k: number; energy: number }[][] = [];
  for (const b of bands) {
    const band: { k: number; energy: number }[] = [];
    for (let ik = Math.max(0, b.centerK - b.widthK); ik <= Math.min(nk - 1, b.centerK + b.widthK); ik++) {
      const dk = ik - b.centerK;
      const kEnv = Math.exp(-(dk * dk) / (2 * b.widthK * b.widthK * 0.6));
      if (kEnv > 0.25) {
        band.push({
          k: ik,
          energy: b.centerE + b.skew * dk * (1 - Math.abs(dk) / (b.widthK * 1.2)),
        });
      }
    }
    if (band.length > 3) surfaceBands.push(band);
  }

  return {
    kpoints: kpath,
    energyMin: eMin,
    energyMax: eMax,
    spectral,
    surfaceBands,
  };
}

function valueToRGB(v: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, v));
  if (t < 0.25) {
    const s = t / 0.25;
    return [Math.floor(15 + s * 35), Math.floor(30 + s * 70), Math.floor(80 + s * 140)];
  } else if (t < 0.5) {
    const s = (t - 0.25) / 0.25;
    return [Math.floor(50 + s * 205), Math.floor(100 + s * 140), Math.floor(220 + s * 35)];
  } else if (t < 0.75) {
    const s = (t - 0.5) / 0.25;
    return [Math.floor(255), Math.floor(240 - s * 60), Math.floor(255 - s * 180)];
  } else {
    const s = (t - 0.75) / 0.25;
    return [Math.floor(255 - s * 40), Math.floor(180 - s * 140), Math.floor(75 - s * 60)];
  }
}

export default function SurfaceStatesChart({
  data,
  height = 420,
  className = '',
}: SurfaceStatesChartProps) {
  const surfData = data || useMemo(() => generateMockSurfaceStates(), []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; k: number; energy: number; value: number } | null>(null);

  const { kpoints, energyMin, energyMax, spectral, surfaceBands = [] } = surfData;
  const ne = spectral.length;
  const nk = spectral[0]?.length || 0;

  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 350 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          w: Math.floor(rect.width),
          h: Math.floor(height - 80),
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !nk || !ne) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvasSize.w;
    const H = canvasSize.h;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const marginL = 56, marginR = 28, marginT = 10, marginB = 48;
    const plotW = W - marginL - marginR;
    const plotH = H - marginT - marginB;

    const k2x = (k: number) => marginL + (k / (nk - 1)) * plotW;
    const e2y = (e: number) => marginT + (1 - (e - energyMin) / (energyMax - energyMin)) * plotH;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    for (let ie = 0; ie < ne; ie++) {
      for (let ik = 0; ik < nk; ik++) {
        const v = spectral[ie][ik];
        const [r, g, b] = valueToRGB(v);
        const x0 = k2x(ik);
        const x1 = k2x(ik + 1 < nk ? ik + 1 : nk - 1);
        const y0 = e2y(energyMin + (ie + 1) * ((energyMax - energyMin) / ne));
        const y1 = e2y(energyMin + ie * ((energyMax - energyMin) / ne));
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x0, y1, Math.max(1, x1 - x0 + 0.5), Math.max(1, y0 - y1 + 0.5));
      }
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let e = Math.ceil(energyMin); e <= Math.floor(energyMax); e++) {
      if (e === 0) continue;
      const y = e2y(e);
      ctx.beginPath();
      ctx.moveTo(marginL, y);
      ctx.lineTo(marginL + plotW, y);
      ctx.stroke();
    }
    for (const kp of kpoints) {
      const x = k2x(kp.index);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(x, marginT);
      ctx.lineTo(x, marginT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const yEf = e2y(0);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(marginL, yEf);
    ctx.lineTo(marginL + plotW, yEf);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('E_F', marginL + plotW - 16, yEf - 5);

    for (const band of surfaceBands) {
      if (band.length < 2) continue;
      ctx.strokeStyle = 'rgba(255, 255, 120, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(255, 230, 80, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i < band.length; i++) {
        const x = k2x(band[i].k);
        const y = e2y(band[i].energy);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(marginL, marginT, plotW, plotH);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let e = Math.ceil(energyMin); e <= Math.floor(energyMax); e++) {
      const y = e2y(e);
      ctx.fillText(`${e}`, marginL - 8, y + 4);
    }
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(14, marginT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Energy (eV)', 0, 0);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 13px sans-serif';
    for (const kp of kpoints) {
      const x = k2x(kp.index);
      const label = kp.label === 'Gamma' ? 'Γ' : kp.label;
      ctx.fillText(label, x, marginT + plotH + 22);
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('k-point path', marginL + plotW / 2, marginT + plotH + 42);

    canvas.onmousemove = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      if (mx < marginL || mx > marginL + plotW || my < marginT || my > marginT + plotH) {
        setHoverInfo(null);
        return;
      }
      const kIdx = Math.round(((mx - marginL) / plotW) * (nk - 1));
      const eIdx = Math.round((1 - (my - marginT) / plotH) * (ne - 1));
      const ki = Math.max(0, Math.min(nk - 1, kIdx));
      const ei = Math.max(0, Math.min(ne - 1, eIdx));
      const energy = energyMin + (ei / (ne - 1)) * (energyMax - energyMin);
      setHoverInfo({
        x: mx,
        y: my,
        k: ki,
        energy: energy,
        value: spectral[ei][ki],
      });
    };
    canvas.onmouseleave = () => setHoverInfo(null);
  }, [canvasSize, spectral, kpoints, energyMin, energyMax, surfaceBands, nk, ne]);

  const findKLabel = (kIdx: number): string => {
    for (let i = 0; i < kpoints.length; i++) {
      if (kpoints[i].index === kIdx) return kpoints[i].label;
      if (i < kpoints.length - 1) {
        const a = kpoints[i], b = kpoints[i + 1];
        if (kIdx >= a.index && kIdx <= b.index) {
          const t = (kIdx - a.index) / (b.index - a.index);
          return `${a.label}→${b.label} (${(t * 100).toFixed(0)}%)`;
        }
      }
    }
    return `#${kIdx}`;
  };

  return (
    <div className={`bg-slate-900/50 backdrop-blur rounded-2xl border border-white/10 p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-white mb-0.5">表面态谱函数</h3>
          <p className="text-xs text-slate-400">Surface States Spectral Function A(k,ω)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">低</span>
          <div
            className="w-36 h-3 rounded-sm border border-white/10"
            style={{
              background: 'linear-gradient(to right, rgb(15,30,80), rgb(50,100,220), rgb(255,240,255), rgb(255,180,75), rgb(215,40,15))',
            }}
          />
          <span className="text-xs text-slate-400">高</span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full" style={{ height: height - 80 }}>
        <canvas ref={canvasRef} className="absolute inset-0 rounded-xl overflow-hidden" />

        {hoverInfo && (
          <div
            className="absolute pointer-events-none z-20 px-3 py-2 rounded-lg text-xs"
            style={{
              left: hoverInfo.x + 14,
              top: hoverInfo.y - 10,
              transform: 'translateY(-100%)',
              backgroundColor: 'rgba(15, 23, 42, 0.96)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e2e8f0',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>
              k点: {findKLabel(hoverInfo.k)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#94a3b8' }}>能量:</span>
              <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{hoverInfo.energy.toFixed(3)} eV</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#94a3b8' }}>强度:</span>
              <span style={{ fontFamily: 'monospace', color: '#fbbf24' }}>{hoverInfo.value.toFixed(3)}</span>
            </div>
            <div
              className="mt-1.5 rounded"
              style={{
                width: '100%',
                height: 4,
                backgroundColor: '#1e293b',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.round(hoverInfo.value * 100)}%`,
                  height: '100%',
                  background: `linear-gradient(to right, rgb(50,100,220), rgb(255,180,75))`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-red-500" style={{ borderTop: '2px dashed #ef4444' }} />
          <span>费米面 E<sub>F</sub></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-0.5 bg-yellow-300 rounded" style={{ boxShadow: '0 0 6px rgba(255,230,80,0.7)' }} />
          <span>表面态能带</span>
        </div>
      </div>
    </div>
  );
}

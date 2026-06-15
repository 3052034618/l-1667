import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

export type OrbitalType = 's' | 'p' | 'd';

export interface BandPoint {
  k: number;
  energy: number;
  s?: number;
  p?: number;
  d?: number;
}

export interface BandData {
  kpoints: { label: string; index: number }[];
  bands: {
    index: number;
    points: BandPoint[];
    dominant?: OrbitalType;
  }[];
  inversionRegions?: { start: number; end: number; top: number; bottom: number }[];
}

const ORBITAL_COLORS: Record<OrbitalType, string> = {
  s: '#3b82f6',
  p: '#22c55e',
  d: '#f97316',
};

const ORBITAL_NAMES: Record<OrbitalType, string> = {
  s: 's轨道',
  p: 'p轨道',
  d: 'd轨道',
};

interface BandStructureChartProps {
  data?: BandData;
  height?: number;
  className?: string;
}

function generateMockBandData(): BandData {
  const kpath = [
    { label: 'Γ', index: 0 },
    { label: 'X', index: 50 },
    { label: 'M', index: 100 },
    { label: 'Γ', index: 150 },
    { label: 'R', index: 200 },
  ];
  const numK = 201;
  const numBands = 8;
  const bands: BandData['bands'] = [];

  for (let b = 0; b < numBands; b++) {
    const points: BandPoint[] = [];
    const baseEnergy = (b - numBands / 2) * 1.1;
    for (let i = 0; i < numK; i++) {
      const kNorm = i / numK;
      const oscillate =
        Math.sin(kNorm * Math.PI * 2 + b * 0.8) * 0.9 +
        Math.sin(kNorm * Math.PI * 4 + b * 1.3) * 0.35 +
        Math.cos(kNorm * Math.PI * 1.5 + b * 0.5) * 0.5;
      const energy = baseEnergy + oscillate;
      const sWeight = Math.max(0, 0.8 - Math.abs(energy + 3) * 0.15) * (0.7 + Math.random() * 0.3);
      const pWeight = Math.max(0, 0.9 - Math.abs(energy) * 0.12) * (0.7 + Math.random() * 0.3);
      const dWeight = Math.max(0, 0.85 - Math.abs(energy - 3) * 0.15) * (0.7 + Math.random() * 0.3);
      const total = sWeight + pWeight + dWeight || 1;
      points.push({
        k: i,
        energy: parseFloat(energy.toFixed(3)),
        s: parseFloat((sWeight / total).toFixed(3)),
        p: parseFloat((pWeight / total).toFixed(3)),
        d: parseFloat((dWeight / total).toFixed(3)),
      });
    }
    bands.push({ index: b, points });
  }

  return {
    kpoints: kpath,
    bands,
    inversionRegions: [
      { start: 40, end: 65, top: 0.8, bottom: -0.5 },
      { start: 110, end: 135, top: 0.6, bottom: -0.4 },
    ],
  };
}

export default function BandStructureChart({
  data,
  height = 420,
  className = '',
}: BandStructureChartProps) {
  const bandData = data || useMemo(() => generateMockBandData(), []);
  const { kpoints, bands, inversionRegions = [] } = bandData;

  const chartData = useMemo(() => {
    const len = bands[0]?.points.length || 0;
    return Array.from({ length: len }, (_, i) => {
      const row: Record<string, number | string> = { k: i };
      bands.forEach((band) => {
        row[`band_${band.index}`] = band.points[i].energy;
        row[`band_${band.index}_s`] = band.points[i].s || 0;
        row[`band_${band.index}_p`] = band.points[i].p || 0;
        row[`band_${band.index}_d`] = band.points[i].d || 0;
      });
      return row;
    });
  }, [bands]);

  const xTicks = kpoints.map((kp) => kp.index);
  const xLabels = kpoints.map((kp) => ({ index: kp.index, label: kp.label }));

  const getBandColor = (bandIdx: number): string => {
    const band = bands[bandIdx];
    if (!band || !band.points.length) return '#94a3b8';
    const avg = band.points.reduce(
      (acc, p) => ({
        s: acc.s + (p.s || 0),
        p: acc.p + (p.p || 0),
        d: acc.d + (p.d || 0),
      }),
      { s: 0, p: 0, d: 0 }
    );
    const n = band.points.length;
    avg.s /= n; avg.p /= n; avg.d /= n;
    const max = Math.max(avg.s, avg.p, avg.d);
    if (max === avg.s) return ORBITAL_COLORS.s;
    if (max === avg.p) return ORBITAL_COLORS.p;
    return ORBITAL_COLORS.d;
  };

  return (
    <div className={`bg-slate-900/50 backdrop-blur rounded-2xl border border-white/10 p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold text-white mb-0.5">能带结构图</h3>
          <p className="text-xs text-slate-400">Band Structure · E<sub>F</sub>=0</p>
        </div>
        <div className="flex items-center gap-3">
          {(['s', 'p', 'd'] as OrbitalType[]).map((orb) => (
            <div key={orb} className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ORBITAL_COLORS[orb] }} />
              <span className="text-slate-300">{ORBITAL_NAMES[orb]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 24, bottom: 24, left: 8 }}
          >
            <defs>
              <linearGradient id="inversionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.12} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} />

            {inversionRegions.map((region, idx) => (
              <ReferenceArea
                key={`inv-${idx}`}
                x1={region.start}
                x2={region.end}
                y1={region.bottom}
                y2={region.top}
                fill="url(#inversionGrad)"
                stroke="none"
              />
            ))}

            <XAxis
              dataKey="k"
              type="number"
              domain={[0, (bands[0]?.points.length || 1) - 1]}
              ticks={xTicks}
              tickFormatter={(val) => {
                const found = xLabels.find((l) => l.index === val);
                return found ? found.label : '';
              }}
              stroke="#475569"
              tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 600 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#475569', strokeWidth: 1.5 }}
            />

            <YAxis
              type="number"
              domain={[-4, 4]}
              ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]}
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#475569' }}
              label={{
                value: 'Energy (eV)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#94a3b8', fontSize: 12 },
                offset: -2,
              }}
            />

            <ReferenceLine
              y={0}
              stroke="#ef4444"
              strokeDasharray="6 4"
              strokeWidth={1.8}
              label={{
                value: 'E_F',
                position: 'right',
                fill: '#ef4444',
                fontSize: 11,
                fontWeight: 600,
              }}
            />

            {xTicks.map((tick, idx) => (
              <ReferenceLine
                key={`v-${idx}`}
                x={tick}
                stroke="#334155"
                strokeWidth={1}
                strokeDasharray={idx === 0 || idx === xTicks.length - 1 ? '0' : '2 3'}
              />
            ))}

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                color: '#e2e8f0',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#94a3b8', marginBottom: '6px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}
              labelFormatter={(val) => {
                const found = xLabels.find((l) => l.index === val)?.label;
                return found ? `k点: ${found} (index=${val})` : `k index: ${val}`;
              }}
              formatter={(value: number, name: string) => {
                const match = name.match(/band_(\d+)$/);
                if (match) {
                  const bi = parseInt(match[1]);
                  return [`${value.toFixed(3)} eV`, `能带 ${bi + 1}`];
                }
                return [value, name];
              }}
            />

            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }}
              formatter={(value: string) => {
                const match = value.match(/band_(\d+)$/);
                if (match) return `能带 ${parseInt(match[1]) + 1}`;
                return value;
              }}
            />

            {bands.map((band) => {
              const key = `band_${band.index}`;
              const color = getBandColor(band.index);
              const isNearFermi = band.points.some((p) => Math.abs(p.energy) < 1.5);
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={isNearFermi ? 2.2 : 1.6}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 1, stroke: '#0f172a' }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-red-500" style={{ borderTop: '2px dashed #ef4444' }} />
          <span>费米面</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(180deg, rgba(168,85,247,0.35), rgba(168,85,247,0.12))' }} />
          <span>能带反转区域</span>
        </div>
      </div>
    </div>
  );
}

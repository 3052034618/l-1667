import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export interface DOSPoint {
  energy: number;
  s: number;
  p: number;
  d: number;
  total: number;
}

export interface DOSData {
  points: DOSPoint[];
}

const COLORS = {
  s: '#3b82f6',
  p: '#22c55e',
  d: '#f97316',
  total: '#f1f5f9',
};

interface DOSChartProps {
  data?: DOSData;
  height?: number;
  className?: string;
}

function generateMockDOS(): DOSData {
  const num = 160;
  const eMin = -4;
  const eMax = 4;
  const de = (eMax - eMin) / (num - 1);
  const points: DOSPoint[] = [];

  for (let i = 0; i < num; i++) {
    const energy = eMin + i * de;
    const lorentz = (e0: number, w: number, amp: number) => {
      const dx = energy - e0;
      return amp / (1 + (dx * dx) / (w * w));
    };

    const s =
      lorentz(-3.2, 0.35, 4.2) +
      lorentz(-2.6, 0.28, 3.1) +
      lorentz(-1.5, 0.5, 1.8) +
      lorentz(2.8, 0.4, 2.4);
    const p =
      lorentz(-1.2, 0.45, 5.2) +
      lorentz(-0.4, 0.32, 6.8) +
      lorentz(0.6, 0.38, 5.4) +
      lorentz(1.8, 0.5, 3.2);
    const d =
      lorentz(-2.2, 0.25, 3.8) +
      lorentz(-1.0, 0.22, 4.6) +
      lorentz(-0.2, 0.18, 7.2) +
      lorentz(0.3, 0.22, 6.4) +
      lorentz(1.2, 0.26, 4.1) +
      lorentz(2.5, 0.3, 2.8);

    const noise = 0.15 + Math.random() * 0.2;
    const sVal = Math.max(0, s + (Math.random() - 0.5) * noise);
    const pVal = Math.max(0, p + (Math.random() - 0.5) * noise);
    const dVal = Math.max(0, d + (Math.random() - 0.5) * noise);
    const total = sVal + pVal + dVal;

    points.push({
      energy: parseFloat(energy.toFixed(2)),
      s: parseFloat(sVal.toFixed(3)),
      p: parseFloat(pVal.toFixed(3)),
      d: parseFloat(dVal.toFixed(3)),
      total: parseFloat(total.toFixed(3)),
    });
  }

  return { points };
}

export default function DOSChart({ data, height = 420, className = '' }: DOSChartProps) {
  const dosData = data || useMemo(() => generateMockDOS(), []);
  const chartData = dosData.points;

  const maxDOS = useMemo(() => {
    const m = Math.max(...chartData.map((d) => d.total));
    return Math.ceil(m * 1.15);
  }, [chartData]);

  return (
    <div className={`bg-slate-900/50 backdrop-blur rounded-2xl border border-white/10 p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold text-white mb-0.5">态密度分布</h3>
          <p className="text-xs text-slate-400">Density of States (DOS) · states/eV</p>
        </div>
        <div className="flex items-center gap-3">
          {(['s', 'p', 'd'] as const).map((orb) => (
            <div key={orb} className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[orb] }} />
              <span className="text-slate-300">{orb}-PDOS</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.total }} />
            <span className="text-slate-300">Total</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 28, bottom: 24, left: 12 }}
          >
            <defs>
              <linearGradient id="gradS" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.s} stopOpacity={0} />
                <stop offset="100%" stopColor={COLORS.s} stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradP" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.p} stopOpacity={0} />
                <stop offset="100%" stopColor={COLORS.p} stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradD" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.d} stopOpacity={0} />
                <stop offset="100%" stopColor={COLORS.d} stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={COLORS.total} stopOpacity={0} />
                <stop offset="100%" stopColor={COLORS.total} stopOpacity={0.9} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} />

            <XAxis
              type="number"
              domain={[0, maxDOS]}
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#475569' }}
              label={{
                value: 'DOS (states/eV)',
                position: 'insideBottom',
                offset: -5,
                style: { fill: '#94a3b8', fontSize: 12 },
              }}
            />

            <YAxis
              dataKey="energy"
              type="number"
              domain={[-4, 4]}
              orientation="left"
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
                offset: -4,
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

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                color: '#e2e8f0',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#cbd5e1', fontWeight: 600, marginBottom: '6px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}
              labelFormatter={(val) => `能量: ${Number(val).toFixed(2)} eV`}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = { s: 's-PDOS', p: 'p-PDOS', d: 'd-PDOS', total: 'Total DOS' };
                return [`${value.toFixed(3)} states/eV`, labels[name] || name];
              }}
            />

            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value: string) => {
                const labels: Record<string, string> = { s: 's-PDOS', p: 'p-PDOS', d: 'd-PDOS', total: 'Total DOS' };
                return labels[value] || value;
              }}
            />

            <Area
              type="monotone"
              dataKey="s"
              stroke="none"
              fill="url(#gradS)"
              stackId="pdos"
            />
            <Area
              type="monotone"
              dataKey="p"
              stroke="none"
              fill="url(#gradP)"
              stackId="pdos"
            />
            <Area
              type="monotone"
              dataKey="d"
              stroke="none"
              fill="url(#gradD)"
              stackId="pdos"
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke={COLORS.total}
              strokeWidth={1.2}
              fill="url(#gradTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

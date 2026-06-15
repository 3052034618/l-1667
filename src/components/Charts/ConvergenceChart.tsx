import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from 'recharts';

export interface ConvergencePoint {
  step: number;
  energyChange: number;
  maxForce: number;
  paramChange?: { param: string; from: string; to: string };
}

export interface ConvergenceData {
  points: ConvergencePoint[];
  energyThreshold: number;
  forceThreshold: number;
}

interface ConvergenceChartProps {
  data?: ConvergenceData;
  height?: number;
  className?: string;
}

function generateMockConvergence(): ConvergenceData {
  const num = 45;
  const points: ConvergencePoint[] = [];
  let energyChange = 1.2;
  let maxForce = 0.85;

  for (let i = 1; i <= num; i++) {
    const decayE = 0.86 + Math.random() * 0.08;
    const decayF = 0.88 + Math.random() * 0.07;
    energyChange = Math.max(1e-6, energyChange * decayE) * (0.85 + Math.random() * 0.3);
    maxForce = Math.max(5e-4, maxForce * decayF) * (0.85 + Math.random() * 0.3);

    let paramChange: ConvergencePoint['paramChange'] | undefined;
    if (i === 12) {
      paramChange = { param: 'k点网格', from: '3×3×3', to: '5×5×5' };
    } else if (i === 25) {
      paramChange = { param: '截断能 (eV)', from: '400', to: '520' };
    } else if (i === 35) {
      paramChange = { param: 'Smearing (eV)', from: '0.05', to: '0.02' };
    }

    points.push({
      step: i,
      energyChange: parseFloat(energyChange.toExponential(3)),
      maxForce: parseFloat(maxForce.toFixed(4)),
      paramChange,
    });
  }

  return {
    points,
    energyThreshold: 1e-5,
    forceThreshold: 0.01,
  };
}

export default function ConvergenceChart({
  data,
  height = 420,
  className = '',
}: ConvergenceChartProps) {
  const convData = data || useMemo(() => generateMockConvergence(), []);
  const { points, energyThreshold, forceThreshold } = convData;

  const chartData = useMemo(() => {
    return points.map((p) => ({
      ...p,
      logEnergy: Math.log10(p.energyChange),
      z: p.paramChange ? 120 : 1,
    }));
  }, [points]);

  const y1Min = Math.floor(Math.log10(energyThreshold) - 1.5);
  const y1Max = Math.ceil(Math.log10(Math.max(...points.map((p) => p.energyChange))) + 0.5);
  const y2Max = Math.ceil(Math.max(...points.map((p) => p.maxForce)) * 10) / 10 + 0.1;

  return (
    <div className={`bg-slate-900/50 backdrop-blur rounded-2xl border border-white/10 p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold text-white mb-0.5">自洽收敛曲线</h3>
          <p className="text-xs text-slate-400">SCF Convergence · {points.length} 步</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 rounded" />
            <span className="text-slate-300">ΔE (log)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-orange-500 rounded" style={{ borderTop: '2px dashed #f97316' }} />
            <span className="text-slate-300">Max Force</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 56, bottom: 24, left: 10 }}
          >
            <defs>
              <linearGradient id="convE" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

            <XAxis
              dataKey="step"
              type="number"
              domain={[1, points.length]}
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#475569' }}
              label={{
                value: 'Iteration Step',
                position: 'insideBottom',
                offset: -5,
                style: { fill: '#94a3b8', fontSize: 12 },
              }}
            />

            <YAxis
              yAxisId="left"
              type="number"
              domain={[y1Min, y1Max]}
              stroke="#475569"
              tick={{ fill: '#60a5fa', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#475569' }}
              tickFormatter={(val) => `10^${val}`}
              label={{
                value: 'ΔE (eV/atom)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#60a5fa', fontSize: 12 },
                offset: -4,
              }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              type="number"
              domain={[0, y2Max]}
              stroke="#475569"
              tick={{ fill: '#fb923c', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#475569' }}
              label={{
                value: 'Max Force (eV/Å)',
                angle: 90,
                position: 'insideRight',
                style: { fill: '#fb923c', fontSize: 12 },
                offset: -2,
              }}
            />

            <ZAxis type="number" dataKey="z" range={[16, 120]} />

            <ReferenceLine
              yAxisId="left"
              y={Math.log10(energyThreshold)}
              stroke="#60a5fa"
              strokeDasharray="4 4"
              strokeWidth={1}
              opacity={0.7}
              label={{
                value: `ΔE<sub>th</sub> = ${energyThreshold.toExponential(0)}`,
                position: 'insideTopLeft',
                fill: '#60a5fa',
                fontSize: 10,
                offset: 4,
              }}
            />

            <ReferenceLine
              yAxisId="right"
              y={forceThreshold}
              stroke="#fb923c"
              strokeDasharray="4 4"
              strokeWidth={1}
              opacity={0.7}
              label={{
                value: `F<sub>th</sub> = ${forceThreshold}`,
                position: 'insideTopRight',
                fill: '#fb923c',
                fontSize: 10,
                offset: 4,
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
                minWidth: '240px',
              }}
              labelStyle={{
                color: '#cbd5e1',
                fontWeight: 700,
                marginBottom: '8px',
                borderBottom: '1px solid #1e293b',
                paddingBottom: '6px',
              }}
              labelFormatter={(val) => `迭代步: Step ${val}`}
              formatter={(value: number, name: string) => {
                const mapping: Record<string, [string, string]> = {
                  logEnergy: [
                    `${value.toFixed(3)} (${Math.pow(10, value).toExponential(3)} eV/atom)`,
                    '能量变化 ΔE (log₁₀)',
                  ],
                  energyChange: [`${value.toExponential(3)} eV/atom`, '能量变化 ΔE'],
                  maxForce: [`${value.toFixed(4)} eV/Å`, '最大力 Max Force'],
                };
                return mapping[name] || [`${value}`, name];
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const point = payload[0].payload as ConvergencePoint;
                return (
                  <div
                    style={{
                      backgroundColor: 'rgba(15,23,42,0.96)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                      minWidth: '250px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#cbd5e1', marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                      Step {label}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                      <span style={{ color: '#60a5fa' }}>ΔE:</span>
                      <span style={{ fontFamily: 'monospace' }}>{point.energyChange.toExponential(4)} eV</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                      <span style={{ color: '#fb923c' }}>Max Force:</span>
                      <span style={{ fontFamily: 'monospace' }}>{point.maxForce.toFixed(5)} eV/Å</span>
                    </div>
                    {point.paramChange && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '6px 10px',
                          backgroundColor: 'rgba(168,85,247,0.15)',
                          border: '1px solid rgba(168,85,247,0.35)',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ color: '#c084fc', fontWeight: 600, marginBottom: '2px' }}>⚙ 参数调整</div>
                        <div style={{ color: '#e9d5ff', fontSize: '11px' }}>
                          {point.paramChange.param}: <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{point.paramChange.from}</span> → <span style={{ fontWeight: 600 }}>{point.paramChange.to}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value: string) => {
                const mapping: Record<string, string> = {
                  logEnergy: '能量变化 ΔE (log₁₀刻度)',
                  maxForce: '最大力 Max Force',
                  paramMarkers: '参数调整点',
                };
                return mapping[value] || value;
              }}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="logEnergy"
              stroke="#3b82f6"
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1, stroke: '#0f172a' }}
              name="logEnergy"
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="maxForce"
              stroke="#f97316"
              strokeDasharray="8 5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 1, stroke: '#0f172a' }}
              name="maxForce"
            />

            <Scatter
              yAxisId="left"
              dataKey="logEnergy"
              data={chartData.filter((d) => d.paramChange)}
              fill="#a855f7"
              stroke="#e9d5ff"
              strokeWidth={2}
              name="paramMarkers"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

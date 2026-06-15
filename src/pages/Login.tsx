import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type UserRole } from '@/store/authStore';
import { Eye, EyeOff, Loader2, Atom, User, GraduationCap, Shield, Crown } from 'lucide-react';

type RoleTab = {
  key: UserRole;
  label: string;
  icon: React.ReactNode;
  defaultUser: string;
};

const ROLE_TABS: RoleTab[] = [
  { key: 'phd_student', label: '博士生', icon: <GraduationCap size={18} />, defaultUser: 'liuxiaoming' },
  { key: 'supervisor', label: '导师', icon: <User size={18} />, defaultUser: 'wangsupervisor' },
  { key: 'chief_scientist', label: '首席科学家', icon: <Crown size={18} />, defaultUser: 'chenchief' },
  { key: 'admin', label: '管理员', icon: <Shield size={18} />, defaultUser: 'admin01' },
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const rememberMe = useAuthStore((s) => s.rememberMe);
  const setRememberMe = useAuthStore((s) => s.setRememberMe);

  const [activeRole, setActiveRole] = useState<UserRole>('phd_student');
  const [username, setUsername] = useState('liuxiaoming');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = 80;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      hue: 180 + Math.random() * 90,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(8, 12, 28, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${p.opacity})`;
        ctx.fill();

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${p.opacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 85%, 65%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            const lineHue = (p.hue + q.hue) / 2;
            ctx.strokeStyle = `hsla(${lineHue}, 80%, 60%, ${(1 - dist / 130) * 0.25})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    const tab = ROLE_TABS.find((t) => t.key === role);
    if (tab) {
      setUsername(tab.defaultUser);
      setPassword('123456');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.message || '用户名或密码错误');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#080c1c]">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-purple-900/20 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full" style={{ maxWidth: '480px' }}>
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30">
                <Atom className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                拓扑材料计算平台
              </h1>
            </div>
            <p className="text-slate-400 text-sm">Topological Materials High-Throughput Computing Platform</p>
          </div>

          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/5">
            <div className="flex border-b border-white/10">
              {ROLE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleRoleChange(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 px-2 text-sm font-medium transition-all ${
                    activeRole === tab.key
                      ? 'text-white bg-gradient-to-b from-cyan-500/15 to-purple-500/10 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-400">记住登录状态</span>
                </label>
                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  忘记密码?
                </a>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登 录'
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
                <p>测试账号：liuxiaoming / wangsupervisor / chenchief / admin01</p>
                <p>密码统一：123456 （请选择对应角色Tab）</p>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            © 2026 Topological Materials Platform · All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}

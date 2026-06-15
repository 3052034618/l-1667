import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      <div
        className="fixed top-0 left-1/4 w-[600px] h-[600px] pointer-events-none opacity-[0.08]"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div
        className="fixed bottom-0 right-1/4 w-[500px] h-[500px] pointer-events-none opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.5) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <Sidebar />

      <div className="relative flex flex-col flex-1 min-w-0">
        <Header />

        <main className="relative flex-1 p-6 min-h-[calc(100vh-4rem)]">
          <div className="mx-auto max-w-[1600px] w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

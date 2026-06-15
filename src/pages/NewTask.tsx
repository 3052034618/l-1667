export default function NewTask() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">新建计算任务</h1>
      <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">任务名称</label>
          <input
            type="text"
            className="w-full h-10 px-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all text-sm"
            placeholder="请输入任务名称"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">计算类型</label>
          <select className="w-full h-10 px-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all text-sm">
            <option>带结构计算</option>
            <option>声子谱分析</option>
            <option>拓扑态搜索</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">任务描述</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all text-sm resize-none"
            placeholder="请输入任务描述..."
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button className="h-10 px-6 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium text-sm hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20">
            提交任务
          </button>
          <button className="h-10 px-6 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 font-medium text-sm hover:bg-slate-700/60 transition-all">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuickFlowBar: React.FC = () => {
  const { habits, toggleHabit } = useApp();

  return (
    <div className="bg-[#fffdfa] border border-amber-100/70 rounded-3xl p-4 shadow-3xs backdrop-blur-md space-y-2.5">
      {/* 头部标签 */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-extrabold text-slate-800 flex items-center space-x-1.5">
          <span>🌱 微习惯</span>
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.2 rounded-md font-semibold border border-amber-200/60">
            微小即成习惯
          </span>
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          今日已完成：{habits.filter((h) => h.completedToday).length}/{habits.length}
        </span>
      </div>

      {/* 向下自适应网格拓展 (不拖动，直接平铺看全) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {habits.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => {
              toggleHabit(h.id);
              if (!h.completedToday) {
                confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
              }
            }}
            className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              h.completedToday
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-3xs'
                : 'bg-white border-amber-100/80 text-slate-600 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-sm">{h.icon}</span>
              <span className={`text-[11px] font-semibold truncate ${h.completedToday ? 'line-through text-emerald-700/80' : ''}`}>
                {h.title}
              </span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-1">
              {h.completedToday ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

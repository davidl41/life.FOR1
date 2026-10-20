import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Heart, Zap, Smile, BatteryCharging, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StateCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StateCheckinModal: React.FC<StateCheckinModalProps> = ({ isOpen, onClose }) => {
  const { profile, recordStateCheckin, currentStateScore } = useApp();
  const [score, setScore] = useState<number>(currentStateScore || 8);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const getScoreInfo = (s: number) => {
    if (s >= 9) return { label: '元气拉满 · 意气风发', color: 'text-amber-600', emoji: '⚡', advice: '身心充沛，是啃下最难大任务的黄金窗口！' };
    if (s >= 7) return { label: '状态良好 · 从容稳定', color: 'text-emerald-600', emoji: '✨', advice: '心境安稳，节奏良好，适合深度专注。' };
    if (s >= 5) return { label: '平淡平衡 · 巡航前行', color: 'text-sky-600', emoji: '🌱', advice: '能量适中，顺其自然推进，适度走动。' };
    if (s >= 3) return { label: '有些疲惫 · 建议减负', color: 'text-orange-600', emoji: '☕', advice: '身体在发出休整信号，只做轻松小事。' };
    return { label: '电量见底 · 急需关怀', color: 'text-rose-600', emoji: '🛋️', advice: '放下所有自责与计划，现在最重要的是休息。' };
  };

  const info = getScoreInfo(score);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordStateCheckin(score, note.trim() || undefined);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-amber-100 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in"
      >
        <div className="flex items-center justify-between pb-2 border-b border-amber-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">身心状态检阅 (1-10)</h3>
              <p className="text-[11px] text-slate-400">“看见自己的真实电量，全能 AI 为你护航”</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 核心大数字与表情指示 */}
        <div className="text-center py-2 space-y-1">
          <div className="text-4xl">{info.emoji}</div>
          <div className="text-3xl font-black text-slate-800 tracking-tight font-mono">
            {score} <span className="text-base font-normal text-slate-400">/ 10 分</span>
          </div>
          <div className={`text-xs font-bold ${info.color}`}>{info.label}</div>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto italic">{info.advice}</p>
        </div>

        {/* 1-10 滑块 */}
        <div className="space-y-1.5 px-2">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            className="w-full h-2.5 bg-amber-100/80 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>1 极疲惫</span>
            <span>5 平稳</span>
            <span>10 满电</span>
          </div>
        </div>

        {/* 状态一句话速写 (可选) */}
        <div>
          <label className="text-[11px] text-slate-500 block mb-1">此刻心里想说的一句话 (可选)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：睡了个好觉、今天略有焦虑、准备大干一场..."
            className="w-full bg-[#fbf9f5] border border-amber-200/80 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-md shadow-amber-900/10"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>确认打卡并同步给全能 AI</span>
        </button>
      </form>
    </div>
  );
};

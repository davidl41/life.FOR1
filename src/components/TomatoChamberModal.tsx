import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, CheckCircle2, X, Volume2, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TomatoChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TomatoChamberModal: React.FC<TomatoChamberModalProps> = ({ isOpen, onClose }) => {
  const { tomatoPresets } = useApp();
  const presets = tomatoPresets && tomatoPresets.length > 0 ? tomatoPresets : [15, 25, 45];

  const [targetMinutes, setTargetMinutes] = useState<number>(presets[1] || presets[0] || 25);
  const [focusGoal, setFocusGoal] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>((presets[1] || 25) * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (presets && presets.length > 0 && !presets.includes(targetMinutes)) {
      setTargetMinutes(presets[0]);
    }
  }, [presets]);

  useEffect(() => {
    setTimeLeft(targetMinutes * 60);
    setIsRunning(false);
  }, [targetMinutes]);

  useEffect(() => {
    if (!isOpen) return;

    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = targetMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const handleFinish = () => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#faf7f2]/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 animate-fade-in text-slate-800">
      {/* 顶部栏 */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold bg-white px-3.5 py-1.5 rounded-full border border-amber-200/80 shadow-xs">
          <Timer className="w-4 h-4 text-amber-500" />
          <span>全能番茄专注舱 · 深度心流空间</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-white border border-amber-100 shadow-xs transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 中心内容 */}
      <div className="w-full max-w-md flex flex-col items-center text-center my-auto space-y-5">
        {/* 动态读取用户在设置中自定义配置的时长预设 */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-amber-200/80 shadow-2xs">
          {presets.map((m) => (
            <button
              key={m}
              onClick={() => setTargetMinutes(m)}
              disabled={isRunning}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                targetMinutes === m
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {m} 分钟
            </button>
          ))}
        </div>

        {/* 专注目标输入 */}
        <div className="w-full max-w-xs">
          <input
            type="text"
            value={focusGoal}
            onChange={(e) => setFocusGoal(e.target.value)}
            placeholder="为这次专注写个目标 (例如：写完汇报方案)..."
            className="w-full bg-white border border-amber-200/80 rounded-2xl px-4 py-2 text-center text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-400 shadow-2xs"
          />
        </div>

        {/* 环形倒计时 */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="112"
              className="text-amber-100/60 stroke-current"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="112"
              className="text-amber-500 stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 112}
              strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-mono font-black tracking-tight text-slate-800">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-amber-700 font-semibold mt-2 flex items-center space-x-1">
              <Volume2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{isRunning ? '深度心流维持中' : '准备就绪'}</span>
            </span>
          </div>
        </div>

        {/* 控制按键 */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setTimeLeft(targetMinutes * 60);
              setIsRunning(false);
            }}
            className="p-3.5 rounded-2xl bg-white border border-amber-200 text-slate-500 hover:text-slate-800 shadow-2xs transition"
            title="重置倒计时"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-black flex items-center space-x-2 shadow-md shadow-amber-900/10 transition active:scale-95 text-sm"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>暂停心流</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>开启专注</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinish}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition shadow-2xs"
            title="提前完成并退出"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center pb-2">
        “把杂念锁在门外，一次只做一件事。”
      </div>
    </div>
  );
};

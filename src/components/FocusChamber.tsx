import React, { useState, useEffect } from 'react';
import { TaskItem } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, X, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusChamberProps {
  task: TaskItem;
  onClose: () => void;
  onCompleteTask: (id: string) => void;
}

export const FocusChamber: React.FC<FocusChamberProps> = ({ task, onClose, onCompleteTask }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  const handleFinish = () => {
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    onCompleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-sky-50/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 animate-fade-in text-slate-800">
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sky-700 text-xs font-semibold bg-white/80 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>单任务沉浸舱 · 吃掉那只青蛙</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-white border border-sky-100 shadow-xs transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full max-w-md flex flex-col items-center text-center my-auto">
        <div className="mb-6 max-w-sm">
          <span className="text-[11px] text-sky-600 font-mono tracking-wider uppercase block mb-1 font-semibold">
            CURRENT TARGET FOCUS
          </span>
          <h2 className="text-xl font-bold text-slate-800 leading-snug">{task.title}</h2>
          {task.notes && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{task.notes}</p>}
        </div>

        {/* 环形倒计时 */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="112"
              className="text-sky-100 stroke-current"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="128"
              cy="128"
              r="112"
              className="text-sky-600 stroke-current transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 112}
              strokeDashoffset={2 * Math.PI * 112 * (1 - progress / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-mono font-bold tracking-tight text-slate-800">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-sky-600 mt-2 flex items-center space-x-1 font-medium">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>心流状态维持中</span>
            </span>
          </div>
        </div>

        {/* 控制按键 */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setTimeLeft(25 * 60);
              setIsRunning(false);
            }}
            className="p-3.5 rounded-2xl bg-white border border-sky-200 text-slate-500 hover:text-slate-800 shadow-xs transition"
            title="重置 25 分钟"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center space-x-2 shadow-md shadow-sky-600/30 transition active:scale-95 text-sm"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>暂停心流</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>开始专注</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinish}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition shadow-xs"
            title="标记任务完成并退出"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center pb-2">
        “一次只做一件事，把这 25 分钟毫无保留地交给它。”
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { HelpCircle, Sparkles, RefreshCw, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DecisionMakerCard: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<'YES' | 'NO' | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

  // 抛掷决策并生成哲思
  const handleDecide = () => {
    setIsDeciding(true);
    setResult(null);

    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? 'YES' : 'NO';
      setResult(outcome);
      setIsDeciding(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }, 700);
  };

  return (
    <div className="bg-white/95 border border-amber-100/80 rounded-3xl p-5 shadow-xs backdrop-blur-md space-y-3.5 relative overflow-hidden">
      {/* 头部标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80">
            <Compass className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">心底的抉择 · YES or NO</h3>
            <p className="text-xs text-slate-400">当你犹豫不决时，让直觉为你拨开迷雾</p>
          </div>
        </div>

        {result && (
          <button
            onClick={handleDecide}
            disabled={isDeciding}
            className="flex items-center space-x-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/80 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isDeciding ? 'animate-spin' : ''}`} />
            <span>再次聆听</span>
          </button>
        )}
      </div>

      {/* 心灵哲思金句（按下按钮后的内心映射） */}
      <div className="bg-[#fffdfa] border border-amber-200/70 rounded-2xl p-3.5 text-center">
        <p className="text-xs text-amber-900/90 font-serif italic leading-relaxed">
          “其实按下按钮的那一刹那，答案就已经悄悄浮现在你的心底。”
        </p>
        <span className="text-[10px] text-slate-400 mt-1 block">
          （如果看到结果的瞬间你想重来一次，那么你真正想要的结果便已不言自明）
        </span>
      </div>

      {/* 默念/输入问题与决断展示 */}
      {!result ? (
        <div className="space-y-2 pt-1">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDecide()}
            placeholder="心中默念或写下让你犹豫的选择 (例如：今晚去不去跑步、接不接这个项目)..."
            className="w-full bg-[#fbf9f5] border border-amber-200/80 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 shadow-3xs"
          />

          <button
            type="button"
            onClick={handleDecide}
            disabled={isDeciding}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition active:scale-95 shadow-md shadow-amber-900/10"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isDeciding ? '正在感受你内心的回响...' : '按下按钮，听从内心的答案'}</span>
          </button>
        </div>
      ) : (
        /* 结果展示区 */
        <div className="py-2 flex flex-col items-center justify-center space-y-2 animate-fade-in">
          <div className="text-xs text-slate-400">
            {question ? `针对：“${question}”` : '内心的选择指引：'}
          </div>

          <div
            className={`w-28 h-28 rounded-full border-2 flex flex-col items-center justify-center shadow-md transition-all ${
              result === 'YES'
                ? 'bg-gradient-to-br from-emerald-50 to-amber-50 border-emerald-300 text-emerald-800'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-300 text-orange-800'
            }`}
          >
            <span className="text-3xl font-black font-mono tracking-wider">{result}</span>
            <span className="text-[10px] font-bold mt-0.5">
              {result === 'YES' ? '✨ 听从渴望，果断前行' : '🍃 顺其自然，轻巧放下'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

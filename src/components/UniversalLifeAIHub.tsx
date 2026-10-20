import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Send,
  BatteryCharging,
  Check,
  BookmarkPlus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const UniversalLifeAIHub: React.FC = () => {
  const {
    currentStateScore,
    recordStateCheckin,
    universalAIMessages,
    sendUniversalAIMessage,
    addTask,
    lastCheckinTimestamp,
  } = useApp();

  // 点完身心感受关闭系统，1小时内重新进入直接显示对话框，超过1小时才重新让点
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(() => {
    if (!lastCheckinTimestamp) return false;
    const passedMs = Date.now() - lastCheckinTimestamp;
    return passedMs < 60 * 60 * 1000;
  });
  const [selectedScore, setSelectedScore] = useState<number>(currentStateScore || 8);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [todoSaved, setTodoSaved] = useState(false);

  const lastAIMessage = [...universalAIMessages].reverse().find((m) => m.sender === 'ai');

  const getScoreTag = (s: number) => {
    if (s >= 9) return { label: '元气拉满 · 意气风发', color: 'text-amber-600', emoji: '⚡' };
    if (s >= 7) return { label: '状态良好 · 从容稳定', color: 'text-emerald-600', emoji: '✨' };
    if (s >= 5) return { label: '平淡平衡 · 巡航前行', color: 'text-sky-600', emoji: '🌱' };
    if (s >= 3) return { label: '有些疲惫 · 适度减负', color: 'text-orange-600', emoji: '☕' };
    return { label: '电量见底 · 急需休养', color: 'text-rose-600', emoji: '🛋️' };
  };

  const currentTag = getScoreTag(selectedScore);

  const handleConfirmScore = () => {
    recordStateCheckin(selectedScore);
    setHasCheckedIn(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setInputText('');
    setIsSending(true);
    try {
      await sendUniversalAIMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  // 一键将 AI 建议转化为四象限待办
  const handleSaveToTodo = () => {
    if (!lastAIMessage?.content) return;
    const cleanTitle = lastAIMessage.content.slice(0, 36).replace(/\n/g, ' ');
    addTask(`[AI行动] ${cleanTitle}`, 'q2', lastAIMessage.content, false);
    setTodoSaved(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setTodoSaved(false), 2000);
  };

  const quickPrompts = [
    '⚡ 拆解当前最硬的青蛙任务',
    '📋 帮我把今天要做的事排优先级',
    '🎯 25分钟番茄钟该专注做哪件？',
  ];

  return (
    <div className="bg-gradient-to-br from-[#fffdfa] via-white to-amber-50/40 border border-amber-100/90 rounded-3xl p-4 sm:p-5 shadow-xs relative backdrop-blur-md">
      {/* 阶段 1：纯粹的 1-10 身心打分 */}
      {!hasCheckedIn ? (
        <div className="space-y-3.5 animate-fade-in py-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">此刻身心感受 (1-10 分)：</span>
            <span className={`font-bold flex items-center space-x-1 ${currentTag.color}`}>
              <span>{currentTag.emoji}</span>
              <span>{selectedScore} 分 · {currentTag.label}</span>
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSelected = selectedScore === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedScore(num)}
                  className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-900/10 scale-105'
                      : 'bg-white border border-amber-100/90 text-slate-600 hover:bg-amber-50/80'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono px-1">
            <span>1 极疲惫</span>
            <span>5 平稳</span>
            <span>10 满电</span>
          </div>

          <button
            type="button"
            onClick={handleConfirmScore}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition active:scale-95 shadow-xs"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>进入工作对话</span>
          </button>
        </div>
      ) : (
        /* 阶段 2：极简纯粹工作 AI 对话框 */
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
              <span>🎯 工作心流参谋</span>
              <span className="text-[10px] text-slate-400 font-normal">· 记忆锚定待办与手环</span>
            </span>

            {/* 右上角轻量重测状态入口 */}
            <button
              onClick={() => setHasCheckedIn(false)}
              className="flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-xl text-[11px] font-semibold transition active:scale-95 shadow-3xs"
              title="点击重新调整当前身心打分"
            >
              <BatteryCharging className="w-3.5 h-3.5 text-amber-600" />
              <span>身心: {currentStateScore}/10</span>
              <span className="text-[10px] text-slate-400 ml-0.5">(重测)</span>
            </button>
          </div>

          {/* AI 最新回答气泡 */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/60 via-white to-sky-50/40 border border-amber-200/70 shadow-2xs space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2 flex-1">
                <span className="text-base flex-shrink-0 mt-0.5">💬</span>
                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  {lastAIMessage ? lastAIMessage.content : '你好！今天有什么想规划、拆解或推进的待办，随时告诉我。'}
                </div>
              </div>

              {/* 一键将 AI 建议沉淀为四象限待办 */}
              {lastAIMessage && (
                <button
                  type="button"
                  onClick={handleSaveToTodo}
                  disabled={todoSaved}
                  className={`flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition shadow-3xs ${
                    todoSaved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200/80'
                  }`}
                  title="将此条建议直接收录进待办象限"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" />
                  <span>{todoSaved ? '已入待办' : '转待办'}</span>
                </button>
              )}
            </div>

            {/* 快捷启发气泡 */}
            <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-amber-100/60">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  disabled={isSending}
                  className="text-[11px] text-slate-600 bg-white/90 hover:bg-amber-50 hover:text-amber-800 px-3 py-1 rounded-xl border border-amber-200/60 transition active:scale-95 shadow-3xs font-medium"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 输入框与咨询按键 */}
          <div className="flex gap-2 pt-0.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="让 AI 帮你：拆解任务、排优先级、克服拖延、规划节奏..."
              className="flex-1 bg-white border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 shadow-3xs"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isSending}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 rounded-2xl font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-xs disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>咨询</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

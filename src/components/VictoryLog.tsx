import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRandomInspirations } from '../data/inspirations300';
import {
  Trophy,
  Sparkles,
  Plus,
  Trash2,
  Star,
  HeartHandshake,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VictoryLog: React.FC = () => {
  const { victories, addVictory, deleteVictory, toggleVictoryHighlight } = useApp();
  const [content, setContent] = useState('');
  const [showResilienceKit, setShowResilienceKit] = useState(false);
  const [showInspirations, setShowInspirations] = useState(false);
  const [showAllVictories, setShowAllVictories] = useState(false);

  // 300 条灵感库中当前展示的 6 条
  const [currentInspirations, setCurrentInspirations] = useState<string[]>(() =>
    getRandomInspirations(6)
  );

  const handleRefreshInspirations = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentInspirations(getRandomInspirations(6));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVictories = victories.filter((v) => v.date === todayStr);
  const countToday = todayVictories.length;

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    addVictory(content.trim(), countToday === 4);
    setContent('');

    if (countToday + 1 >= 5) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleQuickFill = (text: string) => {
    addVictory(text, false);
    if (countToday + 1 >= 5) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const highlightList = victories.filter((v) => v.isHighlight);

  // 默认只展示最新 1 条记录，避免拉长主页
  const displayedVictories = showAllVictories
    ? todayVictories
    : todayVictories.slice(0, 1);

  return (
    <div className="bg-[#fffdfa] border border-amber-100/70 rounded-3xl p-4 sm:p-5 shadow-3xs space-y-3 backdrop-blur-md">
      {/* 头部标题与自信急救包 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">每日 5 件成功日记</h3>
          </div>
        </div>

        <button
          onClick={() => setShowResilienceKit(true)}
          className="flex items-center space-x-1 px-3 py-1 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-semibold transition active:scale-95 shadow-3xs"
          title="低谷迷茫时打开，提取过往高光能量"
        >
          <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
          <span>自信急救包</span>
        </button>
      </div>

      {/* 今日胜利足迹：只保留纯净的五段式金色进度条 */}
      <div className="py-0.5">
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((idx) => {
            const active = idx <= countToday;
            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-500 ${
                  active
                    ? 'bg-gradient-to-r from-amber-400 to-amber-300 shadow-xs'
                    : 'bg-slate-200/60'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 不知道记什么：折叠展开 + 300条库刷新换一批 */}
      <div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowInspirations(!showInspirations)}
            className="text-[11px] text-amber-700/80 hover:text-amber-900 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 transition"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>不知道记什么？展开灵感库</span>
            {showInspirations ? (
              <ChevronUp className="w-3 h-3 text-amber-600" />
            ) : (
              <ChevronDown className="w-3 h-3 text-amber-600" />
            )}
          </button>

          {showInspirations && (
            <button
              type="button"
              onClick={handleRefreshInspirations}
              className="text-[11px] text-sky-700 hover:text-sky-800 inline-flex items-center space-x-1 px-2 py-0.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200/70 transition shadow-3xs"
            >
              <RefreshCw className="w-3 h-3 text-sky-600" />
              <span>换一批</span>
            </button>
          )}
        </div>

        {showInspirations && (
          <div className="flex flex-wrap gap-1.5 pt-2 animate-fade-in">
            {currentInspirations.map((text, i) => (
              <button
                key={i}
                onClick={() => handleQuickFill(text)}
                className="text-[11px] text-slate-700 bg-amber-50/50 hover:bg-amber-100 hover:text-amber-900 px-2.5 py-1 rounded-xl border border-amber-200/60 transition active:scale-95 font-medium shadow-3xs text-left"
              >
                + {text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 输入表单 */}
      <form onSubmit={handleAdd} className="flex gap-2 pt-0.5">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天哪怕是一件微小的事：按时喝水、散步、平复情绪..."
          className="flex-1 bg-[#fbf9f5] border border-amber-200/80 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-400 shadow-3xs"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 rounded-2xl font-bold text-xs flex items-center space-x-1 transition active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>收录</span>
        </button>
      </form>

      {/* 收录记录列表：默认只显示最新 1 条，多于 1 条可折叠展开 */}
      {todayVictories.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {displayedVictories.map((v) => (
            <div
              key={v.id}
              className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 transition ${
                v.isHighlight
                  ? 'bg-amber-50/80 border-amber-300'
                  : 'bg-white border-amber-100/70 text-slate-700 shadow-3xs'
              }`}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-xs text-slate-700 truncate font-medium">{v.content}</span>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="text-[10px] text-slate-400 font-mono mr-1">{v.createdAt}</span>

                <button
                  onClick={() => toggleVictoryHighlight(v.id)}
                  className={`p-1 rounded-lg hover:bg-amber-50 transition ${
                    v.isHighlight ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                  }`}
                  title={v.isHighlight ? '取消高光' : '标为高光时刻'}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={() => deleteVictory(v.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* 折叠展开按钮 */}
          {todayVictories.length > 1 && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllVictories(!showAllVictories)}
                className="text-[11px] text-amber-700/80 hover:text-amber-900 inline-flex items-center space-x-1 px-3 py-0.5 rounded-xl bg-amber-50/50 hover:bg-amber-100/60 transition"
              >
                <span>{showAllVictories ? '收起记录' : `展开今天全部 ${todayVictories.length} 条小胜利`}</span>
                {showAllVictories ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 自信急救包弹窗 */}
      {showResilienceKit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-slate-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">自信急救包 · 闪光时刻</h3>
                  <p className="text-[11px] text-slate-400">当你疲惫怀疑自我时，看看你曾走过的足迹</p>
                </div>
              </div>
              <button
                onClick={() => setShowResilienceKit(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed italic font-serif">
              “低谷只是长河中的一个回湾。你不是一无所有，这些被你亲手标记的闪光记忆，就是你随时可以调用的内在能量库。”
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {highlightList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  你还没有标记高光时刻哦！在成功日记里点击“★”即可将其收入自信急救包。
                </div>
              ) : (
                highlightList.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/70 flex items-start space-x-2.5"
                  >
                    <span className="text-amber-600 font-bold text-xs mt-0.5">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{item.content}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        记录于 {item.date} {item.createdAt}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowResilienceKit(false)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl transition shadow-md shadow-amber-900/10"
              >
                深吸一口气，重拾信心
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

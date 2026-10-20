import React, { useState } from 'react';
import { DecisionMakerCard } from './DecisionMakerCard';
import { Timer, Compass, X, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';

interface ToolboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTomato: () => void;
}

export const ToolboxModal: React.FC<ToolboxModalProps> = ({
  isOpen,
  onClose,
  onOpenTomato,
}) => {
  // 当前处于工具箱主菜单，还是进入了某个具体工具
  const [currentView, setCurrentView] = useState<'menu' | 'decision'>('menu');

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentView('menu');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-amber-100/90 w-full max-w-md rounded-3xl p-5 shadow-2xl relative space-y-4 animate-fade-in text-slate-800">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-100/70">
          <div className="flex items-center space-x-2">
            {currentView !== 'menu' && (
              <button
                type="button"
                onClick={() => setCurrentView('menu')}
                className="p-1 -ml-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                title="返回工具箱菜单"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <span className="text-lg">🧰</span>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">随手工具箱</h3>
              <p className="text-[10px] text-slate-400">
                {currentView === 'menu' ? '选择你想使用的小工具，用完即走' : '正在使用'}
              </p>
            </div>
          </div>

          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 状态 1：主菜单（番茄舱和决定完全同级，大卡片并列展示，点击再使用） */}
        {currentView === 'menu' ? (
          <div className="grid grid-cols-2 gap-3 py-1 animate-fade-in">
            {/* 1. 心底的抉择 (YES or NO) */}
            <button
              type="button"
              onClick={() => setCurrentView('decision')}
              className="p-4 rounded-3xl bg-gradient-to-br from-[#fffdfa] to-amber-50/70 border border-amber-200/80 hover:border-amber-400 hover:shadow-xs text-left transition active:scale-95 flex flex-col justify-between h-40 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200/80 flex items-center justify-center group-hover:scale-105 transition">
                <Compass className="w-5 h-5 text-amber-500" />
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
                  <span>心底的抉择</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-0.5 transition" />
                </h4>
                <div className="text-[11px] font-bold text-amber-700 font-mono mt-0.5">YES or NO</div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  犹豫不决时，听从按下瞬间内心的真实答案。
                </p>
              </div>
            </button>

            {/* 2. 全能番茄专注舱 */}
            <button
              type="button"
              onClick={() => {
                handleClose();
                onOpenTomato();
              }}
              className="p-4 rounded-3xl bg-gradient-to-br from-[#fffdfa] to-sky-50/70 border border-sky-200/80 hover:border-sky-400 hover:shadow-xs text-left transition active:scale-95 flex flex-col justify-between h-40 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 border border-sky-200/80 flex items-center justify-center group-hover:scale-105 transition">
                <Timer className="w-5 h-5 text-sky-500" />
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center justify-between">
                  <span>番茄专注舱</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-600 group-hover:translate-x-0.5 transition" />
                </h4>
                <div className="text-[11px] font-bold text-sky-700 font-mono mt-0.5">Focus Space</div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  自定义时长，把杂念锁在门外，深度心流。
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* 状态 2：点击后进入的具体使用界面 (YES or NO) */
          <div className="animate-fade-in pt-1">
            <DecisionMakerCard />
          </div>
        )}
      </div>
    </div>
  );
};

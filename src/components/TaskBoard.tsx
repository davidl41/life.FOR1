import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskItem, QuadrantType } from '../types';
import { FocusChamber } from './FocusChamber';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Flame,
  Target,
  Clock,
  Coffee,
  Sparkles,
  Maximize2,
  BookmarkCheck,
  Compass,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TaskBoard: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, setFrogTask, syncTaskToVictory } = useApp();
  const [selectedTaskForFocus, setSelectedTaskForFocus] = useState<TaskItem | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newQuadrant, setNewQuadrant] = useState<QuadrantType>('q1');
  const [newIsFrog, setNewIsFrog] = useState(false);

  // 展开状态控制：每象限默认展示最新 3 条
  const [expandedQuadrants, setExpandedQuadrants] = useState<Record<QuadrantType, boolean>>({
    q1: false,
    q2: false,
    q3: false,
    q4: false,
  });

  // 聚焦过滤模式：'all' 展示全部4个象限，也可以只聚焦查看某一个象限
  const [focusedQuadrant, setFocusedQuadrant] = useState<QuadrantType | 'all'>('all');

  const toggleExpandQuadrant = (q: QuadrantType) => {
    setExpandedQuadrants((prev) => ({ ...prev, [q]: !prev[q] }));
  };

  const quadrantConfig: Record<
    QuadrantType,
    { title: string; subtitle: string; icon: any; color: string; border: string; bg: string; badgeBg: string }
  > = {
    q1: {
      title: '重要且紧急',
      subtitle: '优先突破 · 当务之急',
      icon: Flame,
      color: 'text-rose-600',
      border: 'border-rose-200/90 hover:border-rose-300',
      bg: 'bg-white/95',
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    q2: {
      title: '重要不紧急',
      subtitle: '长远复利 · 深度沉淀',
      icon: Target,
      color: 'text-sky-600',
      border: 'border-sky-200/90 hover:border-sky-300',
      bg: 'bg-white/95',
      badgeBg: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    q3: {
      title: '紧急不重要',
      subtitle: '日常杂事 · 快速解决',
      icon: Clock,
      color: 'text-amber-600',
      border: 'border-amber-200/90 hover:border-amber-300',
      bg: 'bg-white/95',
      badgeBg: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    q4: {
      title: '不重要不紧急',
      subtitle: '闲暇减压 · 适度调节',
      icon: Coffee,
      color: 'text-slate-500',
      border: 'border-slate-200/90 hover:border-slate-300',
      bg: 'bg-white/95',
      badgeBg: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newQuadrant, newNotes.trim() || undefined, newIsFrog);
    setNewTitle('');
    setNewNotes('');
    setNewIsFrog(false);
    setShowAddModal(false);
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    if (!currentlyCompleted) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
    toggleTask(id);
  };

  // 象限任务数量统计
  const qTasks = {
    q1: tasks.filter((t) => t.quadrant === 'q1'),
    q2: tasks.filter((t) => t.quadrant === 'q2'),
    q3: tasks.filter((t) => t.quadrant === 'q3'),
    q4: tasks.filter((t) => t.quadrant === 'q4'),
  };

  const renderQuadrantCard = (quadrant: QuadrantType) => {
    const cfg = quadrantConfig[quadrant];
    const quadTasks = qTasks[quadrant];
    const Icon = cfg.icon;
    const isExpanded = expandedQuadrants[quadrant];
    const displayedTasks = isExpanded ? quadTasks : quadTasks.slice(0, 3);

    return (
      <div
        key={quadrant}
        id={`quadrant-${quadrant}`}
        className={`rounded-3xl border ${cfg.border} ${cfg.bg} p-4 flex flex-col justify-between shadow-2xs backdrop-blur-md transition-all duration-200 ${
          focusedQuadrant !== 'all' && focusedQuadrant !== quadrant ? 'opacity-40 scale-98' : ''
        }`}
      >
        <div>
          {/* 象限头部 */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-xl border ${cfg.badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                  <span>{cfg.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({quadrant.toUpperCase()})</span>
                </h3>
                <p className="text-[10px] text-slate-400">{cfg.subtitle}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 font-semibold">
              {quadTasks.filter((t) => t.completed).length}/{quadTasks.length}
            </span>
          </div>

          {/* 任务列表 */}
          <div className="space-y-2">
            {quadTasks.length === 0 ? (
              <div className="h-24 flex flex-col items-center justify-center text-xs text-slate-400 border border-dashed border-amber-200/80 rounded-2xl bg-amber-50/20">
                <span>暂无待办事项</span>
                <button
                  onClick={() => {
                    setNewQuadrant(quadrant);
                    setShowAddModal(true);
                  }}
                  className="mt-1 text-sky-600 hover:text-sky-700 hover:underline text-[11px] font-semibold"
                >
                  + 快速添加
                </button>
              </div>
            ) : (
              displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`group p-2.5 rounded-2xl border transition-all ${
                    task.completed
                      ? 'bg-slate-50/80 border-slate-200/60 text-slate-400'
                      : task.isFrog
                      ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                      : 'bg-white border-amber-100/80 text-slate-700 hover:border-sky-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggle(task.id, task.completed)}
                        className="mt-0.5 text-slate-300 hover:text-emerald-500 transition flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          {task.isFrog && (
                            <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-md shadow-2xs">
                              🐸 核心聚焦
                            </span>
                          )}
                          <span
                            className={`text-xs font-semibold leading-snug break-words ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        {task.notes && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {task.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0 opacity-80 group-hover:opacity-100 transition">
                      {task.completed && (
                        <button
                          onClick={() => syncTaskToVictory(task.id)}
                          disabled={task.syncedToVictoryLog}
                          className={`p-1.5 rounded-xl text-xs transition ${
                            task.syncedToVictoryLog
                              ? 'text-amber-500 bg-amber-50 cursor-default'
                              : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                          }`}
                          title={task.syncedToVictoryLog ? '已存入成功日记' : '收录进成功日记'}
                        >
                          <BookmarkCheck className="w-4 h-4" />
                        </button>
                      )}

                      {!task.completed && (
                        <button
                          onClick={() => setSelectedTaskForFocus(task)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition"
                          title="进入单任务番茄钟"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      )}

                      {!task.completed && (
                        <button
                          onClick={() => setFrogTask(task.id)}
                          className={`p-1.5 rounded-xl text-xs transition ${
                            task.isFrog ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={task.isFrog ? '取消核心标记' : '标记为核心青蛙'}
                        >
                          🐸
                        </button>
                      )}

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {quadTasks.length > 3 && (
          <div className="pt-2 mt-1 border-t border-slate-100 text-center">
            <button
              onClick={() => toggleExpandQuadrant(quadrant)}
              className="text-[11px] text-sky-700 hover:text-sky-800 font-semibold inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-sky-50/70 hover:bg-sky-100 transition"
            >
              <span>{isExpanded ? '收起' : `展开全部 (还有 ${quadTasks.length - 3} 条)`}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 顶部标题与新建按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">待办</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
            {tasks.filter((t) => !t.completed).length} 件
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-sm font-bold shadow-md shadow-sky-600/20 transition active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>新建待办</span>
        </button>
      </div>

      {/* 方案1核心落地：【迷你四象限全景小雷达 (Mini Matrix Radar)】 */}
      <div className="bg-[#fffdfa] border border-amber-100/90 rounded-3xl p-4 shadow-xs space-y-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-amber-100/60">
          <div className="flex items-center space-x-1.5 text-slate-700 font-extrabold">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>四象限全景雷达</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFocusedQuadrant('all')}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition ${
                focusedQuadrant === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-3xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              全部总览
            </button>
          </div>
        </div>

        {/* 2×2 精美矩阵坐标雷达 (带十字轴线、两极端点、点击联动聚焦) */}
        <div className="relative p-2 rounded-2xl bg-[#fcfaf6] border border-amber-100/70">
          {/* 十字坐标细轴 */}
          <div className="absolute left-1/2 top-2 bottom-2 -translate-x-1/2 w-px bg-gradient-to-b from-sky-400 via-amber-300 to-slate-200 pointer-events-none" />
          <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 h-px bg-gradient-to-r from-slate-200 via-amber-300 to-rose-400 pointer-events-none" />

          {/* 四端极点微标签 */}
          <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[9px] font-black text-sky-600 bg-white/95 px-1.5 rounded-full border border-sky-200 shadow-3xs">
            ▲ 重要
          </span>
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-slate-400 bg-white/95 px-1.5 rounded-full border border-slate-200">
            ▼ 次要
          </span>
          <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[9px] font-medium text-slate-400 bg-white/95 px-1 rounded-full border border-slate-200">
            ◀ 充裕
          </span>
          <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-rose-600 bg-white/95 px-1 rounded-full border border-rose-200 shadow-3xs">
            紧急 ▶
          </span>

          {/* 四个微缩可点击区块 */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs py-1">
            {/* 左上: Q2 重要不紧急 */}
            <button
              onClick={() => setFocusedQuadrant(focusedQuadrant === 'q2' ? 'all' : 'q2')}
              className={`p-2 rounded-xl transition flex flex-col items-center justify-center ${
                focusedQuadrant === 'q2'
                  ? 'bg-sky-100 border border-sky-300 shadow-3xs'
                  : 'hover:bg-sky-50/70'
              }`}
            >
              <span className="text-[10px] font-bold text-sky-700">Q2 战略攻坚</span>
              <span className="text-xs font-mono font-black text-sky-800">{qTasks.q2.length} 件</span>
            </button>

            {/* 右上: Q1 重要且紧急 */}
            <button
              onClick={() => setFocusedQuadrant(focusedQuadrant === 'q1' ? 'all' : 'q1')}
              className={`p-2 rounded-xl transition flex flex-col items-center justify-center ${
                focusedQuadrant === 'q1'
                  ? 'bg-rose-100 border border-rose-300 shadow-3xs'
                  : 'hover:bg-rose-50/70'
              }`}
            >
              <span className="text-[10px] font-bold text-rose-700">Q1 火线要务</span>
              <span className="text-xs font-mono font-black text-rose-800">{qTasks.q1.length} 件</span>
            </button>

            {/* 左下: Q4 不重要不紧急 */}
            <button
              onClick={() => setFocusedQuadrant(focusedQuadrant === 'q4' ? 'all' : 'q4')}
              className={`p-2 rounded-xl transition flex flex-col items-center justify-center ${
                focusedQuadrant === 'q4'
                  ? 'bg-slate-200 border border-slate-300 shadow-3xs'
                  : 'hover:bg-slate-100/70'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-600">Q4 闲暇减压</span>
              <span className="text-xs font-mono font-black text-slate-700">{qTasks.q4.length} 件</span>
            </button>

            {/* 右下: Q3 紧急不重要 */}
            <button
              onClick={() => setFocusedQuadrant(focusedQuadrant === 'q3' ? 'all' : 'q3')}
              className={`p-2 rounded-xl transition flex flex-col items-center justify-center ${
                focusedQuadrant === 'q3'
                  ? 'bg-amber-100 border border-amber-300 shadow-3xs'
                  : 'hover:bg-amber-50/70'
              }`}
            >
              <span className="text-[10px] font-bold text-amber-700">Q3 日常琐碎</span>
              <span className="text-xs font-mono font-black text-amber-800">{qTasks.q3.length} 件</span>
            </button>
          </div>
        </div>
      </div>

      {/* 四象限卡片列表 (根据聚焦模式展示，无穿模无遮挡) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(focusedQuadrant === 'all' || focusedQuadrant === 'q1') && renderQuadrantCard('q1')}
        {(focusedQuadrant === 'all' || focusedQuadrant === 'q2') && renderQuadrantCard('q2')}
        {(focusedQuadrant === 'all' || focusedQuadrant === 'q3') && renderQuadrantCard('q3')}
        {(focusedQuadrant === 'all' || focusedQuadrant === 'q4') && renderQuadrantCard('q4')}
      </div>

      {/* 新建待办模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white border border-amber-100 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>添加新的待办事项</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1">待办名称</label>
              <input
                type="text"
                required
                placeholder="例如：整理核心汇报材料、下周旅行攻略"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#fbf9f5] border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1">备忘说明 (可选)</label>
              <input
                type="text"
                placeholder="例如：25分钟番茄专注一口气完成"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-[#fbf9f5] border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1.5">放入哪个象限</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['q1', 'q2', 'q3', 'q4'] as QuadrantType[]).map((q) => {
                  const cfg = quadrantConfig[q];
                  return (
                    <button
                      type="button"
                      key={q}
                      onClick={() => setNewQuadrant(q)}
                      className={`p-2.5 rounded-2xl border text-left transition ${
                        newQuadrant === q
                          ? 'border-sky-500 bg-sky-50 text-sky-800 font-bold shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-amber-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{cfg.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{cfg.subtitle.split('·')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isFrogCheck"
                checked={newIsFrog}
                onChange={(e) => setNewIsFrog(e.target.checked)}
                className="accent-sky-600 w-4 h-4 rounded"
              />
              <label htmlFor="isFrogCheck" className="text-xs text-slate-700 cursor-pointer">
                🐸 标记为核心青蛙 (置顶并可一键开启番茄专注)
              </label>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-2xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition shadow-md shadow-sky-600/20"
              >
                保存待办
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedTaskForFocus && (
        <FocusChamber
          task={selectedTaskForFocus}
          onClose={() => setSelectedTaskForFocus(null)}
          onCompleteTask={(id) => {
            toggleTask(id);
            setSelectedTaskForFocus(null);
          }}
        />
      )}
    </div>
  );
};

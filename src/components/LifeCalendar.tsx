import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LifeCalendar: React.FC = () => {
  const { tasks, victories, wishes, bandData, schedules, addSchedule, toggleSchedule, deleteSchedule } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // 新增日程输入状态
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  const formatDateKey = (d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const getDayActivities = (dateStr: string) => {
    const isToday = dateStr === todayStr;

    // 1. 待办 (蓝点)
    const completedTasksOnDay = tasks.filter(
      (t) => t.completed && (t.createdAt === dateStr || (isToday && t.completed))
    );

    // 2. 成功日记 (黄点)
    const victoriesOnDay = victories.filter((v) => v.date === dateStr);

    // 3. 愿望签到 (紫点)
    const wishCheckinsOnDay = wishes.flatMap((w) => w.checkins || []).filter((c) => c.date === dateStr);

    // 4. 日程安排 (红橙点)
    const schedulesOnDay = (schedules || []).filter((s) => s.date === dateStr);

    // 5. 手环活力 (绿点)
    const hasVitality = isToday ? bandData.steps > 1000 : (completedTasksOnDay.length > 0 || victoriesOnDay.length > 0);

    return {
      hasVitality,
      tasksCount: completedTasksOnDay.length,
      victoriesCount: victoriesOnDay.length,
      wishCheckinsCount: wishCheckinsOnDay.length,
      schedulesCount: schedulesOnDay.length,
      tasksList: completedTasksOnDay,
      victoriesList: victoriesOnDay,
      wishCheckinsList: wishCheckinsOnDay,
      schedulesList: schedulesOnDay,
    };
  };

  const selectedDayData = getDayActivities(selectedDateStr);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim()) return;
    addSchedule(newScheduleTitle.trim(), selectedDateStr, newScheduleTime.trim() || undefined);
    setNewScheduleTitle('');
    setNewScheduleTime('');
    setShowAddScheduleModal(false);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="bg-white/95 border border-amber-100/90 rounded-3xl p-5 shadow-xs backdrop-blur-md space-y-4">
      {/* 头部：年月与图例 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-100/70 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">
              {year} 年 {month + 1} 月生活日程与足迹
            </h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-slate-600 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-slate-600 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 简洁彩色小点图例 (含日程) */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>日程</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>活力</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>待办</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>小胜利</span>
          </span>
        </div>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
        <span>一</span>
        <span>二</span>
        <span>三</span>
        <span>四</span>
        <span>五</span>
        <span className="text-amber-700/70">六</span>
        <span className="text-amber-700/70">日</span>
      </div>

      {/* 日期格子网格 */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12 rounded-2xl bg-transparent opacity-0" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatDateKey(dayNum);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDateStr;
          const act = getDayActivities(dateStr);

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => setSelectedDateStr(dateStr)}
              className={`h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-between py-1.5 px-1 transition-all ${
                isSelected
                  ? 'bg-amber-100/90 border-2 border-amber-400 shadow-2xs scale-102 font-bold'
                  : isToday
                  ? 'bg-amber-50 border border-amber-300/80 font-bold'
                  : 'bg-[#fffdfa] border border-amber-100/60 hover:bg-amber-50/50'
              }`}
            >
              <span className={`text-xs ${isToday ? 'text-amber-700' : 'text-slate-700'}`}>
                {dayNum}
              </span>

              {/* 彩色圆点集合 (含红色日程点) */}
              <div className="flex items-center justify-center space-x-0.5">
                {act.schedulesCount > 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-3xs"
                    title={`有 ${act.schedulesCount} 项日程`}
                  />
                )}
                {act.hasVitality && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-3xs"
                    title="活力达标"
                  />
                )}
                {act.tasksCount > 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-3xs"
                    title={`完成了 ${act.tasksCount} 项待办`}
                  />
                )}
                {act.victoriesCount > 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-3xs"
                    title={`记录了 ${act.victoriesCount} 条小胜利`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 选中某一天的详情卡片：日程安排与生活足迹 */}
      <div className="p-4 rounded-3xl bg-[#fffdfa] border border-amber-200/80 space-y-3 animate-fade-in text-xs">
        {/* 日期标题与添加日程按钮 */}
        <div className="flex items-center justify-between pb-2 border-b border-amber-100/70">
          <span className="font-extrabold text-slate-800 text-sm">
            {selectedDateStr} {selectedDateStr === todayStr ? '(今天)' : ''}
          </span>

          <button
            type="button"
            onClick={() => setShowAddScheduleModal(true)}
            className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200/80 transition active:scale-95 shadow-3xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加日程</span>
          </button>
        </div>

        {/* 1. 该日日程安排板块 */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 block">📅 该日日程安排：</span>
          {selectedDayData.schedulesList.length === 0 ? (
            <div className="text-[11px] text-slate-400 bg-rose-50/20 p-2.5 rounded-2xl border border-rose-100/60 text-center">
              该天暂无日程安排，点击右上角【+ 添加日程】安排行程。
            </div>
          ) : (
            selectedDayData.schedulesList.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 transition ${
                  item.completed
                    ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                    : 'bg-rose-50/60 border-rose-200/80 text-rose-900 shadow-3xs'
                }`}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSchedule(item.id)}
                    className="flex-shrink-0 text-rose-500 hover:text-emerald-600 transition"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="truncate">
                    {item.time && (
                      <span className="font-mono text-[10px] bg-rose-100/80 text-rose-800 px-1.5 py-0.2 rounded-md font-bold mr-1.5">
                        {item.time}
                      </span>
                    )}
                    <span className={`font-semibold ${item.completed ? 'line-through text-slate-400' : ''}`}>
                      {item.title}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteSchedule(item.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 rounded transition flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* 2. 该日生活足迹记录 */}
        <div className="space-y-1.5 pt-2 border-t border-amber-100/60">
          <span className="text-[11px] font-bold text-slate-500 block">👣 生活足迹与胜利：</span>

          {selectedDateStr === todayStr && bandData.steps > 0 && (
            <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>手环活力：已走 {bandData.steps.toLocaleString()} 步，消耗 {bandData.calories} kcal</span>
            </div>
          )}

          {selectedDayData.tasksList.map((t) => (
            <div key={t.id} className="flex items-center space-x-2 text-sky-800 bg-sky-50/80 px-2.5 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="truncate">攻克待办：{t.title}</span>
            </div>
          ))}

          {selectedDayData.victoriesList.map((v) => (
            <div key={v.id} className="flex items-center space-x-2 text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="truncate">记录胜利：{v.content}</span>
            </div>
          ))}

          {selectedDayData.wishCheckinsList.map((c, i) => (
            <div key={i} className="flex items-center space-x-2 text-purple-800 bg-purple-50/80 px-2.5 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="truncate">心愿显化：{c.answer}</span>
            </div>
          ))}

          {selectedDayData.tasksCount === 0 && selectedDayData.victoriesCount === 0 && selectedDayData.wishCheckinsCount === 0 && (
            <div className="text-slate-400 py-1 text-center text-[11px]">
              该天静享安宁，无额外足迹打卡 🍃
            </div>
          )}
        </div>
      </div>

      {/* 添加日程弹窗 */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSchedule}
            className="bg-white border border-rose-100 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-3.5 animate-fade-in text-slate-800"
          >
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                <span>添加日程 · {selectedDateStr}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">日程内容</label>
              <input
                type="text"
                required
                value={newScheduleTitle}
                onChange={(e) => setNewScheduleTitle(e.target.value)}
                placeholder="例如：下午 14:30 系统核心架构评估会..."
                className="w-full bg-[#fbf9f5] border border-rose-200/80 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">具体时间 (可选)</label>
              <input
                type="time"
                value={newScheduleTime}
                onChange={(e) => setNewScheduleTime(e.target.value)}
                className="w-full bg-[#fbf9f5] border border-rose-200/80 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddScheduleModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs hover:bg-slate-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                确认添加日程
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

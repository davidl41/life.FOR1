import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeroHeader } from './components/HeroHeader';
import { UniversalLifeAIHub } from './components/UniversalLifeAIHub';
import { QuickFlowBar } from './components/QuickFlowBar';
import { FloatingToolboxBall } from './components/FloatingToolboxBall';
import { ToolboxModal } from './components/ToolboxModal';
import { LifeCalendar } from './components/LifeCalendar';
import { VitalityCard } from './components/VitalityCard';
import { TaskBoard } from './components/TaskBoard';
import { VictoryLog } from './components/VictoryLog';
import { WishPool } from './components/WishPool';
import { TavernChat } from './components/TavernChat';
import { CircuitBreakerModal } from './components/CircuitBreakerModal';
import { SettingsModal } from './components/SettingsModal';
import { StateCheckinModal } from './components/StateCheckinModal';
import { TomatoChamberModal } from './components/TomatoChamberModal';
import {
  Compass,
  CheckSquare,
  Calendar as CalendarIcon,
  Sparkles,
  Beer,
} from 'lucide-react';

type TabType = 'home' | 'tasks' | 'calendar' | 'wishes' | 'tavern';

const MainLayout: React.FC = () => {
  const { lastActiveTimestamp } = useApp();
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<'general' | 'tavern'>('general');

  // 状态打卡、全能番茄钟与百宝箱浮球
  const [showStateCheckin, setShowStateCheckin] = useState(false);
  const [showTomatoChamber, setShowTomatoChamber] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);

  // 检测：当用户离开一段时间（>15分钟）重新回到App时，自动弹出1-10身心电量打卡
  useEffect(() => {
    const now = Date.now();
    const diffMinutes = (now - (lastActiveTimestamp || now)) / (1000 * 60);
    if (diffMinutes > 15) {
      setShowStateCheckin(true);
    }
  }, []);

  // 5大高频专属界面：主页、待办、酒馆、愿望、日历 (酒馆和日历对调位置)
  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'home', label: '主页', icon: Compass },
    { id: 'tasks', label: '待办', icon: CheckSquare },
    { id: 'tavern', label: '酒馆', icon: Beer },
    { id: 'wishes', label: '愿望', icon: Sparkles },
    { id: 'calendar', label: '日历', icon: CalendarIcon },
  ];

  const handleOpenTavernSettings = () => {
    setSettingsDefaultTab('tavern');
    setShowSettings(true);
  };

  const handleOpenGeneralSettings = () => {
    setSettingsDefaultTab('general');
    setShowSettings(true);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900 pb-20 md:pb-8">
      {/* 顶部称呼状态栏 (支持点击更换自定义头像) */}
      <HeroHeader onOpenSettings={handleOpenGeneralSettings} />

      {/* 主视图区域：紧凑度优化，确保主流手机单屏高度一览无余 */}
      <main className="max-w-4xl mx-auto w-full p-3.5 sm:p-5 flex-1 space-y-3 sm:space-y-4">
        {/* 桌面端高频选项卡 */}
        <div className="hidden md:flex items-center justify-center space-x-2 bg-white/95 border border-amber-100/80 p-2 rounded-2xl w-fit mx-auto shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-900/10'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-amber-50/60'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: 主页 (一屏收敛，完美契合手机高度，无需滚动) */}
        {currentTab === 'home' && (
          <div className="space-y-3 animate-fade-in">
            {/* 1. 全能生活 AI 对话框 (进入前纯粹打分，无多余标题介绍) */}
            <UniversalLifeAIHub />

            {/* 2. 微计划 (向下平铺拓展，无需横向拖动) */}
            <QuickFlowBar />

            {/* 3. 每日 5 件成功日记 (只有金条进度，300条灵感库可折叠刷新，默认浮现最新1条) */}
            <VictoryLog />

            {/* 4. 手表健康基站 (身心活力指数，卡路里/步数/活动时长，真实睡眠时长+各阶段百分比+科学评分模型，支持点击展开) */}
            <VitalityCard />
          </div>
        )}

        {/* Tab 2: 待办 (四象限待办与立体清晰 XY 轴，默认展示最新3条，折叠展开不穿模) */}
        {currentTab === 'tasks' && (
          <div className="animate-fade-in">
            <TaskBoard />
          </div>
        )}

        {/* Tab 3: 日历 (单独开一个专属日历界面) */}
        {currentTab === 'calendar' && (
          <div className="animate-fade-in">
            <LifeCalendar />
          </div>
        )}

        {/* Tab 4: 愿望 (心愿清单与每日显化签到，手机相册获取图片，无代币) */}
        {currentTab === 'wishes' && (
          <div className="animate-fade-in">
            <WishPool />
          </div>
        )}

        {/* Tab 5: 酒馆 (知心伙伴对话) */}
        {currentTab === 'tavern' && (
          <div className="animate-fade-in">
            <TavernChat onOpenCharacterSettings={handleOpenTavernSettings} />
          </div>
        )}
      </main>

      {/* 移动端底部高频大导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-amber-100/80 px-2 py-2 flex items-center justify-around shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-2xl transition ${
                active ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 纯圆形可移动百宝箱小浮球 (无文字，极简高级) */}
      <FloatingToolboxBall onOpen={() => setShowToolbox(true)} />

      {/* 防焦虑全屏空间 */}
      <CircuitBreakerModal />

      {/* 设置中心 */}
      {showSettings && (
        <SettingsModal
          defaultTab={settingsDefaultTab}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 随手工具箱 (YES/NO 抉择、番茄钟) */}
      <ToolboxModal
        isOpen={showToolbox}
        onClose={() => setShowToolbox(false)}
        onOpenTomato={() => setShowTomatoChamber(true)}
      />

      {/* 1-10 身心打卡弹窗 */}
      <StateCheckinModal
        isOpen={showStateCheckin}
        onClose={() => setShowStateCheckin(false)}
      />

      {/* 全能番茄专注舱 */}
      <TomatoChamberModal
        isOpen={showTomatoChamber}
        onClose={() => setShowTomatoChamber(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchHealthConnectData, requestHealthPermissions, isHealthConnectSupported } from '../services/healthConnectService';
import {
  Moon,
  Heart,
  Flame,
  Footprints,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';

export const VitalityCard: React.FC = () => {
  const { bandData, syncMockBandData, updateBandData } = useApp();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showConnectGuide, setShowConnectGuide] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSyncHealthConnect = async () => {
    setIsSyncing(true);
    try {
      if (isHealthConnectSupported()) {
        const result = await fetchHealthConnectData();
        if (result.success && result.data) {
          updateBandData(result.data);
          alert(result.message);
        } else {
          // 尝试先申请权限
          const perm = await requestHealthPermissions();
          if (perm.granted) {
            const retry = await fetchHealthConnectData();
            if (retry.success && retry.data) updateBandData(retry.data);
          } else {
            setShowConnectGuide(true);
          }
        }
      } else {
        // Web 浏览器环境优雅模拟与引导
        syncMockBandData();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const formatHoursMinutes = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}小时${m > 0 ? `${m}分` : ''}`;
  };

  return (
    <div className="bg-[#fffdfa] border border-amber-100/70 rounded-3xl p-4 sm:p-5 shadow-3xs backdrop-blur-md transition-all space-y-3.5">
      {/* 头部：标题 + 展开与同步 */}
      <div className="flex items-center justify-between pb-1.5 border-b border-amber-100/60">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">
              身心活力基站
            </h3>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              小米手环 10
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {bandData.lastSyncTime}
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-3 py-1 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition shadow-3xs"
          >
            <span>{isExpanded ? '收起详情' : '展开睡眠与运动'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleSyncHealthConnect}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            title="通过 Health Connect / 模拟同步手环数据"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 醒目放大的睡眠评分卡片 (参考小米官方截图，大号蓝紫圆环评分 + 89分) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-50/70 via-white to-indigo-50/50 border border-sky-100 flex items-center justify-between shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <Moon className="w-4 h-4" />
            </div>
            <h4 className="font-black text-slate-800 text-base sm:text-lg tracking-tight">
              {bandData.sleepQualityLabel}
            </h4>
          </div>

          <div className="text-xs text-sky-800 font-medium">
            昨晚睡眠时长 {formatHoursMinutes(bandData.sleepTotalMinutes)} · 深睡 {bandData.deepSleepPercentage}%
          </div>
          <div className="text-[10px] text-slate-400">
            入睡 {bandData.fallAsleepTime} ~ 醒来 {bandData.wakeUpTime} · 高于 95% 同龄用户
          </div>
        </div>

        {/* 显著放大：大号睡眠评分圆环徽章 */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center flex-shrink-0 ml-2">
          {/* 蓝紫圆环渐变外圈 */}
          <div className="absolute inset-0 rounded-full border-4 border-sky-100" />
          <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-indigo-600 border-r-indigo-500 animate-spin-slow opacity-90" />

          {/* 中心大号评分数字 */}
          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-white flex flex-col items-center justify-center shadow-xs">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight leading-none">
              {bandData.sleepScore}
            </span>
            <span className="text-[9px] text-slate-400 font-bold scale-90">睡眠分</span>
          </div>
        </div>
      </div>

      {/* 核心三项实时运动消耗：热量、步数、活动时长 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#fcfaf6] p-2.5 rounded-2xl border border-amber-100/70">
          <span className="text-[11px] text-amber-700 font-medium flex items-center justify-center space-x-1 mb-0.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>卡路里</span>
          </span>
          <div className="text-base font-black text-slate-800 font-mono">
            {bandData.calories}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">/{bandData.calorieGoal} 千卡</div>
        </div>

        <div className="bg-[#fcfaf6] p-2.5 rounded-2xl border border-amber-100/70">
          <span className="text-[11px] text-emerald-700 font-medium flex items-center justify-center space-x-1 mb-0.5">
            <Footprints className="w-3.5 h-3.5 text-emerald-500" />
            <span>今日步数</span>
          </span>
          <div className="text-base font-black text-slate-800 font-mono">
            {bandData.steps.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">/{bandData.stepGoal} 步</div>
        </div>

        <div className="bg-[#fcfaf6] p-2.5 rounded-2xl border border-amber-100/70">
          <span className="text-[11px] text-sky-700 font-medium flex items-center justify-center space-x-1 mb-0.5">
            <Activity className="w-3.5 h-3.5 text-sky-500" />
            <span>活动时长</span>
          </span>
          <div className="text-base font-black text-slate-800 font-mono">
            {bandData.activeMinutes}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">/{bandData.activeMinutesGoal} 分钟</div>
        </div>
      </div>

      {/* 展开后的全天睡眠各阶段百分比与生理细节 */}
      {isExpanded && (
        <div className="pt-2 space-y-3 animate-fade-in border-t border-amber-100/60 text-xs">
          <div className="p-3 bg-[#fbf9f5] rounded-2xl border border-amber-100/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px]">各睡眠阶段百分比：</span>
              <span className="text-[10px] text-slate-400">
                睡眠效率 {bandData.sleepEfficiency}% · 清醒 {bandData.awakeCount} 次
              </span>
            </div>

            {/* 彩色睡眠阶段堆叠进度条 */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${bandData.deepSleepPercentage}%` }}
                className="bg-indigo-700 h-full"
                title={`深睡 ${bandData.deepSleepPercentage}%`}
              />
              <div
                style={{ width: `${bandData.lightSleepPercentage}%` }}
                className="bg-sky-400 h-full"
                title={`浅睡 ${bandData.lightSleepPercentage}%`}
              />
              <div
                style={{ width: `${bandData.remSleepPercentage}%` }}
                className="bg-cyan-300 h-full"
                title={`快速眼动 REM ${bandData.remSleepPercentage}%`}
              />
              <div
                style={{ width: `${bandData.awakePercentage}%` }}
                className="bg-orange-400 h-full"
                title={`清醒 ${bandData.awakePercentage}%`}
              />
            </div>

            <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
              <div className="p-1 rounded-lg bg-indigo-50 text-indigo-900 font-semibold border border-indigo-100">
                深睡 {bandData.deepSleepPercentage}%
              </div>
              <div className="p-1 rounded-lg bg-sky-50 text-sky-800 font-semibold border border-sky-100">
                浅睡 {bandData.lightSleepPercentage}%
              </div>
              <div className="p-1 rounded-lg bg-cyan-50 text-cyan-800 font-semibold border border-cyan-100">
                快速眼动 {bandData.remSleepPercentage}%
              </div>
              <div className="p-1 rounded-lg bg-orange-50 text-orange-800 font-semibold border border-orange-100">
                清醒 {bandData.awakePercentage}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-2xl bg-white border border-amber-100/70">
              <span className="text-[10px] text-slate-400 block mb-0.5">入睡时间</span>
              <span className="font-bold text-slate-800 font-mono text-xs">
                {bandData.fallAsleepTime}
              </span>
            </div>
            <div className="p-2 rounded-2xl bg-white border border-amber-100/70">
              <span className="text-[10px] text-slate-400 block mb-0.5">醒来时间</span>
              <span className="font-bold text-slate-800 font-mono text-xs">
                {bandData.wakeUpTime}
              </span>
            </div>
            <div className="p-2 rounded-2xl bg-white border border-amber-100/70">
              <span className="text-[10px] text-slate-400 block mb-0.5">静息心率</span>
              <span className="font-bold text-rose-600 font-mono text-xs">
                {bandData.restingHeartRate} <span className="text-[10px] font-normal text-slate-400">次/分</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Health Connect (健康连接) 对接向导弹窗 */}
      {showConnectGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-sky-100 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-3.5 animate-fade-in text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-sky-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <h4 className="font-bold text-sm text-slate-800">
                  小米手环 10 ➔ Health Connect 授权指南
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowConnectGuide(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800">
                只需一次授权，手环步数、热量与各阶段睡眠将自动同步：
              </p>
              <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-1.5 font-medium">
                <div>1. 打开手机自带的【小米运动健康 (Mi Fitness)】App；</div>
                <div>2. 点击右下角【我的】➔【数据管理 / 第三方数据授权】；</div>
                <div>3. 找到【健康连接 (Health Connect)】，勾选允许共享步数、睡眠与活动热量；</div>
                <div>4. 回到本 App，点击【申请权限并读取】即可自动流转！</div>
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConnectGuide(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200"
              >
                我已了解
              </button>
              <button
                type="button"
                onClick={async () => {
                  const perm = await requestHealthPermissions();
                  alert(perm.message);
                  setShowConnectGuide(false);
                }}
                className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
              >
                唤起系统授权弹窗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

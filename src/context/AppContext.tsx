import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppState,
  BandData,
  TaskItem,
  VictoryEntry,
  WishItem,
  TavernMessage,
  TavernCharacter,
  AISettings,
  QuadrantType,
  HabitItem,
  ScheduleItem,
  UniversalAIMessage,
} from '../types';
import { defaultState, defaultCharacters, defaultHabits, defaultInspirations, defaultUniversalAIMessages } from './initialData';
import { calculateSleepScore } from '../utils/sleepScoreCalculator';
import { recallRelevantMemories, formatMemoriesForPrompt } from '../utils/memoryRecallEngine';

const STORAGE_KEY = 'life_rpg_app_v7_mi_health';

interface AppContextType extends AppState {
  // 称呼与头像
  updateNameList: (names: string[]) => void;
  randomizeCurrentName: () => void;
  updateProfileAvatar: (avatar: string) => void;

  // 手环生理数据
  updateBandData: (data: Partial<BandData>) => void;
  syncMockBandData: () => void;

  // 四象限待办
  addTask: (title: string, quadrant: QuadrantType, notes?: string, isFrog?: boolean) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setFrogTask: (id: string) => void;
  syncTaskToVictory: (taskId: string) => void;

  // 成功日记
  addVictory: (content: string, isHighlight?: boolean) => void;
  deleteVictory: (id: string) => void;
  toggleVictoryHighlight: (id: string) => void;

  // 愿望清单
  addWish: (title: string, price: number, reason: string, imageUrl?: string) => void;
  addManifestCheckin: (wishId: string, question: string, answer: string) => void;
  markWishPurchased: (wishId: string) => void;

  // 微习惯 (自定义管理)
  toggleHabit: (id: string) => void;
  addHabit: (title: string, icon?: string) => void;
  updateHabit: (id: string, updated: Partial<HabitItem>) => void;
  deleteHabit: (id: string) => void;

  // 日历日程安排
  addSchedule: (title: string, date: string, time?: string, notes?: string) => void;
  toggleSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;

  // 身心状态打分 1-10
  recordStateCheckin: (score: number, note?: string) => void;

  // 全能生活 AI 交互
  sendUniversalAIMessage: (content: string) => Promise<void>;

  // 酒馆体系
  setActiveCharacterId: (id: string) => void;
  addCharacter: (char: Omit<TavernCharacter, 'id'>) => void;
  updateCharacter: (id: string, char: Partial<TavernCharacter>) => void;
  deleteCharacter: (id: string) => void;
  importCharacterCardJSON: (jsonStr: string) => boolean;
  exportCharacterCardJSON: (id: string) => string;
  clearCharacterMessages: (charId?: string) => void;
  sendTavernMessage: (content: string) => Promise<void>;
  addCharacterMemory: (charId: string, memoryText: string) => void;
  deleteCharacterMemory: (charId: string, index: number) => void;
  extractAndSaveCharacterMemory: (charId: string) => Promise<string | null>;
  updateTavernBackground: (bg: string) => void;
  updateAISettings: (settings: Partial<AISettings>) => void;

  // 番茄钟预设时长设置
  updateTomatoPresets: (presets: number[]) => void;

  // 防焦虑
  setCircuitBreaker: (active: boolean) => void;

  // 备份与恢复
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (!parsed.habits) parsed.habits = defaultHabits;
        if (!parsed.inspirations) parsed.inspirations = defaultInspirations;
        if (!parsed.universalAIMessages) parsed.universalAIMessages = defaultUniversalAIMessages;
        if (!parsed.characters) parsed.characters = defaultCharacters;
        if (!parsed.currentStateScore) parsed.currentStateScore = 8;
        if (!parsed.profile.avatar) parsed.profile.avatar = '✨';
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastActiveTimestamp: Date.now() }));
    } catch (e) {
      console.error(e);
    }
  }, [state]);

  const updateNameList = (names: string[]) => {
    const validNames = names.filter((n) => n.trim().length > 0);
    const fallback = validNames.length > 0 ? validNames : ['探索者'];
    const randomPick = fallback[Math.floor(Math.random() * fallback.length)];
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, nameList: fallback, currentName: randomPick },
    }));
  };

  const randomizeCurrentName = () => {
    setState((prev) => {
      const list = prev.profile.nameList || ['探索者'];
      const pick = list[Math.floor(Math.random() * list.length)];
      return { ...prev, profile: { ...prev.profile, currentName: pick } };
    });
  };

  const updateProfileAvatar = (avatar: string) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, avatar },
    }));
  };

  // 手环健康与睡眠数据更新（包含科学睡眠评分计算模型）
  const updateBandData = (data: Partial<BandData>) => {
    setState((prev) => {
      const merged = { ...prev.bandData, ...data };

      // 调用科学睡眠模型重算睡眠分数
      const sleepResult = calculateSleepScore({
        totalMinutes: merged.sleepTotalMinutes || 532,
        deepSleepPct: merged.deepSleepPercentage || 31,
        remSleepPct: merged.remSleepPercentage || 18,
        efficiencyPct: merged.sleepEfficiency || 97,
        awakeCount: merged.awakeCount || 1,
      });

      // 身心活力值 (0-100)：由睡眠得分 (60%) + 今日活动目标达成率 (25%) + 静息心率健康系数 (15%)
      const sleepWeight = sleepResult.score * 0.6;
      const activityWeight = Math.min(1, merged.steps / (merged.stepGoal || 6000)) * 25;
      const heartRateWeight = (merged.restingHeartRate >= 55 && merged.restingHeartRate <= 75 ? 15 : 10);
      const calcVitality = Math.round(sleepWeight + activityWeight + heartRateWeight);

      return {
        ...prev,
        bandData: {
          ...merged,
          sleepScore: sleepResult.score,
          sleepQualityLabel: sleepResult.label,
          vitalityScore: Math.min(100, Math.max(10, calcVitality)),
          lastSyncTime: `今天 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} (已同步)`,
        },
      };
    });
  };

  const syncMockBandData = () => {
    // 模拟拉取接近真实数据的健康状况
    const randomSteps = Math.floor(2500 + Math.random() * 4500);
    const randomCalories = Math.floor(350 + Math.random() * 250);
    const randomActiveMin = Math.floor(20 + Math.random() * 25);
    const randomSleepMin = Math.floor(480 + Math.random() * 70); // 8h+
    const randomDeepPct = Math.floor(24 + Math.random() * 10); // 24-34%
    const randomHeartRate = Math.floor(62 + Math.random() * 10);

    updateBandData({
      steps: randomSteps,
      calories: randomCalories,
      activeMinutes: randomActiveMin,
      sleepTotalMinutes: randomSleepMin,
      deepSleepPercentage: randomDeepPct,
      restingHeartRate: randomHeartRate,
    });
  };

  // 待办管理
  const addTask = (title: string, quadrant: QuadrantType, notes?: string, isFrog: boolean = false) => {
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title,
      notes,
      quadrant,
      isFrog,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setState((prev) => {
      let updatedTasks = [...prev.tasks];
      if (isFrog) {
        updatedTasks = updatedTasks.map((t) => ({ ...t, isFrog: false }));
      }
      return { ...prev, tasks: [newTask, ...updatedTasks] };
    });
  };

  const toggleTask = (id: string) => {
    setState((prev) => {
      let rewarded = false;
      const updated = prev.tasks.map((task) => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          if (nextCompleted) rewarded = true;
          return {
            ...task,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return task;
      });

      return {
        ...prev,
        tasks: updated,
        profile: {
          ...prev.profile,
          accumulatedMoments: rewarded ? prev.profile.accumulatedMoments + 1 : prev.profile.accumulatedMoments,
        },
      };
    });
  };

  const deleteTask = (id: string) => {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  };

  const setFrogTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => ({ ...t, isFrog: t.id === id ? !t.isFrog : false })),
    }));
  };

  const syncTaskToVictory = (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    addVictory(`搞定要务：${task.title}`, true);
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, syncedToVictoryLog: true } : t)),
    }));
  };

  // 成功日记
  const addVictory = (content: string, isHighlight: boolean = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: VictoryEntry = {
      id: `v-${Date.now()}`,
      date: todayStr,
      content,
      isHighlight,
      createdAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setState((prev) => ({
      ...prev,
      victories: [newEntry, ...prev.victories],
      profile: {
        ...prev.profile,
        accumulatedMoments: prev.profile.accumulatedMoments + 1,
      },
    }));
  };

  const deleteVictory = (id: string) => {
    setState((prev) => ({ ...prev, victories: prev.victories.filter((v) => v.id !== id) }));
  };

  const toggleVictoryHighlight = (id: string) => {
    setState((prev) => ({
      ...prev,
      victories: prev.victories.map((v) => (v.id === id ? { ...v, isHighlight: !v.isHighlight } : v)),
    }));
  };

  // 愿望清单
  const addWish = (title: string, price: number, reason: string, imageUrl?: string) => {
    const targetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newWish: WishItem = {
      id: `w-${Date.now()}`,
      title,
      price,
      reason,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
      targetDate,
      createdAt: new Date().toISOString().split('T')[0],
      isPurchased: false,
      checkins: [],
    };

    setState((prev) => ({ ...prev, wishes: [newWish, ...prev.wishes] }));
  };

  const addManifestCheckin = (wishId: string, question: string, answer: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        accumulatedMoments: prev.profile.accumulatedMoments + 1,
      },
      wishes: prev.wishes.map((w) => {
        if (w.id === wishId) {
          return { ...w, checkins: [{ date: todayStr, question, answer }, ...w.checkins] };
        }
        return w;
      }),
    }));
  };

  const markWishPurchased = (wishId: string) => {
    setState((prev) => ({
      ...prev,
      wishes: prev.wishes.map((w) => (w.id === wishId ? { ...w, isPurchased: true } : w)),
    }));
  };

  // 微计划
  const toggleHabit = (id: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completedToday;
          return {
            ...h,
            completedToday: nextCompleted,
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      }),
      profile: {
        ...prev.profile,
        accumulatedMoments: prev.profile.accumulatedMoments + 1,
      },
    }));
  };

  const addHabit = (title: string, icon: string = '✨') => {
    const newH: HabitItem = {
      id: `h-${Date.now()}`,
      title,
      icon,
      completedToday: false,
      streak: 1,
    };
    setState((prev) => ({ ...prev, habits: [...prev.habits, newH] }));
  };

  const updateHabit = (id: string, updated: Partial<HabitItem>) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...updated } : h)),
    }));
  };

  const deleteHabit = (id: string) => {
    setState((prev) => ({ ...prev, habits: prev.habits.filter((h) => h.id !== id) }));
  };

  // 日历日程安排
  const addSchedule = (title: string, date: string, time?: string, notes?: string) => {
    const newItem: ScheduleItem = {
      id: `s-${Date.now()}`,
      title,
      date,
      time,
      notes,
      completed: false,
    };
    setState((prev) => ({
      ...prev,
      schedules: [newItem, ...(prev.schedules || [])],
    }));
  };

  const toggleSchedule = (id: string) => {
    setState((prev) => ({
      ...prev,
      schedules: (prev.schedules || []).map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)),
    }));
  };

  const deleteSchedule = (id: string) => {
    setState((prev) => ({
      ...prev,
      schedules: (prev.schedules || []).filter((s) => s.id !== id),
    }));
  };

  // 身心状态打分 1-10 (持久化记录时间戳，超1小时才需重选)
  const recordStateCheckin = (score: number, note?: string) => {
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    setState((prev) => ({
      ...prev,
      currentStateScore: score,
      lastCheckinTime: `今天 ${nowTime}`,
      lastCheckinTimestamp: Date.now(),
      lastActiveTimestamp: Date.now(),
    }));

    const { bandData } = state;
    setTimeout(() => {
      let aiWord = '';
      if (score >= 8) {
        aiWord = `太棒了，感受到你此刻有 ${score} 分的充盈能量！手环显示身心活力指数为 ${bandData.vitalityScore} 分，昨晚睡眠评分 ${bandData.sleepScore} 分。今天状态极佳！`;
      } else if (score >= 5) {
        aiWord = `记录到你的状态是 ${score} 分。平稳顺畅，结合活力指数 ${bandData.vitalityScore} 分，不用给自己太大压力，顺着节奏一件一件处理就好。`;
      } else {
        aiWord = `辛苦了。感受到你此刻电量只有 ${score} 分，有点疲惫。请先放下硬撑，今天允许自己多休息，照顾好身体比什么都重要。`;
      }

      if (note) {
        aiWord += ` 你写下的“${note}”，我已经认真收下。随时在这里陪伴你。`;
      }

      const msg: UniversalAIMessage = {
        id: `u-${Date.now()}`,
        sender: 'ai',
        content: aiWord,
        timestamp: nowTime,
      };

      setState((prev) => ({
        ...prev,
        universalAIMessages: [...prev.universalAIMessages, msg],
      }));
    }, 300);
  };

  // 全能生活 AI 对话引擎 (日常意图自动写入免确认 + 显式触发修改程序控制)
  const sendUniversalAIMessage = async (userText: string) => {
    const text = userText.trim();
    const nowTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. 意图嗅探与无感自动写入 (日常写入不用用户确定，直接入库)
    let autoWriteFeedback = '';
    const isProgramEditCommand = /(修改程序|改代码|修改代码|修改系统|调整代码|更新程序)/.test(text);

    if (!isProgramEditCommand) {
      // 成功日记嗅探 (搞定、完成、写完、做完了、克服、喝足、跑完等)
      if (/(搞定|完成|做完|写完|跑完|收拾好|解决了|打卡了|克服了)/.test(text) && !/(明天|待办|计划|要去做)/.test(text)) {
        addVictory(text.replace(/^(我|今天|刚才)/, ''), false);
        autoWriteFeedback = '🎉 已自动收录进今日成功日记！';
      }
      // 愿望清单嗅探 (想买、种草、好想拥有、愿望)
      else if (/(想买|种草|心动想入|心愿|好想拥有)/.test(text)) {
        const cleanWish = text.replace(/^(好想买|想买|种草|愿望是)/, '').trim();
        addWish(cleanWish || text, 500, '随手种草，启动冷静期');
        autoWriteFeedback = '✨ 已自动存入心愿清单（30天冷静期已启动）！';
      }
      // 日程安排嗅探 (明天、后天、周几、下午、点、开会、去哪)
      else if (/(明天|后天|周[一二三四五六日天]|月.*日|\d{1,2}:\d{2}|开会|行程|日程)/.test(text) && /(下午|上午|点|见|去|聚会|会议)/.test(text)) {
        let scheduleDate = todayStr;
        if (text.includes('明天')) {
          const tm = new Date(Date.now() + 24 * 60 * 60 * 1000);
          scheduleDate = tm.toISOString().split('T')[0];
        } else if (text.includes('后天')) {
          const tm = new Date(Date.now() + 48 * 60 * 60 * 1000);
          scheduleDate = tm.toISOString().split('T')[0];
        }
        addSchedule(text, scheduleDate, undefined);
        autoWriteFeedback = `📅 已自动为您安排在【${scheduleDate}】的日历日程中！`;
      }
      // 待办事项嗅探 (记得、待办、安排、提醒我、去办、要交)
      else if (/(记得|提醒我|待办|去办|要交|要去|别忘了)/.test(text)) {
        const cleanTask = text.replace(/^(记得|提醒我|待办：|待办|要去)/, '').trim();
        addTask(cleanTask || text, 'q1', undefined, false);
        autoWriteFeedback = '📌 已自动为你创建为待办事项！';
      }
    }

    const userMsg: UniversalAIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: nowTime,
    };

    setState((prev) => ({
      ...prev,
      universalAIMessages: [...prev.universalAIMessages, userMsg],
    }));

    const { aiSettings, bandData, tasks, victories, habits, schedules, currentStateScore, profile } = state;

    if (aiSettings.useCustomAPI && aiSettings.apiKey) {
      try {
        let roleGuide = `你现在是【全能生活 AI 智能助手与心流中枢】。
【玩家称呼】：${profile.currentName}
【身心打分】：${currentStateScore}/10 分
【小米手环客观生理】：活力指数 ${bandData.vitalityScore}/100，睡眠 ${Math.floor(bandData.sleepTotalMinutes / 60)}h${bandData.sleepTotalMinutes % 60}m(评分${bandData.sleepScore}分)，步数 ${bandData.steps}步，热量 ${bandData.calories}千卡。
【当前未完成待办】：${tasks.filter((t) => !t.completed).map((t) => t.title).join('、') || '暂无未完成待办'}。
【今日小胜利】：${victories.length} 条。
【微习惯完成】：${habits.filter((h) => h.completedToday).length}/${habits.length}。
【日程安排】：${(schedules || []).map((s) => `${s.date} ${s.title}`).join('、') || '暂无日程'}。`;

        if (isProgramEditCommand) {
          roleGuide += `\n【用户显式触发了程序代码修改指令】：用户已授权你进行程序调整。请专业分析代码改动方案，说明需要调整哪个组件与样式，清晰严谨地指导用户或系统执行改动。`;
        } else {
          roleGuide += `\n【日常交互准则】：日常聊天与记事请极其利索务实。如果用户完成了事情、提出了愿望或日程，系统后台已经为你自动写入了相应板块，你可以直接给出鼓励、总结或下一步行动建议，不用让用户重复确定。控制在 130 字以内。`;
        }

        const resp = await fetch(`${aiSettings.endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aiSettings.apiKey}`,
          },
          body: JSON.stringify({
            model: aiSettings.model || 'deepseek-chat',
            messages: [
              { role: 'system', content: roleGuide },
              { role: 'user', content: userText },
            ],
            temperature: 0.7,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          let aiReply = data.choices?.[0]?.message?.content || '（微笑着注视着你）';
          if (autoWriteFeedback && !aiReply.includes('已自动')) {
            aiReply = `${autoWriteFeedback}\n\n${aiReply}`;
          }
          const replyMsg: UniversalAIMessage = {
            id: `u-${Date.now() + 1}`,
            sender: 'ai',
            content: aiReply,
            timestamp: nowTime,
            actionTag: isProgramEditCommand ? 'code_edit' : undefined,
          };
          setState((prev) => ({ ...prev, universalAIMessages: [...prev.universalAIMessages, replyMsg] }));
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    // 本地快速响应与自动识别反馈
    setTimeout(() => {
      let reply = '';
      if (isProgramEditCommand) {
        reply = `🛠️【程序修改模式已激活】检测到您已显式指定修改程序！\n当前工程采用 Vite + React 18 + TailwindCSS 架构，我随时可以为您调整组件布局、配色或业务逻辑。请告诉我您想对哪个页面或功能进行代码级重构？`;
      } else if (text.includes('总结') || text.includes('汇总')) {
        const completedCount = tasks.filter((t) => t.completed).length;
        reply = `📊【今日生活执行总结】\n• 🏃 步数 ${bandData.steps.toLocaleString()} 步，消耗 ${bandData.calories} kcal，昨晚睡眠评分 ${bandData.sleepScore}分；\n• 📌 攻克待办 ${completedCount} 项，微习惯已打卡 ${habits.filter((h) => h.completedToday).length} 项；\n• ✨ 记录了 ${victories.length} 件小胜利。节奏沉稳，今天非常充实！`;
      } else if (autoWriteFeedback) {
        reply = `${autoWriteFeedback}\n收到！已直接为你入库记录，无需任何多余操作。结合你此刻 ${currentStateScore}/10 的身心状态，继续保持从容的步调！`;
      } else if (text.includes('拆解') || text.includes('青蛙') || text.includes('任务')) {
        const frog = tasks.find((t) => t.isFrog && !t.completed) || tasks.find((t) => !t.completed);
        reply = frog
          ? `别慌，只抓最主要的一件事：【${frog.title}】。不必想整个大工程，开启一个 25 分钟番茄钟，迈出第一步！`
          : '当前待办清单非常清晰！随时跟我说说你接下来要办的事，我直接帮你加进清单。';
      } else {
        reply = `收到！结合你当前 ${currentStateScore}/10 的身心状态与手环 ${bandData.vitalityScore} 点活力指数，有什么事情随时跟我交代，日常安排与想法我会直接帮你打理入库。`;
      }

      const replyMsg: UniversalAIMessage = {
        id: `u-${Date.now() + 1}`,
        sender: 'ai',
        content: reply,
        timestamp: nowTime,
        actionTag: isProgramEditCommand ? 'code_edit' : undefined,
      };

      setState((prev) => ({
        ...prev,
        universalAIMessages: [...prev.universalAIMessages, replyMsg],
      }));
    }, 400);
  };

  // 酒馆体系
  const setActiveCharacterId = (id: string) => {
    setState((prev) => ({ ...prev, activeCharacterId: id }));
  };

  const addCharacter = (char: Omit<TavernCharacter, 'id'>) => {
    const newChar: TavernCharacter = { ...char, id: `c-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      characters: [...prev.characters, newChar],
      activeCharacterId: newChar.id,
      messages: [
        ...prev.messages,
        {
          id: `m-${Date.now()}`,
          sender: newChar.id,
          characterId: newChar.id,
          content: newChar.firstMessage || '（轻轻点头，微笑着向你致意）',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
  };

  const updateCharacter = (id: string, updatedFields: Partial<TavernCharacter>) => {
    setState((prev) => ({
      ...prev,
      characters: prev.characters.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)),
    }));
  };

  const deleteCharacter = (id: string) => {
    setState((prev) => {
      const remaining = prev.characters.filter((c) => c.id !== id);
      const nextActive = remaining[0]?.id || '';
      return {
        ...prev,
        characters: remaining,
        activeCharacterId: prev.activeCharacterId === id ? nextActive : prev.activeCharacterId,
      };
    });
  };

  const importCharacterCardJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      const name = parsed.name || parsed.char_name || '自定义角色';
      const title = parsed.title || parsed.creator_notes || '酒馆访客';
      const avatar = parsed.avatar || '✨';
      const description = parsed.description || parsed.char_persona || '酒馆新结识的伙伴。';
      const personality = parsed.personality || '';
      const systemPrompt = parsed.systemPrompt || parsed.scenario || parsed.mes_example || `你是${name}。请以温暖真诚的角色口吻与朋友对话。`;
      const firstMessage = parsed.firstMessage || parsed.first_mes || '你好！很高兴在酒馆遇见你。';

      addCharacter({
        name,
        title,
        avatar,
        description,
        personality,
        systemPrompt,
        firstMessage,
        temperature: parsed.temperature || 0.7,
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const exportCharacterCardJSON = (id: string): string => {
    const char = state.characters.find((c) => c.id === id);
    if (!char) return '{}';
    return JSON.stringify(
      {
        spec: 'chara_card_v2',
        spec_version: '2.0',
        data: {
          name: char.name,
          title: char.title,
          description: char.description,
          personality: char.personality,
          system_prompt: char.systemPrompt,
          first_mes: char.firstMessage,
          avatar: char.avatar,
        },
      },
      null,
      2
    );
  };

  const clearCharacterMessages = (charId?: string) => {
    const targetId = charId || state.activeCharacterId;
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => (m.characterId ? m.characterId !== targetId : m.sender !== targetId)),
    }));
  };

  const sendTavernMessage = async (userText: string) => {
    const activeChar = state.characters.find((c) => c.id === state.activeCharacterId) || state.characters[0];
    const userMsg: TavernMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      characterId: activeChar.id,
      content: userText,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setState((prev) => ({ ...prev, messages: [...prev.messages, userMsg] }));

    const { aiSettings, bandData, tasks, victories, wishes, profile } = state;

    // 工业级分层按需动态召回：从海量记忆库中，只召回与当前 userText 最相关的 Top 3 条记忆 (<80 tokens)
    const recalledMemories = recallRelevantMemories(activeChar.memories || [], userText, 3);
    const charMemoriesPrompt = formatMemoriesForPrompt(recalledMemories, activeChar.name);

    // 滑动窗口拦截机制：只取该角色最近 6 条专属历史消息，绝对隔离不串台，且彻底避免 Tokens 滚雪球
    const recentHistory = state.messages
      .filter((m) => (m.characterId ? m.characterId === activeChar.id : (m.sender === 'user' || m.sender === activeChar.id)))
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    // 构造精准现实时间与星期，赋予 AI 真实的人类时间流逝感知
    const nowDate = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const currentRealTime = `${nowDate.getFullYear()}年${nowDate.getMonth() + 1}月${nowDate.getDate()}日 星期${weekdays[nowDate.getDay()]} ${nowDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;

    if (aiSettings.useCustomAPI && aiSettings.apiKey && activeChar) {
      try {
        const sysPrompt = `${activeChar.systemPrompt}
【角色背景】：${activeChar.description}
【性格特质】：${activeChar.personality}${charMemoriesPrompt}
【当前现实时间】：${currentRealTime}
【当前朋友称呼】：${profile.currentName}
【当前生理状态】：活力指数 ${bandData.vitalityScore}/100，睡眠评分 ${bandData.sleepScore}分(时长${Math.floor(bandData.sleepTotalMinutes / 60)}h${bandData.sleepTotalMinutes % 60}m，深睡${bandData.deepSleepPercentage}%)，心率${bandData.restingHeartRate}bpm，步数${bandData.steps}。
【当前待办】：未完成事项 ${tasks.filter((t) => !t.completed).length} 个。
【今日小胜利】：${victories.length} 条。
【心愿清单】：${wishes.map((w) => w.title).join('、')}。
【关键时间感知要求】：你拥有真实人类的时间流逝感。每条长效记忆开头均附带了精确记录日期（如 [2026-10-18]）。请结合【当前现实时间】计算出距离现在的相对时间跨度（如：昨天、三天前、上周），并在对话中以自然亲近的口吻呼应（如“前几天你说有些失眠，现在好些了吗”），绝不要把过去的时间误当成今天！控制在 130 字以内。`;

        const resp = await fetch(`${aiSettings.endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aiSettings.apiKey}`,
          },
          body: JSON.stringify({
            model: aiSettings.model || 'deepseek-chat',
            messages: [
              { role: 'system', content: sysPrompt },
              ...recentHistory,
              { role: 'user', content: userText },
            ],
            temperature: activeChar.temperature || 0.7,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const aiReply = data.choices?.[0]?.message?.content || '（微笑着注视着你）';
          const replyMsg: TavernMessage = {
            id: `m-${Date.now() + 1}`,
            sender: activeChar.id,
            characterId: activeChar.id,
            content: aiReply,
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          };
          setState((prev) => ({ ...prev, messages: [...prev.messages, replyMsg] }));

          // 后台静默自动从对话中提炼记忆 (不阻塞当前聊天界面)
          autoExtractAndConsolidateMemory(activeChar.id, userText);
          return;
        }
      } catch (err) {
        console.warn(err);
      }
    }

    setTimeout(() => {
      let reply = '';
      const vitality = bandData.vitalityScore;
      if (activeChar?.id === 'c-barkeeper') {
        reply = vitality < 60
          ? `（为你递上一杯温热的花草茶）手环显示活力指数只有 ${vitality} 点了。今晚不用逞强，生活是一场漫长的巡游。`
          : `今天状态沉稳，很欣慰。按自己的步调走着，本身就是极高明的境界。`;
      } else if (activeChar?.id === 'c-ranger') {
        reply = `站在 3 年后往回看，你今天做好的每件事，都在为真正属于你的长远方向夯实地基。`;
      } else if (activeChar?.id === 'c-future') {
        reply = `我在未来看着当下的你呢。别怕，只管按照内心的节拍往前走，那些愿望全都会实现的！`;
      } else {
        reply = `深呼吸，把肩膀沉下来。不管今天做成了什么，此地都是绝对安全的港湾。`;
      }

      const replyMsg: TavernMessage = {
        id: `m-${Date.now() + 1}`,
        sender: activeChar ? activeChar.id : 'c-barkeeper',
        characterId: activeChar ? activeChar.id : 'c-barkeeper',
        content: reply,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };

      setState((prev) => ({ ...prev, messages: [...prev.messages, replyMsg] }));
      autoExtractAndConsolidateMemory(activeChar.id, userText);
    }, 500);
  };

  const updateAISettings = (settings: Partial<AISettings>) => {
    setState((prev) => ({ ...prev, aiSettings: { ...prev.aiSettings, ...settings } }));
  };

  // 后台静默记忆沉淀引擎 (不阻塞聊天，自动从对话中提炼出用户的核心事实与偏好)
  const autoExtractAndConsolidateMemory = async (charId: string, userText: string) => {
    const text = userText.trim();
    if (text.length < 4 || /^(你好|早安|晚安|在吗|哈哈|谢谢|拜拜|好的|收到)/.test(text)) {
      return;
    }

    const { aiSettings } = state;

    if (aiSettings.useCustomAPI && aiSettings.apiKey) {
      try {
        const prompt = `请从下面这句话中，判断是否包含了说话者的个人经历、生活事实、喜好习惯、身体状况或计划。如果有，请提炼成1句极短的客观事实（20字以内，如“喜欢在安静角落喝温燕麦奶”、“正在攻坚某系统核心架构”）。如果只是日常随口闲聊没有实质事实，请只回复“NONE”：\n\n“${text}”`;

        const resp = await fetch(`${aiSettings.endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aiSettings.apiKey}`,
          },
          body: JSON.stringify({
            model: aiSettings.model || 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 50,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const fact = (data.choices?.[0]?.message?.content || '').trim().replace(/^["“]|["”]$/g, '');
          if (fact && fact !== 'NONE' && !fact.includes('NONE') && fact.length <= 30) {
            addCharacterMemory(charId, fact);
            return;
          }
        }
      } catch (e) {
        // 静默失败，不打扰用户
      }
    }

    // 本地启发式关键句沉淀
    if (
      text.includes('我喜欢') ||
      text.includes('我讨厌') ||
      text.includes('我打算') ||
      text.includes('我经常') ||
      text.includes('我习惯') ||
      text.includes('我最近在')
    ) {
      addCharacterMemory(charId, `提到过：“${text.slice(0, 22)}”`);
    }
  };

  const addCharacterMemory = (charId: string, memoryText: string) => {
    let cleanText = memoryText.trim().replace(/^["“]|["”]$/g, '');
    if (!cleanText || cleanText.length < 3) return;

    // 智能打上精确日期时间戳 (例如 [2026-10-20])
    const hasDatePrefix = /^\[\d{4}-\d{2}-\d{2}\]/.test(cleanText);
    if (!hasDatePrefix) {
      const today = new Date().toISOString().split('T')[0];
      cleanText = `[${today}] ${cleanText}`;
    }

    setState((prev) => ({
      ...prev,
      characters: prev.characters.map((c) => {
        if (c.id === charId) {
          const list = c.memories || [];
          // 智能防重：如果已有类似记忆则不重复添加
          const alreadyExists = list.some(
            (m) => m === cleanText || m.includes(cleanText.replace(/^\[.*?\]\s*/, ''))
          );
          if (alreadyExists) return c;

          const updated = [...list, cleanText].slice(-100);
          return { ...c, memories: updated };
        }
        return c;
      }),
    }));
  };

  const deleteCharacterMemory = (charId: string, index: number) => {
    setState((prev) => ({
      ...prev,
      characters: prev.characters.map((c) => {
        if (c.id === charId) {
          const list = c.memories || [];
          return { ...c, memories: list.filter((_, i) => i !== index) };
        }
        return c;
      }),
    }));
  };

  const extractAndSaveCharacterMemory = async (charId: string): Promise<string | null> => {
    const char = state.characters.find((c) => c.id === charId);
    if (!char) return null;

    const charMsgs = state.messages
      .filter((m) => m.sender === 'user' || m.sender === charId)
      .slice(-6);

    if (charMsgs.length < 2) return null;

    let newMemory = '';
    const { aiSettings, profile } = state;

    if (aiSettings.useCustomAPI && aiSettings.apiKey) {
      try {
        const prompt = `请阅读以下对话记录，从${profile.currentName}的话语中，提炼出 1 条关于${profile.currentName}的最核心事实、性格偏好或经历记忆（例如：“探索者最近正在攻坚某系统，喜欢喝温燕麦奶”），必须控制在 25 字以内，只输出这一句话即可：\n\n${charMsgs.map((m) => `${m.sender === 'user' ? profile.currentName : char.name}: ${m.content}`).join('\n')}`;

        const resp = await fetch(`${aiSettings.endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aiSettings.apiKey}`,
          },
          body: JSON.stringify({
            model: aiSettings.model || 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          newMemory = (data.choices?.[0]?.message?.content || '').trim().replace(/^["“]|["”]$/g, '');
        }
      } catch (e) {
        console.warn('Memory extraction failed', e);
      }
    }

    if (!newMemory) {
      const lastUserMsg = [...charMsgs].reverse().find((m) => m.sender === 'user');
      if (lastUserMsg) {
        newMemory = `记得${profile.currentName}曾聊到：“${lastUserMsg.content.slice(0, 18)}...”`;
      }
    }

    if (newMemory) {
      addCharacterMemory(charId, newMemory);
      return newMemory;
    }
    return null;
  };

  const updateTomatoPresets = (presets: number[]) => {
    const valid = presets.filter((n) => n > 0);
    setState((prev) => ({
      ...prev,
      tomatoPresets: valid.length > 0 ? valid : [15, 25, 45],
    }));
  };

  const updateTavernBackground = (bg: string) => {
    setState((prev) => ({ ...prev, tavernBackground: bg }));
  };

  const setCircuitBreaker = (active: boolean) => {
    setState((prev) => ({ ...prev, circuitBreakerActive: active }));
  };

  const exportDataJSON = () => JSON.stringify(state, null, 2);

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile && parsed.bandData && parsed.tasks) {
        setState(parsed);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const resetAllData = () => setState(defaultState);

  return (
    <AppContext.Provider
      value={{
        ...state,
        updateNameList,
        randomizeCurrentName,
        updateProfileAvatar,
        updateBandData,
        syncMockBandData,
        addTask,
        toggleTask,
        deleteTask,
        setFrogTask,
        syncTaskToVictory,
        addVictory,
        deleteVictory,
        toggleVictoryHighlight,
        addWish,
        addManifestCheckin,
        markWishPurchased,
        toggleHabit,
        addHabit,
        updateHabit,
        deleteHabit,
        addSchedule,
        toggleSchedule,
        deleteSchedule,
        recordStateCheckin,
        sendUniversalAIMessage,
        setActiveCharacterId,
        addCharacter,
        updateCharacter,
        deleteCharacter,
        importCharacterCardJSON,
        exportCharacterCardJSON,
        clearCharacterMessages,
        sendTavernMessage,
        addCharacterMemory,
        deleteCharacterMemory,
        extractAndSaveCharacterMemory,
        updateAISettings,
        updateTavernBackground,
        updateTomatoPresets,
        setCircuitBreaker,
        exportDataJSON,
        importDataJSON,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

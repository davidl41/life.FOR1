export type QuadrantType = 'q1' | 'q2' | 'q3' | 'q4';

export interface UserProfile {
  nameList: string[];
  currentName: string;
  avatar: string; // 自定义头像 (base64 或 emoji)
  journeyDays: number;
  accumulatedMoments: number;
}

export interface BandData {
  // 今日核心活力与运动指标
  calories: number; // 当前消耗热量 (kcal)
  calorieGoal: number; // 目标热量 (如 500 kcal)
  steps: number; // 今日步数 (如 1801)
  stepGoal: number; // 目标步数 (如 6000)
  activeMinutes: number; // 今日活动时长 (分钟)
  activeMinutesGoal: number; // 活动目标 (如 30 分钟)
  restingHeartRate: number; // 静息心率 (如 69 bpm)

  // 小米手环 10 真实睡眠指标
  sleepTotalMinutes: number; // 睡眠总时长 (如 532 分钟 = 8小时52分)
  fallAsleepTime: string; // 入睡时间 (如 '20:36')
  wakeUpTime: string; // 醒来时间 (如 '05:32')
  deepSleepPercentage: number; // 深睡占比 (如 31%)
  lightSleepPercentage: number; // 浅睡占比 (如 48%)
  remSleepPercentage: number; // 快速眼动占比 (如 18%)
  awakePercentage: number; // 清醒占比 (如 3%)
  awakeCount: number; // 清醒次数 (如 1 次)
  sleepEfficiency: number; // 睡眠效率 (如 97%)
  sleepScore: number; // 基于时长和比例科学计算的睡眠评分 (如 89 分)
  sleepQualityLabel: string; // 睡眠评语 (如 '睡眠质量良好')

  // 活力指数 (原身体电量更名)
  vitalityScore: number; // 0-100 身心活力指数 (由睡眠评分与身体恢复驱动)
  lastSyncTime: string;
}

export interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  quadrant: QuadrantType;
  isFrog?: boolean;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  syncedToVictoryLog?: boolean;
}

export interface VictoryEntry {
  id: string;
  date: string;
  content: string;
  isHighlight?: boolean;
  createdAt: string;
}

export interface ManifestCheckin {
  date: string;
  question: string;
  answer: string;
}

export interface WishItem {
  id: string;
  title: string;
  price: number;
  reason: string;
  imageUrl?: string;
  targetDate: string; // 30天冷静期截止日
  createdAt: string;
  isPurchased: boolean;
  checkins: ManifestCheckin[];
}

// 微计划 (Atomic Habits)
export interface HabitItem {
  id: string;
  title: string;
  icon: string;
  completedToday: boolean;
  streak: number;
}

// 灵感与杂念闪念 (Brain Dump)
export interface InspirationItem {
  id: string;
  content: string;
  category?: 'todo' | 'wish' | 'victory' | 'raw';
  createdAt: string;
}

// 日程安排 (Schedule Item)
export interface ScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm 如 '14:30'
  title: string;
  notes?: string;
  completed: boolean;
}

// 全能 AI 消息
export interface UniversalAIMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  actionTag?: 'victory' | 'todo' | 'wish' | 'schedule' | 'code_edit';
}

// 酒馆角色卡
export interface TavernCharacter {
  id: string;
  name: string;
  avatar: string;
  title: string;
  description: string;
  personality: string;
  systemPrompt: string;
  firstMessage: string;
  temperature?: number;
  memories?: string[]; // 长期精炼记忆盒 (防滚雪球，精炼核心事实，上限6-8条)
}

export interface TavernMessage {
  id: string;
  sender: 'user' | string;
  characterId: string; // 明确归属于哪个角色的对话流 (100% 独立隔离不串台)
  content: string;
  timestamp: string;
}

export interface AISettings {
  useCustomAPI: boolean;
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface AppState {
  profile: UserProfile;
  bandData: BandData;
  tasks: TaskItem[];
  victories: VictoryEntry[];
  wishes: WishItem[];
  habits: HabitItem[];
  schedules: ScheduleItem[]; // 日历日程安排
  inspirations: InspirationItem[];
  universalAIMessages: UniversalAIMessage[];
  currentStateScore: number;
  lastCheckinTime: string;
  lastCheckinTimestamp: number; // 记录打分时的时间戳，用于判断是否已超过1小时
  lastActiveTimestamp: number;
  characters: TavernCharacter[];
  activeCharacterId: string;
  messages: TavernMessage[];
  tavernBackground: string; // 酒馆可调节背景 (预设主题或相册上传)
  aiSettings: AISettings;
  tomatoPresets: number[]; // 自定义番茄钟预设时长 (如 [15, 25, 45])
  circuitBreakerActive: boolean;
}

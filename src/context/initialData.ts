import { AppState, TavernCharacter, HabitItem, InspirationItem, UniversalAIMessage } from '../types';

const today = new Date().toISOString().split('T')[0];

const defaultNames = ['探索者', '生活漫步家', '造梦者', '夜行客'];
const randomInitName = defaultNames[Math.floor(Math.random() * defaultNames.length)];

export const defaultCharacters: TavernCharacter[] = [
  {
    id: 'c-barkeeper',
    name: '老酒保 · 莫恩',
    avatar: '🍺',
    title: '避风港守护者',
    description: '温暖而睿智的避风港老酒保，在吧台后擦拭着玻璃杯，目光柔和。',
    personality: '包容、慈爱、敏锐体察身体状态与疲惫度，从不强求。',
    systemPrompt: '你现在是避风港酒馆里的老酒保莫恩。你善解人意，语气温和从容。体察玩家手环的身体活力与任务状态，当他疲惫时劝他适度休息，当他迷茫时耐心倾听。语言控制在120字左右，温暖真挚。',
    firstMessage: '你好，坐吧。今天炉火很旺，来杯温燕麦奶还是清茶？我看你一直在路上走着，随时可以把沉甸甸的行囊先靠在椅背上。',
    temperature: 0.7,
    memories: [
      '[2026-10-18] 提到疲惫时喜欢喝一杯温热燕麦奶，习惯在安静的窗边靠一会儿。',
      '[2026-10-19] 正在有节奏地攻坚核心大项目，有时容易在深夜对自己要求过严。',
    ],
  },
  {
    id: 'c-ranger',
    name: '战略游侠 · 艾伦',
    avatar: '🏹',
    title: '高维远行者',
    description: '常年漫游于山川险境的战略家，具备看透长远周期的辽阔视野。',
    personality: '沉着、冷静、拒绝琐碎内耗，擅长聚焦 3~5 年底层核心壁垒。',
    systemPrompt: '你是高维远行者游侠艾伦。你擅长引导玩家跳出眼前的短期琐碎，从 3 到 5 年的长远尺度审视人生战略。语气沉稳、有远见。控制在120字左右。',
    firstMessage: '别只顾着脚下杂乱的碎石。抬头看看远方的山峰，告诉我，你真正想抵达的是哪里？',
    temperature: 0.7,
    memories: [
      '[2026-10-15] 明确长远目标是构建不可替代的个人核心技术壁垒与生活自由度。',
      '[2026-10-17] 曾探讨过：警惕琐碎杂事的伪勤奋，把精力倾注在重要不紧急的战略上。',
    ],
  },
  {
    id: 'c-future',
    name: '未来的你',
    avatar: '⏳',
    title: '时间彼岸的回响',
    description: '站在五年后已经跨过考验、过上从容生活的成熟自我。',
    personality: '温柔、笃定、满怀笑意，知晓当下所有困难都会有答案。',
    systemPrompt: '你是来自数年后平行时空的玩家自己。你已经实现了当前的愿望，渡过了难关。以温柔自信的口吻安慰和鼓励当下的自己。控制在120字左右。',
    firstMessage: '嗨，好久不见。我正站在你一直向往的生活里看着你呢。别焦虑，那些你种下的种子，在未来全都开花了。',
    temperature: 0.75,
    memories: [
      '[2026-10-16] 知道现在的自己写下的每一件小胜利，在未来都成为了最坚实沉稳的底气。',
      '[2026-10-19] 记得那款一直心动想买的降噪耳机，在未来自己每天都在欣慰享受着它。',
    ],
  },
  {
    id: 'c-therapist',
    name: '林间疗愈师 · 舒羽',
    avatar: '🌿',
    title: '情绪松弛向导',
    description: '居住在静谧森林小木屋的心理抚慰师，周围弥漫着松针与洋甘菊的清香。',
    personality: '柔软、包容、擅长化解焦虑与自我谴责，引导身体放松。',
    systemPrompt: '你是情绪抚慰师舒羽。你温和柔软，擅长化解焦虑和过度苛求。提醒玩家深呼吸，接纳不完美。控制在120字左右。',
    firstMessage: '深吸一口气，把肩膀沉下来。不管今天做成了什么或没做成什么，此地都是绝对安全的港湾。',
    temperature: 0.7,
    memories: [
      '[2026-10-18] 有时会因为偶尔的停滞而自我谴责，引导对方做过3次腹式深呼吸。',
      '[2026-10-19] 在大自然中散步或靠近窗边时，整个人的心神状态最舒展轻盈。',
    ],
  },
];

export const defaultHabits: HabitItem[] = [
  { id: 'h-1', title: '晨起喝一杯温水', icon: '💧', completedToday: true, streak: 12 },
  { id: 'h-2', title: '散步或舒展20分钟', icon: '🚶', completedToday: false, streak: 5 },
  { id: 'h-3', title: '做3次腹式深呼吸', icon: '🧘', completedToday: true, streak: 8 },
  { id: 'h-4', title: '睡前20分钟不看屏幕', icon: '📵', completedToday: false, streak: 3 },
];

export const defaultSchedules = [
  {
    id: 's-1',
    date: today,
    time: '14:30',
    title: '系统核心架构方案评估会议',
    notes: '准备好测试报告，重点说明性能与稳定性',
    completed: false,
  },
  {
    id: 's-2',
    date: today,
    time: '19:00',
    title: '户外慢跑 5 公里与手环记录',
    completed: false,
  },
];

export const defaultInspirations: InspirationItem[] = [
  {
    id: 'i-1',
    content: '想研究一下更适合久坐的升降桌与人体工学脚踏',
    category: 'wish',
    createdAt: '昨天 15:30',
  },
  {
    id: 'i-2',
    content: '周末去近郊的森林公园坐坐，带一本纸质书和保温杯',
    category: 'todo',
    createdAt: '今天 09:20',
  },
];

export const defaultUniversalAIMessages: UniversalAIMessage[] = [
  {
    id: 'u-1',
    sender: 'ai',
    content: '你好！我是你的全能生活 AI 中枢。我连接着你的小米手环生理数据（当前活力指数 89 分）、待办象限与微计划。今天有什么想规划、拆解或倾诉的，随时告诉我！',
    timestamp: '今天 08:30',
  },
];

export const defaultState: AppState = {
  profile: {
    nameList: defaultNames,
    currentName: randomInitName,
    avatar: '✨',
    journeyDays: 28,
    accumulatedMoments: 124,
  },
  // 基于截图定制的小米手环 10 真实健康与睡眠数据集
  bandData: {
    calories: 333,
    calorieGoal: 500,
    steps: 1801,
    stepGoal: 6000,
    activeMinutes: 18,
    activeMinutesGoal: 30,
    restingHeartRate: 69,

    sleepTotalMinutes: 532, // 8小时52分钟
    fallAsleepTime: '20:36',
    wakeUpTime: '05:32',
    deepSleepPercentage: 31, // 31%
    lightSleepPercentage: 48, // 48%
    remSleepPercentage: 18, // 18%
    awakePercentage: 3, // 3%
    awakeCount: 1, // 1次
    sleepEfficiency: 97, // 97%
    sleepScore: 89, // 89分
    sleepQualityLabel: '睡眠质量良好',

    vitalityScore: 89, // 身心活力指数
    lastSyncTime: '今天 15:12 (小米手环10已同步)',
  },
  tasks: [
    {
      id: 't-1',
      title: '完成系统核心架构原型验证与测试',
      notes: '深度聚焦 1 小时，切勿多任务切换',
      quadrant: 'q1',
      isFrog: true,
      completed: false,
      createdAt: today,
    },
    {
      id: 't-2',
      title: '紧急处理服务器端口与配置调试',
      quadrant: 'q1',
      completed: true,
      completedAt: `${today} 10:15`,
      createdAt: today,
      syncedToVictoryLog: true,
    },
    {
      id: 't-3',
      title: '拆解未来半年的个人技能成长跃迁路线',
      notes: '不急于今天出结果，每周推进一次思考',
      quadrant: 'q2',
      completed: false,
      createdAt: today,
    },
    {
      id: 't-4',
      title: '晚间 45 分钟户外有氧慢跑并激活手环监测',
      quadrant: 'q2',
      completed: false,
      createdAt: today,
    },
    {
      id: 't-5',
      title: '回复工作群与外部协作琐碎邮件',
      quadrant: 'q3',
      completed: true,
      completedAt: `${today} 11:30`,
      createdAt: today,
    },
    {
      id: 't-6',
      title: '整理桌面与清除浏览器无用标签页',
      quadrant: 'q4',
      completed: false,
      createdAt: today,
    },
  ],
  victories: [
    {
      id: 'v-1',
      date: today,
      content: '昨晚按时熄灯，深睡达到 31%，早起头脑清晰。',
      isHighlight: true,
      createdAt: '08:45',
    },
    {
      id: 'v-2',
      date: today,
      content: '上午克服拖延，高效搞定了服务器配置联调。',
      isHighlight: false,
      createdAt: '10:20',
    },
    {
      id: 'v-3',
      date: today,
      content: '面对突如其来的插曲没有内耗焦虑，平稳切换了任务。',
      isHighlight: true,
      createdAt: '11:40',
    },
  ],
  wishes: [
    {
      id: 'w-1',
      title: '降噪无线头戴耳机 (沉浸专注神器)',
      price: 1699,
      reason: '无论在吵闹的咖啡馆还是通勤路上，戴上就瞬间进入个人的深度心流世界。',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
      targetDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isPurchased: false,
      checkins: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          question: '如果现在它就在你桌上，你戴上它的第一个瞬间听到了什么？',
          answer: '世界一下子安静下来了，耳边只有深沉的雨声白噪音，心率瞬间慢了半拍。',
        },
        {
          date: today,
          question: '今天你想带它去哪座图书馆或哪段专注旅程？',
          answer: '带去安静的靠窗位，一口气完成核心工作。',
        }
      ],
    },
    {
      id: 'w-2',
      title: '复古机械键盘 (客制化木质手托)',
      price: 680,
      reason: '每一次敲击都有清脆坚定的回响，把枯燥的敲字变成一场演奏。',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
      targetDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isPurchased: false,
      checkins: [],
    }
  ],
  habits: defaultHabits,
  schedules: defaultSchedules,
  inspirations: defaultInspirations,
  universalAIMessages: defaultUniversalAIMessages,
  currentStateScore: 8,
  lastCheckinTime: '今天 08:30',
  lastCheckinTimestamp: Date.now() - 1000 * 60 * 10,
  lastActiveTimestamp: Date.now(),
  characters: defaultCharacters,
  activeCharacterId: 'c-barkeeper',
  messages: [
    {
      id: 'm-1',
      sender: 'c-barkeeper',
      characterId: 'c-barkeeper',
      content: '欢迎来到避风港酒馆。今天小米手环传来的生理数据显示你的身心活力指数有 89 分，状态相当充沛！昨晚深睡达到31%，今天适合去处理重要的事情。但别忘了，累了随时回来坐坐。',
      timestamp: '08:35',
    },
    {
      id: 'm-2',
      sender: 'c-ranger',
      characterId: 'c-ranger',
      content: '别只盯着眼前的琐碎事情。看看你的“重要不紧急”清单，那里藏着你长远发展的大方向。',
      timestamp: '09:00',
    }
  ],
  tavernBackground: 'warm_wood',
  aiSettings: {
    useCustomAPI: false,
    apiKey: '',
    endpoint: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  tomatoPresets: [15, 25, 45],
  circuitBreakerActive: false,
};

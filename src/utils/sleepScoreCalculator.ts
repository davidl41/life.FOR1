export interface SleepScoreInput {
  totalMinutes: number; // 睡眠总分钟数
  deepSleepPct: number; // 深睡百分比 (0-100)
  remSleepPct: number; // 快速眼动百分比 (0-100)
  efficiencyPct: number; // 睡眠效率百分比 (0-100)
  awakeCount: number; // 清醒次数
}

export interface SleepScoreResult {
  score: number;
  label: string;
  subAdvice: string;
}

/**
 * 科学睡眠评分算法 (基于睡眠总时长、深睡/REM比例与睡眠连续性计算)
 */
export function calculateSleepScore(input: SleepScoreInput): SleepScoreResult {
  const { totalMinutes, deepSleepPct, remSleepPct, efficiencyPct, awakeCount } = input;

  // 1. 时长得分 (满分 45 分)
  // 最佳睡眠区间：7小时(420m) ~ 8.5小时(510m) 得 45 分
  let durationScore = 0;
  if (totalMinutes >= 420 && totalMinutes <= 540) {
    durationScore = 45;
  } else if (totalMinutes < 420) {
    // 少于7小时，每少30分钟扣5分，最低10分
    const deficit = 420 - totalMinutes;
    durationScore = Math.max(10, Math.round(45 - (deficit / 30) * 5));
  } else {
    // 超过9小时轻微扣分
    durationScore = 40;
  }

  // 2. 深睡质量得分 (满分 25 分)
  // 理想深睡比例：20% ~ 35% 为黄金修复期
  let deepScore = 0;
  if (deepSleepPct >= 20 && deepSleepPct <= 35) {
    deepScore = 25;
  } else if (deepSleepPct < 20) {
    deepScore = Math.max(8, Math.round((deepSleepPct / 20) * 25));
  } else {
    deepScore = 22;
  }

  // 3. 快速眼动 REM 得分 (满分 15 分)
  // 理想 REM 比例：15% ~ 25% (负责大脑神经元修复与记忆整理)
  let remScore = 0;
  if (remSleepPct >= 15 && remSleepPct <= 25) {
    remScore = 15;
  } else if (remSleepPct < 15) {
    remScore = Math.max(5, Math.round((remSleepPct / 15) * 15));
  } else {
    remScore = 13;
  }

  // 4. 睡眠效率与连续性得分 (满分 15 分)
  // 效率 95%+ 得 10 分；清醒次数 <= 1 次得 5 分
  let continuityScore = 0;
  if (efficiencyPct >= 95) continuityScore += 10;
  else if (efficiencyPct >= 85) continuityScore += 7;
  else continuityScore += 4;

  if (awakeCount <= 1) continuityScore += 5;
  else if (awakeCount === 2) continuityScore += 3;
  else continuityScore += 1;

  const totalScore = Math.min(100, Math.max(20, durationScore + deepScore + remScore + continuityScore));

  let label = '睡眠质量良好';
  let subAdvice = '昨晚深睡与周期正常，身体各机能已充分恢复。';

  if (totalScore >= 90) {
    label = '睡眠非常优质';
    subAdvice = '深睡充足，身心电量满格，高于95%同龄用户！';
  } else if (totalScore >= 80) {
    label = '睡眠质量良好';
    subAdvice = '各项睡眠指标健康平衡，恢复充分。';
  } else if (totalScore >= 65) {
    label = '睡眠质量平平';
    subAdvice = '深睡稍有欠缺，日间适当走动有助今晚安眠。';
  } else {
    label = '睡眠严重欠安';
    subAdvice = '睡眠总时长不足或起夜频繁，建议今晚提前半小时熄灯。';
  }

  return {
    score: totalScore,
    label,
    subAdvice,
  };
}

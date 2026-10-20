import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Wind, Sun, Sparkles, X, Heart, Coffee } from 'lucide-react';

export const CircuitBreakerModal: React.FC = () => {
  const { circuitBreakerActive, setCircuitBreaker } = useApp();
  const [phase, setPhase] = useState<'吸气' | '屏息' | '呼气'>('吸气');
  const [scale, setScale] = useState(1);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const warmQuotes = [
    '“允许自己今天只是慢慢走。你不必总是时刻紧绷，存在本身便足够美好。”',
    '“生活不是一场赶路的考核。深呼吸，把所有焦虑和催促暂时请出心房。”',
    '“天不会塌下来，任何事都可以等明天。此刻你唯一要照顾好的，只有你自己。”',
    '“像猫咪在午后阳光下伸个懒腰一样，把紧绷的双肩彻彻底底沉下来。”',
    '“电量不足是自然的身体律动，而不是你的过失。安心在这个温室里休憩片刻吧。”',
  ];

  // 精准顺滑的呼吸律动：
  // 吸气 4s: scale 0.85 -> 1.35 放大膨胀
  // 屏息 4s: scale 保持 1.35 饱满平稳
  // 呼气 6s: scale 1.35 -> 0.85 逐渐收敛缩小
  useEffect(() => {
    if (!circuitBreakerActive) return;

    let timer: any;

    const runBreathCycle = () => {
      // 1. 吸气阶段：4秒，放大到 1.35
      setPhase('吸气');
      setScale(1.35);

      timer = setTimeout(() => {
        // 2. 屏息阶段：4秒，保持饱满微浮
        setPhase('屏息');
        setScale(1.32);

        timer = setTimeout(() => {
          // 3. 呼气阶段：6秒，缩小到 0.85
          setPhase('呼气');
          setScale(0.85);

          timer = setTimeout(() => {
            runBreathCycle();
          }, 6000);
        }, 4000);
      }, 4000);
    };

    runBreathCycle();
    return () => clearTimeout(timer);
  }, [circuitBreakerActive]);

  if (!circuitBreakerActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#faf6ef] text-slate-800 flex flex-col items-center justify-between p-6 overflow-hidden animate-fade-in">
      {/* 浅暖色调环境光晕（温暖奶油杏色 + 柔和晨曦金 + 极浅天蓝） */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-gradient-to-tr from-amber-200/40 via-orange-100/40 to-sky-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* 顶部安全提示栏 */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
        <div className="flex items-center space-x-2 text-amber-700 bg-white/80 px-3.5 py-1.5 rounded-full border border-amber-200/80 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold tracking-wider">防焦虑空间已开启</span>
        </div>
        <button
          onClick={() => setCircuitBreaker(false)}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full bg-white border border-amber-100 shadow-xs transition"
          title="退出防焦虑空间"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 核心呼吸律动区域（浅暖色调，吸气放大，呼气缩小） */}
      <div className="w-full max-w-md flex flex-col items-center text-center my-auto z-10">
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          {/* 外圈光晕：跟随呼吸平滑放大缩小 */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-200/30 via-orange-100/40 to-sky-200/30 transition-all duration-[4000ms] ease-in-out"
            style={{
              transform: `scale(${scale * 1.15})`,
              transitionDuration: phase === '呼气' ? '6000ms' : '4000ms',
            }}
          />

          {/* 中间柔韧边框圆环 */}
          <div
            className="absolute w-52 h-52 rounded-full border-2 border-amber-300/60 shadow-sm transition-all duration-[4000ms] ease-in-out"
            style={{
              transform: `scale(${scale})`,
              transitionDuration: phase === '呼气' ? '6000ms' : '4000ms',
            }}
          />

          {/* 中心核心温暖圆环球体 */}
          <div
            className="w-36 h-36 rounded-full bg-gradient-to-br from-white via-amber-50 to-orange-100/70 border border-amber-200 shadow-md flex flex-col items-center justify-center transition-all duration-[4000ms] ease-in-out"
            style={{
              transform: `scale(${scale * 0.95})`,
              transitionDuration: phase === '呼气' ? '6000ms' : '4000ms',
            }}
          >
            <Wind className={`w-8 h-8 mb-1.5 transition-colors duration-1000 ${
              phase === '吸气' ? 'text-amber-500' : phase === '屏息' ? 'text-sky-500' : 'text-orange-400'
            }`} />
            <span className="text-2xl font-black tracking-widest text-slate-800">{phase}</span>
            <span className="text-[10px] text-amber-700/80 font-medium mt-0.5">
              {phase === '吸气' ? '感受胸腔缓缓扩张' : phase === '屏息' ? '静享片刻安宁' : '带走身心所有紧绷'}
            </span>
          </div>
        </div>

        {/* 温暖治愈文案 */}
        <div className="min-h-[70px] flex items-center justify-center px-4 mb-5">
          <p className="text-sm text-slate-700 leading-relaxed font-serif italic max-w-xs transition-opacity duration-500">
            {warmQuotes[quoteIndex]}
          </p>
        </div>

        <button
          onClick={() => setQuoteIndex((prev) => (prev + 1) % warmQuotes.length)}
          className="text-xs text-amber-800 hover:text-amber-900 flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-100/70 hover:bg-amber-100 border border-amber-200 transition mb-6 font-medium shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>换一句暖心的话</span>
        </button>

        {/* 减压安神卡 */}
        <div className="w-full bg-white/85 border border-amber-100 rounded-3xl p-4 text-xs text-slate-600 space-y-1.5 text-left shadow-2xs">
          <div className="flex items-center space-x-2 text-amber-800 font-semibold mb-1">
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>心神减负守护中：</span>
          </div>
          <p>• 所有待办红字、倒计时和象限压力已全部隐身，不打扰你。</p>
          <p>• 慢慢跟随圆环的放大和缩小，做 3 次完整的深呼吸。</p>
        </div>
      </div>

      {/* 底部退出大按钮 */}
      <div className="w-full max-w-md pb-4 z-10">
        <button
          onClick={() => setCircuitBreaker(false)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-sky-600 hover:opacity-95 text-white font-bold text-sm shadow-md shadow-amber-900/10 transition active:scale-[0.98]"
        >
          我感觉松弛多了，回到生活主页
        </button>
      </div>
    </div>
  );
};

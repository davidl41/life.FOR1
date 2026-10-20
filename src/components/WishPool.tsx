import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { WishItem } from '../types';
import {
  Gift,
  Plus,
  Calendar,
  CheckCircle,
  MessageSquareHeart,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WishPool: React.FC = () => {
  const { wishes, addWish, addManifestCheckin, markWishPurchased } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState<number>(500);
  const [newReason, setNewReason] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const [activeWishForCheckin, setActiveWishForCheckin] = useState<string | null>(null);
  const [checkinAnswer, setCheckinAnswer] = useState('');
  const [expandedWishId, setExpandedWishId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const manifestQuestions = [
    '如果现在它就摆在你的桌上，你的手指触摸它的那一瞬，它的质感与温度是怎样的？',
    '想象在今天的某个具体场景里用上了它，你脸上的表情是怎样的？',
    '拥有它之后，你的某项日常习惯或心情发生了哪个微小却幸福的改变？',
    '今天你想带着它去哪里兜风或者去完成哪场战役？',
  ];

  const [currentQuestion] = useState(
    () => manifestQuestions[Math.floor(Math.random() * manifestQuestions.length)]
  );

  // 从手机相册/本地选择图片并读取为 base64
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查图片大小与读取
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setNewImageUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addWish(newTitle.trim(), newPrice, newReason.trim(), newImageUrl.trim() || undefined);
    setNewTitle('');
    setNewPrice(500);
    setNewReason('');
    setNewImageUrl('');
    setShowAddModal(false);
  };

  const handleCheckinSubmit = (wishId: string) => {
    if (!checkinAnswer.trim()) return;
    addManifestCheckin(wishId, currentQuestion, checkinAnswer.trim());
    setCheckinAnswer('');
    setActiveWishForCheckin(null);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const handlePurchased = (wishId: string) => {
    markWishPurchased(wishId);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
  };

  const calculateDaysLeft = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="bg-white/90 border border-sky-100 rounded-3xl p-5 shadow-xs space-y-4 backdrop-blur-md">
      {/* 头部标题与添加 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-2xl bg-sky-100 text-sky-600 border border-sky-200">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">心愿清单与每日显化</h3>
            <p className="text-xs text-slate-400">“把短暂的冲动消费转变为 30 天显化修心”</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>存入新愿望</span>
        </button>
      </div>

      {/* 愿望卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishes.map((wish) => {
          const daysLeft = calculateDaysLeft(wish.targetDate);
          const hasCheckins = wish.checkins && wish.checkins.length > 0;
          const isExpanded = expandedWishId === wish.id;
          const isCheckingIn = activeWishForCheckin === wish.id;

          return (
            <div
              key={wish.id}
              className="bg-white border border-sky-100 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-sky-300 transition shadow-2xs"
            >
              {/* 卡片封面与冷静期倒计时徽章 */}
              <div className="relative h-36 w-full bg-sky-50 overflow-hidden">
                <img
                  src={wish.imageUrl}
                  alt={wish.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md border border-sky-200 px-2.5 py-0.5 rounded-full text-[10px] text-sky-700 font-medium flex items-center space-x-1 shadow-xs">
                  <Calendar className="w-3 h-3 text-sky-500" />
                  <span>{daysLeft > 0 ? `冷静期剩 ${daysLeft} 天` : '冷静期已满！'}</span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-white drop-shadow">
                    ¥{wish.price}
                  </span>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-3.5 space-y-2 flex-1">
                <h4 className="font-bold text-slate-800 text-sm leading-snug">{wish.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">
                  “{wish.reason}”
                </p>

                {/* 显化签到输入区 */}
                {isCheckingIn ? (
                  <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 space-y-2 animate-fade-in">
                    <div className="text-[11px] text-sky-800 font-medium leading-relaxed">
                      🔮 {currentQuestion}
                    </div>
                    <textarea
                      rows={2}
                      value={checkinAnswer}
                      onChange={(e) => setCheckinAnswer(e.target.value)}
                      placeholder="写下你脑海中清晰的画面与心境..."
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setActiveWishForCheckin(null)}
                        className="py-1 px-3 text-[11px] bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleCheckinSubmit(wish.id)}
                        className="flex-1 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        沉浸显化打卡
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setActiveWishForCheckin(wish.id);
                        setCheckinAnswer('');
                      }}
                      className="flex items-center space-x-1.5 text-xs text-sky-700 hover:text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl transition font-medium"
                    >
                      <MessageSquareHeart className="w-3.5 h-3.5 text-sky-600" />
                      <span>今日“拥有后”沉浸签到</span>
                    </button>

                    {hasCheckins && (
                      <button
                        onClick={() => setExpandedWishId(isExpanded ? null : wish.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                      >
                        <span>{wish.checkins.length} 次显化痕迹</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                )}

                {/* 显化痕迹历史 */}
                {isExpanded && hasCheckins && (
                  <div className="space-y-1.5 pt-2 border-t border-sky-100 max-h-36 overflow-y-auto">
                    {wish.checkins.map((c, i) => (
                      <div key={i} className="text-[11px] bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                        <div className="text-sky-600 font-mono text-[10px] mb-0.5">{c.date}</div>
                        <div className="text-slate-700">{c.answer}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 底部购买条 */}
              <div className="px-3.5 py-2.5 bg-sky-50/40 border-t border-sky-100 flex items-center justify-between">
                {wish.isPurchased ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>已真实购入并享受它</span>
                  </span>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-slate-400">
                      {daysLeft > 0 ? `冷静期还剩 ${daysLeft} 天` : '冷静期已过，确认真实需要'}
                    </span>
                    <button
                      onClick={() => handlePurchased(wish.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      标记已入手
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 新增愿望弹窗 (支持从手机相册/本地直接选择图片) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddWish}
            className="bg-white border border-sky-100 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Gift className="w-4 h-4 text-sky-600" />
                <span>存入心动愿望（启动 30 天冷静期）</span>
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
              <label className="block text-xs text-slate-600 font-medium mb-1">物品名称</label>
              <input
                type="text"
                required
                placeholder="例如：索尼降噪耳机、人体工学椅..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1">预估价格 (元)</label>
              <input
                type="number"
                min="10"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1">心动理由（为什么真想拥有它）</label>
              <textarea
                rows={2}
                required
                placeholder="写下它究竟能给你带来怎样的生活品质提升或心流体验..."
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* 手机相册选择图片核心区域 */}
            <div>
              <label className="block text-xs text-slate-600 font-medium mb-1.5">
                心愿图片 (从手机相册/本地选择)
              </label>

              {/* 隐藏的系统文件选择器 */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {newImageUrl ? (
                <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-sky-200 shadow-2xs group">
                  <img
                    src={newImageUrl}
                    alt="愿望预览"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-white text-slate-800 text-xs font-bold rounded-xl shadow"
                    >
                      重新选择
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewImageUrl('')}
                      className="p-1 bg-rose-500 text-white rounded-xl shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-sky-200 rounded-2xl bg-sky-50/40 hover:bg-sky-50/80 transition flex flex-col items-center justify-center space-y-1 text-sky-700"
                >
                  <Upload className="w-5 h-5 text-sky-500" />
                  <span className="text-xs font-bold">点击打开手机相册 / 选择图片</span>
                  <span className="text-[10px] text-slate-400">支持拍照或从相册导入愿望实物图</span>
                </button>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition shadow-md shadow-sky-600/20"
              >
                存入并开启冷静期
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HeartHandshake, Settings as SettingsIcon, Camera, Upload, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeroHeaderProps {
  onOpenSettings: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({ onOpenSettings }) => {
  const { profile, updateProfileAvatar, setCircuitBreaker } = useApp();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // 预设精致图标集合
  const presetIcons = ['✨', '🧭', '🌿', '☕', '🐱', '🐺', '🦊', '🚀', '🪐', '🌸', '🎨', '🏖️', '💎', '🔥'];

  // 从手机相册/电脑上传自定义头像
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateProfileAvatar(base64);
        setShowAvatarModal(false);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (icon: string) => {
    updateProfileAvatar(icon);
    setShowAvatarModal(false);
  };

  const isCustomImage = profile.avatar?.startsWith('data:image');

  return (
    <div className="bg-white/95 border-b border-amber-100/80 px-4 py-3 sticky top-0 z-30 backdrop-blur-md shadow-2xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* 左侧：可点击更换的头像与称呼 */}
        <div className="flex items-center space-x-3">
          {/* 头像容器 (点击弹出更换头像弹窗) */}
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-300 to-sky-400 p-[2px] shadow-xs group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#fffdfa] rounded-[14px] flex items-center justify-center overflow-hidden">
                {isCustomImage ? (
                  <img
                    src={profile.avatar}
                    alt={profile.currentName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold leading-none select-none">
                    {profile.avatar || '✨'}
                  </span>
                )}
              </div>
            </div>

            {/* 小相机角标提示 */}
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-2xs group-hover:bg-amber-600 transition">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800 text-sm sm:text-base tracking-wide">
                {profile.currentName}
              </span>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 font-medium">
                第 {profile.journeyDays} 天
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              已沉淀 <b className="text-amber-600 font-mono">{profile.accumulatedMoments}</b> 处生活小胜利
            </div>
          </div>
        </div>

        {/* 右侧：【防焦虑】大按钮 + 设置 */}
        <div className="flex items-center space-x-2">
          {/* 【防焦虑】按钮 */}
          <button
            onClick={() => setCircuitBreaker(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200/90 text-xs font-bold transition active:scale-95 shadow-xs"
            title="太累或心慌焦虑时，点此一键进入防焦虑呼吸空间"
          >
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            <span>防焦虑</span>
          </button>

          {/* 系统设置 */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition"
            title="应用与 AI 设置"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 更换头像模态框 */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-amber-100 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-fade-in text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>更换个人专属头像</span>
              </h3>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 手机相册选择照片按钮 */}
            <div>
              <input
                type="file"
                accept="image/*"
                ref={avatarFileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/40 hover:bg-amber-50/80 transition flex items-center justify-center space-x-2 text-amber-800"
              >
                <Upload className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold">从手机相册/本地选择照片</span>
              </button>
            </div>

            {/* 快速挑选内置精美图标 */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                或者挑选一个喜欢的个性图标：
              </span>
              <div className="grid grid-cols-7 gap-2 text-xl">
                {presetIcons.map((icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(icon)}
                    className="w-10 h-10 rounded-2xl bg-[#fffdfa] border border-amber-100/90 hover:border-amber-400 hover:scale-105 transition flex items-center justify-center shadow-3xs"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

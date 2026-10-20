import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Beer,
  Send,
  Zap,
  Sliders,
} from 'lucide-react';

interface TavernChatProps {
  onOpenCharacterSettings?: () => void;
}

export const TavernChat: React.FC<TavernChatProps> = ({ onOpenCharacterSettings }) => {
  const {
    characters,
    activeCharacterId,
    setActiveCharacterId,
    clearCharacterMessages,
    messages,
    sendTavernMessage,
    bandData,
    aiSettings,
    tavernBackground,
    updateTavernBackground,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChar = characters.find((c) => c.id === activeCharacterId) || characters[0];

  // 100% 独立隔离每个角色的对话记录，互不通用、互不串台！
  const currentRoleMessages = messages.filter((m) =>
    m.characterId ? m.characterId === activeChar.id : m.sender === activeChar.id
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeCharacterId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await sendTavernMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  // 背景预设主题列表
  const presetBackgrounds = [
    {
      id: 'warm_wood',
      name: '壁炉暖木',
      preview: 'bg-gradient-to-b from-[#fbf6ee] via-[#f7edd8] to-[#eeddc2]',
      style: { backgroundColor: '#fcf8f2' },
    },
    {
      id: 'sunrise',
      name: '晨曦微光',
      preview: 'bg-gradient-to-tr from-amber-100 via-rose-100 to-sky-100',
      style: { backgroundColor: '#fef7ee' },
    },
    {
      id: 'night_star',
      name: '静谧深邃',
      preview: 'bg-gradient-to-b from-slate-900 to-indigo-950 text-white',
      style: { backgroundColor: '#131b2e' },
      isDark: true,
    },
    {
      id: 'forest_tea',
      name: '林间小憩',
      preview: 'bg-gradient-to-b from-emerald-50 via-teal-50 to-green-100',
      style: { backgroundColor: '#f2f9f5' },
    },
    {
      id: 'pure_cream',
      name: '极简奶杏',
      preview: 'bg-[#fffdfa] border border-amber-200',
      style: { backgroundColor: '#ffffff' },
    },
  ];

  const currentBg = tavernBackground || 'warm_wood';
  const isCustomImage = currentBg.startsWith('data:image');
  const activePreset = presetBackgrounds.find((p) => p.id === currentBg);
  const isDarkTheme = activePreset?.isDark && !isCustomImage;

  return (
    <div
      className={`border border-amber-100/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col h-[630px] backdrop-blur-md relative overflow-hidden transition-all duration-300 ${
        isDarkTheme ? 'text-slate-100' : 'text-slate-800'
      }`}
      style={
        isCustomImage
          ? {
              backgroundImage: `url(${currentBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : activePreset?.style || { backgroundColor: '#fffdfa' }
      }
    >
      {/* 若是自定义图片背景，增加一层极轻柔的磨砂遮罩，保证字迹绝不眼花 */}
      {isCustomImage && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs pointer-events-none z-0" />
      )}

      {/* 顶部标题栏：清爽优雅 */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-100/60 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-2xl bg-amber-100/80 text-amber-700 border border-amber-200/80 shadow-3xs">
            <Beer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm tracking-wide">避风港心智酒馆</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-bold">
                {aiSettings.useCustomAPI ? `API: ${aiSettings.model}` : '本地沉浸'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">每个人独立对话记录 · 背景随时可调</p>
          </div>
        </div>

        {/* 右侧微操：进入设置中心统一管理壁纸、清空对话与角色记忆 */}
        <div>
          {onOpenCharacterSettings && (
            <button
              onClick={onOpenCharacterSettings}
              className="p-2 rounded-2xl bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 border border-amber-200/80 transition shadow-3xs"
              title="进入设置中心调整酒馆壁纸、清空即时记录或管理角色"
            >
              <Sliders className="w-4 h-4 text-amber-600" />
            </button>
          )}
        </div>
      </div>

      {/* 角色卡横向切换标签栏 */}
      <div className="flex items-center space-x-2 py-2.5 overflow-x-auto scrollbar-none border-b border-amber-100/50 relative z-10">
        {characters.map((char) => {
          const isActive = char.id === activeCharacterId;
          return (
            <button
              key={char.id}
              onClick={() => setActiveCharacterId(char.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white/80 text-slate-600 hover:bg-amber-50 border border-amber-100/80'
              }`}
            >
              <span className="text-sm">{char.avatar}</span>
              <span>{char.name}</span>
            </button>
          );
        })}
      </div>

      {/* 当前角色卡身份提示条 */}
      <div className="mt-2.5 px-3.5 py-2 rounded-2xl bg-white/80 border border-amber-100/80 flex items-center justify-between text-xs relative z-10 shadow-3xs">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-base flex-shrink-0">{activeChar.avatar}</span>
          <div className="truncate">
            <span className="font-extrabold text-slate-800 mr-2">{activeChar.name}</span>
            <span className="text-slate-500 italic text-[11px] truncate">
              {activeChar.description || activeChar.personality}
            </span>
          </div>
        </div>
        <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex-shrink-0 flex items-center space-x-1 font-bold">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>活力指数 {bandData.vitalityScore}</span>
        </div>
      </div>

      {/* 聊天消息流：每个人一个独立对话记录，互不串台！ */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 relative z-10">
        {currentRoleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-slate-400 space-y-2">
            <div className="text-4xl">{activeChar.avatar}</div>
            <p className="font-bold text-slate-700">与【{activeChar.name}】的全新对饮时光</p>
            <p className="text-[11px] max-w-xs">{activeChar.firstMessage}</p>
          </div>
        ) : (
          currentRoleMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm flex-shrink-0 shadow-3xs ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-white border border-amber-200 text-slate-700'
                  }`}
                >
                  {isUser ? '🧭' : activeChar.avatar}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-3xs ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-white/95 border border-amber-100 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {!isUser && (
                    <div className="text-[10px] text-amber-700 font-bold mb-1 flex items-center justify-between">
                      <span>{activeChar.name}</span>
                      <span className="font-mono text-[9px] text-slate-400">{msg.timestamp}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {isUser && (
                    <div className="text-[9px] text-amber-900/70 text-right mt-1 font-mono">
                      {msg.timestamp}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 pl-10 animate-pulse">
            <span>{activeChar.name} 正在倾听并思考...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入与发送栏 */}
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-amber-100/60 relative z-10">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`与【${activeChar.name}】倾诉当下的心境或困惑...`}
          className="flex-1 bg-white/90 border border-amber-200/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 shadow-3xs"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 disabled:opacity-40 text-slate-950 rounded-2xl font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>倾诉</span>
        </button>
      </form>
    </div>
  );
};

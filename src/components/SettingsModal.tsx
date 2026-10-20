import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TavernCharacter } from '../types';
import {
  Settings,
  Key,
  User,
  Download,
  Upload,
  RotateCcw,
  X,
  Check,
  Plus,
  Edit3,
  Trash2,
  Beer,
  Dice5,
  Brain,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  defaultTab?: 'general' | 'tavern';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, defaultTab = 'general' }) => {
  const {
    profile,
    updateNameList,
    randomizeCurrentName,
    aiSettings,
    updateAISettings,
    characters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    addCharacterMemory,
    deleteCharacterMemory,
    extractAndSaveCharacterMemory,
    importCharacterCardJSON,
    exportCharacterCardJSON,
    exportDataJSON,
    importDataJSON,
    tomatoPresets,
    updateTomatoPresets,
    habits,
    addHabit,
    deleteHabit,
    updateHabit,
    tavernBackground,
    updateTavernBackground,
    clearCharacterMessages,
    activeCharacterId,
    resetAllData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'tavern'>(defaultTab);

  // 名字池管理状态
  const [namesText, setNamesText] = useState((profile.nameList || ['探索者']).join('、'));
  const [tomatoPresetsText, setTomatoPresetsText] = useState(
    (tomatoPresets && tomatoPresets.length > 0 ? tomatoPresets : [15, 25, 45]).join(', ')
  );
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('🌱');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 记忆盒与壁纸管理状态
  const [selectedCharForMemory, setSelectedCharForMemory] = useState<TavernCharacter | null>(null);
  const [newMemInput, setNewMemInput] = useState('');
  const [isExtractingMem, setIsExtractingMem] = useState(false);
  const tavernFileInputRef = useRef<HTMLInputElement | null>(null);

  // 酒馆预设壁纸
  const presetBackgrounds = [
    { id: 'warm_wood', name: '壁炉暖木', color: 'bg-amber-100 border-amber-300' },
    { id: 'sunrise', name: '晨曦微光', color: 'bg-rose-100 border-rose-300' },
    { id: 'night_star', name: '静谧深邃', color: 'bg-indigo-900 border-indigo-700 text-white' },
    { id: 'forest_tea', name: '林间小憩', color: 'bg-emerald-100 border-emerald-300' },
    { id: 'pure_cream', name: '极简奶杏', color: 'bg-amber-50 border-amber-200' },
  ];

  const handleUploadTavernBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateTavernBackground(base64);
        alert('酒馆背景已更新为自定义图片！');
      }
    };
    reader.readAsDataURL(file);
  };

  // AI 接口设置
  const [useCustomAPI, setUseCustomAPI] = useState(aiSettings.useCustomAPI);
  const [apiKey, setApiKey] = useState(aiSettings.apiKey);
  const [endpoint, setEndpoint] = useState(aiSettings.endpoint);
  const [model, setModel] = useState(aiSettings.model);

  // 备份与恢复
  const [importText, setImportText] = useState('');

  // 角色编辑 / 新建模态框内状态
  const [editingChar, setEditingChar] = useState<Partial<TavernCharacter> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [importCharJson, setImportCharJson] = useState('');
  const [showCharImportBox, setShowCharImportBox] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    // 分割名字列表（支持中英文逗号、顿号、换行）
    const parsedNames = namesText
      .split(/[,，、\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    updateNameList(parsedNames.length > 0 ? parsedNames : ['探索者']);

    // 解析番茄钟预设时间数字
    const parsedPresets = tomatoPresetsText
      .split(/[,，、\s]+/)
      .map((n) => parseInt(n))
      .filter((n) => !isNaN(n) && n > 0);
    if (parsedPresets.length > 0) {
      updateTomatoPresets(parsedPresets);
    }

    updateAISettings({
      useCustomAPI,
      apiKey: apiKey.trim(),
      endpoint: endpoint.trim() || 'https://api.deepseek.com/v1',
      model: model.trim() || 'deepseek-chat',
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 1000);
  };

  const handleSaveChar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChar || !editingChar.name?.trim()) return;

    if (isCreatingNew) {
      addCharacter({
        name: editingChar.name.trim(),
        title: editingChar.title?.trim() || '酒馆旅伴',
        avatar: editingChar.avatar?.trim() || '🌟',
        description: editingChar.description?.trim() || '',
        personality: editingChar.personality?.trim() || '',
        systemPrompt: editingChar.systemPrompt?.trim() || '你是一名温柔的倾听者。',
        firstMessage: editingChar.firstMessage?.trim() || '你好！很高兴遇见你。',
        temperature: editingChar.temperature || 0.7,
      });
    } else if (editingChar.id) {
      updateCharacter(editingChar.id, editingChar);
    }

    setEditingChar(null);
  };

  const handleCharImport = () => {
    if (!importCharJson.trim()) return;
    const ok = importCharacterCardJSON(importCharJson.trim());
    if (ok) {
      setImportCharJson('');
      setShowCharImportBox(false);
      alert('开源角色卡已成功收录！');
    } else {
      alert('解析失败，请检查是否为合法 Tavern 角色卡 JSON。');
    }
  };

  const handleExportSingleChar = (charId: string, name: string) => {
    const jsonStr = exportCharacterCardJSON(charId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tavern_card_${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life_app_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDataJSON(importText.trim());
    if (ok) {
      alert('数据已成功恢复！');
      onClose();
    } else {
      alert('数据解析失败，请检查备份 JSON 格式。');
    }
  };

  const handleReset = () => {
    if (confirm('确认要重置所有数据到初始状态吗？此操作不可逆！')) {
      resetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-sky-100 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-slate-800 max-h-[90vh] overflow-y-auto space-y-4 animate-fade-in">
        {/* 顶部标题与选项卡 */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-base text-slate-800">设置中心</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 选项卡切换：常规设置 vs 酒馆角色管理 */}
        <div className="flex bg-sky-50/70 p-1 rounded-2xl border border-sky-100">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'general'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            个人称呼与 AI
          </button>
          <button
            onClick={() => setActiveTab('tavern')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1 ${
              activeTab === 'tavern'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Beer className="w-3.5 h-3.5 text-sky-600" />
            <span>酒馆角色卡管理</span>
          </button>
        </div>

        {/* TAB 1: 常规与名字池 */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-4 animate-fade-in">
            {/* 名字池设置 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>称呼池配置 (支持多个名字)</span>
                </h4>
                <button
                  type="button"
                  onClick={randomizeCurrentName}
                  className="flex items-center space-x-1 text-[11px] text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200"
                  title="立即随机切换一次名字"
                >
                  <Dice5 className="w-3 h-3" />
                  <span>随机选名</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  多个称呼用逗号或顿号隔开，每次进入 App 将随机抽选一个显示：
                </label>
                <input
                  type="text"
                  value={namesText}
                  onChange={(e) => setNamesText(e.target.value)}
                  placeholder="例如：探索者、生活漫步家、造梦者、夜行客、阿星..."
                  className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
                <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                  <span>当前正生效的称呼：</span>
                  <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                    {profile.currentName}
                  </span>
                </div>
              </div>
            </div>

            {/* 番茄时钟预设时长设置 */}
            <div className="space-y-1.5 pt-2 border-t border-sky-100">
              <h4 className="text-xs font-semibold text-slate-700">
                番茄专注舱预设时长 (分钟)
              </h4>
              <p className="text-[10px] text-slate-400">
                用逗号分隔三档常用时长，在番茄舱中可一键切换（如：15, 25, 45 或 10, 30, 60）
              </p>
              <input
                type="text"
                value={tomatoPresetsText}
                onChange={(e) => setTomatoPresetsText(e.target.value)}
                placeholder="例如：15, 25, 45"
                className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* 微习惯自定义管理 */}
            <div className="space-y-2 pt-2 border-t border-sky-100">
              <h4 className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <span>🌱 微习惯自定义调整</span>
              </h4>
              <p className="text-[10px] text-slate-400">
                可自由增删修改主页的微习惯条目，微小到不可能失败
              </p>

              {/* 现有微习惯列表 */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {habits.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded-xl bg-sky-50/50 border border-sky-100 text-xs">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span>{h.icon}</span>
                      <input
                        type="text"
                        value={h.title}
                        onChange={(e) => updateHabit(h.id, { title: e.target.value })}
                        className="bg-transparent border-none text-slate-800 text-xs font-medium focus:outline-none flex-1 truncate"
                      />
                    </div>
                    {habits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteHabit(h.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 添加新微习惯 */}
              <div className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={newHabitIcon}
                  onChange={(e) => setNewHabitIcon(e.target.value)}
                  placeholder="图标"
                  className="w-12 bg-white border border-sky-200 rounded-xl p-1.5 text-center text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="新微习惯 (如：每天冥想3分钟)..."
                  className="flex-1 bg-white border border-sky-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  disabled={!newHabitTitle.trim()}
                  onClick={() => {
                    addHabit(newHabitTitle.trim(), newHabitIcon.trim() || '🌱');
                    setNewHabitTitle('');
                    setNewHabitIcon('🌱');
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
                >
                  添加
                </button>
              </div>
            </div>

            {/* AI 接口配置 */}
            <div className="space-y-2 pt-2 border-t border-sky-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-sky-600" />
                  <span>酒馆大模型 API 配置</span>
                </h4>
                <div className="flex items-center space-x-1.5 text-xs">
                  <input
                    type="checkbox"
                    id="useCustomApi"
                    checked={useCustomAPI}
                    onChange={(e) => setUseCustomAPI(e.target.checked)}
                    className="accent-sky-600 w-3.5 h-3.5 rounded"
                  />
                  <label htmlFor="useCustomApi" className="text-slate-600 text-[11px] cursor-pointer">
                    启用外部 API
                  </label>
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                未启用时自动使用内置的高情商本地情境对话引擎。启用后兼容 DeepSeek / OpenAI / 通义千问等接口。
              </p>

              {useCustomAPI && (
                <div className="space-y-2 text-xs animate-fade-in bg-sky-50/50 p-3 rounded-2xl border border-sky-200">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">API Key</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">API 基础端点 (Base URL)</label>
                    <input
                      type="text"
                      placeholder="https://api.deepseek.com/v1"
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">模型名称 (Model)</label>
                    <input
                      type="text"
                      placeholder="deepseek-chat"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-white border border-sky-200 rounded-xl p-2 text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Health Connect (健康连接) 对接管理 */}
            <div className="space-y-2 pt-2 border-t border-sky-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <span className="text-sky-600">⌚</span>
                  <span>小米手环 10 ➔ Health Connect 连接</span>
                </h4>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  官方通道
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                数据流经【小米运动健康 ➔ 手机系统健康连接 (Health Connect) ➔ LifeOS】，免拔插蓝牙，稳定省电。
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-md shadow-sky-600/20"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : null}
              <span>{saveSuccess ? '已保存！' : '保存设置'}</span>
            </button>

            {/* 本地备份与重置 */}
            <div className="space-y-2 pt-2 border-t border-sky-100 text-xs">
              <h4 className="text-xs font-semibold text-slate-700">本地数据备份与恢复</h4>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex-1 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl flex items-center justify-center space-x-1 transition text-[11px]"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  <span>导出完整备份</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl flex items-center space-x-1 transition text-[11px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置出厂</span>
                </button>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="粘贴备份的 JSON 字符串恢复数据..."
                  className="w-full bg-sky-50/40 border border-sky-200 rounded-xl p-2 text-[10px] text-slate-700 font-mono focus:outline-none focus:border-sky-400"
                />
                {importText.trim() && (
                  <button
                    type="button"
                    onClick={handleImport}
                    className="mt-1 w-full py-1.5 bg-sky-600 text-white rounded-xl text-xs hover:bg-sky-500"
                  >
                    执行恢复
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: 酒馆设置与角色卡管理 */}
        {activeTab === 'tavern' && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* 1. 酒馆壁纸调节 */}
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>酒馆对话背景调节</span>
                </div>
                <button
                  type="button"
                  onClick={() => tavernFileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold shadow-3xs flex items-center space-x-1"
                >
                  <Upload className="w-3 h-3 text-amber-600" />
                  <span>相册上传背景</span>
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={tavernFileInputRef}
                onChange={handleUploadTavernBg}
                className="hidden"
              />

              {/* 预设主题风格快捷切换 */}
              <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                {presetBackgrounds.map((bg) => {
                  const isSelected = tavernBackground === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => updateTavernBackground(bg.id)}
                      className={`py-1.5 px-1 rounded-xl border text-[10px] font-bold text-center transition ${bg.color} ${
                        isSelected ? 'ring-2 ring-amber-500 shadow-xs' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {bg.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 即时对话记录清空 */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-700 block">即时对话历史管理</span>
                <span className="text-[10px] text-slate-400">只清空当前角色的即时问答缓存，不影响长效记忆</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('确认清空当前选定角色的即时聊天记录吗？')) {
                    clearCharacterMessages(activeCharacterId);
                    alert('已清空当前角色的即时对话记录。');
                  }
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>清空当前对话</span>
              </button>
            </div>

            {/* 3. 角色列表与记忆管理 */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-600 font-bold text-xs">
                开源酒馆角色列表
              </span>
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => setShowCharImportBox(!showCharImportBox)}
                  className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg flex items-center space-x-1 text-[11px]"
                >
                  <Upload className="w-3 h-3" />
                  <span>导入卡片</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(true);
                    setEditingChar({
                      name: '',
                      title: '酒馆旅伴',
                      avatar: '🌟',
                      description: '',
                      personality: '',
                      systemPrompt: '你是温暖的酒馆伙伴。',
                      firstMessage: '你好！很高兴遇见你。',
                      temperature: 0.7,
                    });
                  }}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center space-x-1 text-[11px] font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>新建角色</span>
                </button>
              </div>
            </div>

            {/* 导入卡片文本输入框 */}
            {showCharImportBox && (
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2 animate-fade-in">
                <div className="text-[11px] text-slate-600">
                  粘贴 TavernAI / SillyTavern 标准角色卡 JSON：
                </div>
                <textarea
                  rows={4}
                  value={importCharJson}
                  onChange={(e) => setImportCharJson(e.target.value)}
                  placeholder="在此粘贴角色卡 JSON 代码..."
                  className="w-full bg-white border border-sky-200 rounded-xl p-2 text-[10px] font-mono text-slate-800 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleCharImport}
                  className="w-full py-1.5 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-500"
                >
                  解析并导入到酒馆
                </button>
              </div>
            )}

            {/* 角色卡列表展示 */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between gap-2 hover:border-sky-300 transition"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-xl flex-shrink-0">{char.avatar}</span>
                    <div className="truncate">
                      <div className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                        <span>{char.name}</span>
                        <span className="text-[10px] text-sky-600 font-normal">({char.title})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {char.description || char.personality || char.systemPrompt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportSingleChar(char.id, char.name)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-white rounded-lg transition"
                      title="导出此角色卡 JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCharForMemory(char)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-lg transition flex items-center space-x-0.5"
                      title="管理该角色的长效记忆库 (行业RAG检索架构)"
                    >
                      <Brain className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-mono">({char.memories?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setEditingChar({ ...char });
                      }}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-white rounded-lg transition"
                      title="编辑人设与提示词"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {characters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`确认要删除角色【${char.name}】吗？`)) {
                            deleteCharacter(char.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 角色编辑模态框 (内部表单) */}
            {editingChar && (
              <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleSaveChar}
                  className="bg-white border border-sky-100 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      <Edit3 className="w-4 h-4 text-sky-600" />
                      <span>{isCreatingNew ? '新建酒馆角色卡' : `编辑角色：${editingChar.name}`}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingChar(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="text-[11px] text-slate-500 block mb-0.5">角色名称</label>
                      <input
                        type="text"
                        required
                        value={editingChar.name || ''}
                        onChange={(e) => setEditingChar({ ...editingChar, name: e.target.value })}
                        className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-0.5">头像 Emoji/URL</label>
                      <input
                        type="text"
                        value={editingChar.avatar || '🌟'}
                        onChange={(e) => setEditingChar({ ...editingChar, avatar: e.target.value })}
                        className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-2 py-1.5 text-xs text-center text-slate-800 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">身份头衔</label>
                    <input
                      type="text"
                      value={editingChar.title || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, title: e.target.value })}
                      className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">外貌与场景描写</label>
                    <textarea
                      rows={2}
                      value={editingChar.description || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, description: e.target.value })}
                      className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">性格特征</label>
                    <input
                      type="text"
                      value={editingChar.personality || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, personality: e.target.value })}
                      className="w-full bg-sky-50/50 border border-sky-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">核心人设 System Prompt</label>
                    <textarea
                      rows={3}
                      value={editingChar.systemPrompt || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, systemPrompt: e.target.value })}
                      className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">初见打招呼台词</label>
                    <textarea
                      rows={2}
                      value={editingChar.firstMessage || ''}
                      onChange={(e) => setEditingChar({ ...editingChar, firstMessage: e.target.value })}
                      className="w-full bg-sky-50/50 border border-sky-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingChar(null)}
                      className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs hover:bg-slate-200"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold hover:bg-sky-500 shadow-md shadow-sky-600/20"
                    >
                      保存角色
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 角色长效记忆库管理弹窗 (行业分层RAG架构) */}
            {selectedCharForMemory && (
              <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-amber-100 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in text-slate-800 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">
                          【{selectedCharForMemory.name}】的长效记忆库
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          可存储大量事实 · 每次对话仅按需精准召回 Top3（约50 Tokens，极省费用）
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCharForMemory(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 一键提炼按钮 */}
                  <button
                    type="button"
                    disabled={isExtractingMem}
                    onClick={async () => {
                      setIsExtractingMem(true);
                      try {
                        const newFact = await extractAndSaveCharacterMemory(selectedCharForMemory.id);
                        if (newFact) {
                          alert(`成功提炼新记忆：“${newFact}”`);
                          // 更新当前查看的对象
                          const updated = characters.find((c) => c.id === selectedCharForMemory.id);
                          if (updated) setSelectedCharForMemory(updated);
                        } else {
                          alert('近期对话轮次较少，暂无可浓缩的新事实，多聊两句后再来提炼吧！');
                        }
                      } finally {
                        setIsExtractingMem(false);
                      }
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isExtractingMem ? '正在从对话中浓缩提炼事实...' : '✨ 从近期对话中自动提取新记忆'}</span>
                  </button>

                  {/* 记忆事实列表 */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(characters.find((c) => c.id === selectedCharForMemory.id)?.memories || []).length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 bg-amber-50/30 rounded-2xl border border-amber-100/60">
                        暂无记忆条目。可点击上方按钮提炼，或在下方手动输入。
                      </div>
                    ) : (
                      (characters.find((c) => c.id === selectedCharForMemory.id)?.memories || []).map((mem, idx) => {
                        // 解析日期前缀，例如 [2026-10-20]
                        const dateMatch = mem.match(/^\[(\d{4}-\d{2}-\d{2})\]\s*(.*)/);
                        const memDate = dateMatch ? dateMatch[1] : null;
                        const memBody = dateMatch ? dateMatch[2] : mem;

                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-[#fffdfa] border border-amber-100/80 flex items-start justify-between gap-2 shadow-3xs"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-amber-600 font-bold text-[10px]">#{idx + 1}</span>
                                {memDate && (
                                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.2 rounded-md border border-amber-200/60 font-semibold">
                                    📅 {memDate}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed font-medium pl-0.5">{memBody}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                deleteCharacterMemory(selectedCharForMemory.id, idx);
                                const updated = characters.find((c) => c.id === selectedCharForMemory.id);
                                if (updated) setSelectedCharForMemory(updated);
                              }}
                              className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition flex-shrink-0"
                              title="删除此条记忆"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* 手动添加一条事实 */}
                  <div className="flex gap-2 pt-1 border-t border-amber-100">
                    <input
                      type="text"
                      value={newMemInput}
                      onChange={(e) => setNewMemInput(e.target.value)}
                      placeholder="告诉TA必须牢记的事 (如：我对花生过敏、目标是晋升资深)..."
                      className="flex-1 bg-[#fbf9f5] border border-amber-200/80 rounded-2xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      disabled={!newMemInput.trim()}
                      onClick={() => {
                        addCharacterMemory(selectedCharForMemory.id, newMemInput.trim());
                        setNewMemInput('');
                        const updated = characters.find((c) => c.id === selectedCharForMemory.id);
                        if (updated) setSelectedCharForMemory(updated);
                      }}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs font-bold transition disabled:opacity-40"
                    >
                      记下
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

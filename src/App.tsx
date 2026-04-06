import React, { useState, useEffect } from 'react';
import {
  Home,
  Briefcase,
  ClipboardList,
  Map,
  Folder,
  Pin,
  PlusSquare,
  CreditCard,
  Box,
  CheckCircle2,
  Clock,
  Users,
  Archive,
  Star,
  MessageSquare,
  Code,
  Menu,
  X,
  GitMerge,
  FileText,
  LayoutGrid,
  Edit2,
  Trash2,
  Key,
  Unlock,
  Settings2,
  Plus,
  Minus,
  User,
} from 'lucide-react';

// 客製化：完美還原設計圖的「四角星星」Logo
const StarLogo = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 1.5C12 1.5 13 9 22.5 12C13 15 12 22.5 12 22.5C12 22.5 11 15 1.5 12C11 9 12 1.5 12 1.5Z" />
  </svg>
);

const WorkDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('records');
  const [isStationExpanded, setIsStationExpanded] = useState(true);
  const [isWorkflowExpanded, setIsWorkflowExpanded] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  /* =========================================================
     編輯權限鎖定狀態 (預設鎖定)
  ========================================================= */
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleLogoClick = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === '0204') {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  /* =========================================================
     安全儲存系統 (LocalStorage) - 確保重新整理資料不遺失
     加入了 try-catch 防止舊的損壞資料導致畫面崩潰
  ========================================================= */

  // 工作流程分類
  const [workflowCategories, setWorkflowCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('workflowCategories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse workflowCategories', e);
    }

    return [
      { id: 'workflow', name: '標準作業程序 (SOP)' },
      { id: 'workflow-project', name: '專案排程追蹤' },
    ];
  });
  useEffect(() => {
    localStorage.setItem(
      'workflowCategories',
      JSON.stringify(workflowCategories)
    );
  }, [workflowCategories]);

  // 🔥 修復：補回上一版不小心遺漏的新增分類狀態變數，解決 ReferenceError
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // 所有任務節點
  const [allTasks, setAllTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('allTasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse allTasks', e);
    }

    return {
      workflow: [
        {
          id: 1,
          time: '08:00',
          title: '早班交接與設備點交',
          content:
            '確認大廳櫃台所有系統與設備運作正常，閱讀昨日工作日誌，並與夜班人員完成口頭與書面交接手續。確保零用金與重要鑰匙清點無誤。',
        },
        {
          id: 2,
          time: '10:30',
          title: '主入口區域巡檢',
          content:
            '檢查A區、B區訪客動線是否順暢，維持環境整潔，並排除任何可能的安全隱患。主動協助訪客辦理換證與引導作業。',
        },
      ],
      'workflow-project': [
        {
          id: 4,
          time: '09:00',
          title: '專案A進度會議',
          content: '確認各部門進度與潛在阻礙，準備週報。',
        },
      ],
    };
  });
  useEffect(() => {
    localStorage.setItem('allTasks', JSON.stringify(allTasks));
  }, [allTasks]);

  // 工作紀錄標籤 (送餐、收桌...)
  const [recordTabs, setRecordTabs] = useState(() => {
    try {
      const saved = localStorage.getItem('recordTabs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse recordTabs', e);
    }

    return [
      { id: 't1', name: '送餐' },
      { id: 't2', name: '收桌' },
      { id: 't3', name: '買單' },
    ];
  });
  useEffect(() => {
    localStorage.setItem('recordTabs', JSON.stringify(recordTabs));
  }, [recordTabs]);

  const [activeTabId, setActiveTabId] = useState(recordTabs[0]?.id || 't1');

  // 工作人員名單
  const [staffMembers, setStaffMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('staffMembers');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse staffMembers', e);
    }

    return [
      { id: 's1', name: 'YAN', role: '店長' },
      { id: 's2', name: 'Zina', role: '店長' },
      { id: 's3', name: '1', role: '店長' },
    ];
  });
  useEffect(() => {
    localStorage.setItem('staffMembers', JSON.stringify(staffMembers));
  }, [staffMembers]);

  // 每個分類下的工作計數
  const [recordCounts, setRecordCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('recordCounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse recordCounts', e);
    }

    return {
      t1: { s1: 0, s2: 0, s3: 0 },
      t2: { s1: 0, s2: 0, s3: 0 },
      t3: { s1: 0, s2: 0, s3: 0 },
    };
  });
  useEffect(() => {
    localStorage.setItem('recordCounts', JSON.stringify(recordCounts));
  }, [recordCounts]);

  /* =========================================================
     公用函式
  ========================================================= */

  const handleAddWorkflowCategory = () => {
    if (!newCategoryName.trim()) return;
    const newId = 'workflow-' + Date.now();
    setWorkflowCategories([
      ...workflowCategories,
      { id: newId, name: newCategoryName },
    ]);
    setAllTasks({ ...allTasks, [newId]: [] });
    setNewCategoryName('');
    setIsAddingCategory(false);
    setActiveMenu(newId);
  };

  const handleUpdateCategory = (id, newName) => {
    if (!newName.trim()) return;
    setWorkflowCategories(
      workflowCategories.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const handleDeleteCategory = (id) => {
    setWorkflowCategories(workflowCategories.filter((c) => c.id !== id));
    if (activeMenu === id) setActiveMenu('home');
  };

  const handleMenuSelect = (menuId) => {
    setActiveMenu(menuId);
    if (window.innerWidth < 1024) setIsMobileDrawerOpen(false);
  };

  const renderContent = () => {
    if (activeMenu.startsWith('workflow')) {
      const category =
        workflowCategories.find((c) => c.id === activeMenu) ||
        workflowCategories[0];
      return (
        <WorkflowContent
          categoryName={category?.name || '工作流程管理'}
          tasks={allTasks[activeMenu] || []}
          isEditMode={isEditMode}
          onSave={(id, updatedTask) => {
            setAllTasks((prev) => ({
              ...prev,
              [activeMenu]: prev[activeMenu]
                .map((t) => (t.id === id ? updatedTask : t))
                .sort((a, b) => a.time.localeCompare(b.time)),
            }));
          }}
          onDelete={(id) => {
            setAllTasks((prev) => ({
              ...prev,
              [activeMenu]: prev[activeMenu].filter((t) => t.id !== id),
            }));
          }}
          onAdd={(newTask) => {
            const newTaskWithId = { ...newTask, id: Date.now() };
            setAllTasks((prev) => ({
              ...prev,
              [activeMenu]: [...(prev[activeMenu] || []), newTaskWithId].sort(
                (a, b) => a.time.localeCompare(b.time)
              ),
            }));
          }}
        />
      );
    }

    switch (activeMenu) {
      case 'records':
        return (
          <RecordsContent
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            recordTabs={recordTabs}
            setRecordTabs={setRecordTabs}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            staffMembers={staffMembers}
            setStaffMembers={setStaffMembers}
            recordCounts={recordCounts}
            setRecordCounts={setRecordCounts}
          />
        );
      case 'station':
      case 'station-a':
      case 'station-b':
      case 'station-c':
        return <StationContent activeArea={activeMenu} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 w-full">
            <StarLogo className="w-12 h-12 mb-4 opacity-30" />
            <p>請選擇一個項目</p>
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        body, html { margin: 0 !important; padding: 0 !important; background-color: #dce0e4 !important; height: 100vh !important; width: 100vw !important; overflow: hidden !important; }
        #root { width: 100vw !important; max-width: none !important; padding: 0 !important; margin: 0 !important; height: 100vh !important; text-align: left !important; display: block !important; }
        ::-webkit-scrollbar { width: 0px; height: 0px; background: transparent; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* 密碼驗證彈跳視窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 text-black rounded-full mb-4 mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              管理員解鎖
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              請輸入編輯密碼以開啟新增、修改與刪除功能
            </p>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className={`w-full px-4 py-3 rounded-xl border ${
                passwordError
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-200 bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-center tracking-[0.5em] font-mono text-lg font-bold`}
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
            {passwordError ? (
              <p className="text-red-500 text-xs text-center mt-2 font-medium">
                密碼錯誤，請重新輸入
              </p>
            ) : (
              <p className="text-transparent text-xs text-center mt-2 select-none">
                .
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                  setPasswordError(false);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                解鎖
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 flex bg-[#dce0e4] p-0 lg:p-6 xl:p-8 overflow-hidden font-sans text-gray-800 lg:gap-4 xl:gap-6">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-16 bg-[#f2f2f6] flex items-center justify-between px-5 z-30 shadow-sm">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="relative">
              <StarLogo
                className={`w-6 h-6 transition-all duration-300 ${
                  isEditMode ? 'text-black drop-shadow-sm' : 'text-black'
                }`}
              />
              {isEditMode && (
                <div className="absolute -top-1 -right-2 bg-gray-200 text-black rounded-full p-0.5 shadow-sm">
                  <Unlock className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <span className="font-semibold text-lg tracking-wide">Work OS</span>
          </div>
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-2 bg-white rounded-full shadow-sm active:scale-95 transition-transform"
          >
            <Menu className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden absolute bottom-0 left-0 w-full h-[80px] bg-white border-t border-gray-100 flex justify-around items-center px-4 z-30 pb-4 shadow-[0_-4px_25px_rgba(0,0,0,0.05)] rounded-t-3xl">
          <button
            onClick={() => handleMenuSelect('home')}
            className={`relative p-3 rounded-xl transition-all ${
              activeMenu === 'home'
                ? 'text-black bg-gray-100'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            <Home
              className="w-6 h-6"
              strokeWidth={activeMenu === 'home' ? 2 : 1.5}
            />
          </button>
          <button
            onClick={() => handleMenuSelect('workflow')}
            className={`relative p-3 rounded-xl transition-all ${
              activeMenu.startsWith('workflow')
                ? 'text-black bg-gray-100'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            <Briefcase
              className="w-6 h-6"
              strokeWidth={activeMenu.startsWith('workflow') ? 2 : 1.5}
            />
            <span className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full border-2 border-white"></span>
          </button>
          <button className="relative p-3 rounded-xl text-gray-400 hover:text-black transition-all">
            <PlusSquare className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => handleMenuSelect('records')}
            className={`relative p-3 rounded-xl transition-all ${
              activeMenu === 'records'
                ? 'text-black bg-gray-100'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            <ClipboardList
              className="w-6 h-6"
              strokeWidth={activeMenu === 'records' ? 2 : 1.5}
            />
          </button>
          <button
            onClick={() => handleMenuSelect('station')}
            className={`relative p-3 rounded-xl transition-all ${
              activeMenu.startsWith('station')
                ? 'bg-black text-white shadow-md'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            <Map
              className="w-6 h-6"
              strokeWidth={activeMenu.startsWith('station') ? 2 : 1.5}
            />
          </button>
        </div>

        {/* 1. Desktop Nav */}
        <nav className="hidden lg:flex w-[72px] bg-[#f2f2f6] rounded-full flex-col items-center py-8 shadow-sm flex-shrink-0 relative overflow-hidden">
          <div
            className="mb-12 relative cursor-pointer group"
            onClick={handleLogoClick}
            title={isEditMode ? '點擊鎖定系統' : '點擊解鎖編輯模式'}
          >
            <StarLogo
              className={`w-[22px] h-[22px] transition-all duration-300 ${
                isEditMode
                  ? 'text-black drop-shadow-md scale-110'
                  : 'text-black group-hover:scale-110'
              }`}
            />
            {isEditMode && (
              <div className="absolute -top-2 -right-3 bg-gray-200 text-black rounded-full p-0.5 shadow-sm animate-fade-in">
                <Unlock className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8 w-full items-center relative z-10">
            <button
              onClick={() => handleMenuSelect('home')}
              className="relative group text-gray-500 hover:text-black transition-colors"
            >
              <Home className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleMenuSelect('workflow')}
              className={`relative group transition-colors ${
                activeMenu.startsWith('workflow')
                  ? 'text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Briefcase className="w-6 h-6" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-400 rounded-full border-2 border-[#f2f2f6]"></span>
            </button>
            <button className="relative group text-gray-500 hover:text-black transition-colors">
              <PlusSquare className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleMenuSelect('records')}
              className={`relative group transition-colors ${
                activeMenu === 'records'
                  ? 'text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <ClipboardList className="w-6 h-6" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => handleMenuSelect('station')}
              className={`relative w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                activeMenu.startsWith('station')
                  ? 'bg-white shadow-md text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Map className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>
          <div className="absolute bottom-0 w-full h-1/3 flex justify-center">
            <div className="w-[1px] h-full bg-gray-300"></div>
          </div>
        </nav>

        {isMobileDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          ></div>
        )}

        {/* 2. Menu Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-[280px] lg:w-[260px] xl:w-[320px] bg-[#f2f2f6] lg:rounded-[2rem] p-6 shadow-2xl lg:shadow-sm flex-shrink-0 flex flex-col h-full overflow-y-auto no-scrollbar
          transform transition-transform duration-300 ease-in-out ${
            isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0
        `}
        >
          <div className="flex justify-end mb-4 lg:hidden shrink-0">
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-2 bg-gray-200/60 rounded-full text-gray-600 hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <MenuItem
              icon={<Home className="w-5 h-5" strokeWidth={1.5} />}
              label="首頁"
              isActive={activeMenu === 'home'}
              onClick={() => handleMenuSelect('home')}
            />

            {/* 工作流程分類 */}
            <div className="mt-1 flex flex-col">
              <div
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
                  activeMenu.startsWith('workflow')
                    ? 'bg-[#1a1b1e] text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/60'
                }`}
                onClick={() => {
                  setActiveMenu('workflow');
                  setIsWorkflowExpanded(!isWorkflowExpanded);
                }}
              >
                <div className="flex items-center gap-3 font-medium text-[15px]">
                  <div className="relative">
                    <Briefcase className="w-5 h-5" strokeWidth={1.5} />
                    {!activeMenu.startsWith('workflow') && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-400 rounded-full border-2 border-[#f2f2f6]"></span>
                    )}
                  </div>
                  <span>工作流程</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs w-5 h-5 flex items-center justify-center rounded-full ${
                      activeMenu.startsWith('workflow')
                        ? 'bg-white text-black'
                        : 'bg-black text-white'
                    }`}
                  >
                    {workflowCategories.length}
                  </span>
                  <span className="text-xl font-light leading-none w-3 text-center">
                    {isWorkflowExpanded ? '-' : '+'}
                  </span>
                </div>
              </div>

              {isWorkflowExpanded && (
                <div className="relative ml-6 mt-2 mb-2 flex flex-col gap-1">
                  <div className="absolute left-[11px] top-0 bottom-6 w-[1.5px] bg-gray-300"></div>
                  {workflowCategories.map((category) => (
                    <EditableSubMenuItem
                      key={category.id}
                      item={category}
                      isActive={activeMenu === category.id}
                      isEditMode={isEditMode}
                      onClick={() => handleMenuSelect(category.id)}
                      onSave={(newName) =>
                        handleUpdateCategory(category.id, newName)
                      }
                      onDelete={() => handleDeleteCategory(category.id)}
                    />
                  ))}

                  {isEditMode &&
                    (isAddingCategory ? (
                      <div className="relative flex flex-col gap-2 py-2 ml-8 pr-4 animate-fade-in">
                        <input
                          type="text"
                          placeholder="輸入分類名稱..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-gray-400 shadow-sm text-gray-900 font-medium"
                          autoFocus
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              setIsAddingCategory(false);
                              setNewCategoryName('');
                            }}
                            className="text-xs text-gray-600 hover:bg-gray-200 bg-gray-100 px-3 py-1.5 rounded-md font-medium transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleAddWorkflowCategory}
                            className="text-xs bg-black text-white px-3 py-1.5 rounded-md shadow-sm font-medium hover:bg-gray-800 transition-colors"
                          >
                            確認
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="relative flex items-center py-1 group cursor-pointer animate-fade-in"
                        onClick={() => setIsAddingCategory(true)}
                      >
                        <div className="absolute left-[11px] top-1/2 w-4 h-[1.5px] bg-gray-300"></div>
                        <div className="ml-8 flex items-center gap-3 px-4 py-2 rounded-xl transition-all w-full text-black hover:bg-gray-100 hover:text-black">
                          <PlusSquare
                            className="w-4 h-4 shrink-0"
                            strokeWidth={1.5}
                          />
                          <span className="text-[14px] font-bold">
                            新增分類
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500 hover:bg-white/50 rounded-2xl cursor-pointer transition-colors mt-1 mb-1">
              <div className="flex items-center gap-3">
                <PlusSquare className="w-5 h-5" strokeWidth={1.5} />
                <span>整合功能</span>
              </div>
              <span>+</span>
            </div>

            <MenuItem
              icon={<ClipboardList className="w-5 h-5" strokeWidth={1.5} />}
              label="工作紀錄"
              isActive={activeMenu === 'records'}
              onClick={() => handleMenuSelect('records')}
            />

            <div className="mt-2 flex flex-col">
              <div
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all ${
                  activeMenu.startsWith('station')
                    ? 'bg-[#1a1b1e] text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/60'
                }`}
                onClick={() => {
                  setActiveMenu('station');
                  setIsStationExpanded(!isStationExpanded);
                }}
              >
                <div className="flex items-center gap-3 font-medium text-[15px]">
                  <Map className="w-5 h-5" strokeWidth={1.5} />
                  <span>崗位區域安排</span>
                </div>
                <span className="text-xl font-light leading-none w-3 text-center">
                  {isStationExpanded ? '-' : '+'}
                </span>
              </div>

              {isStationExpanded && (
                <div className="relative ml-6 mt-2 mb-2 flex flex-col gap-1">
                  <div className="absolute left-[11px] top-0 bottom-6 w-[1.5px] bg-gray-300"></div>
                  <SubMenuItem
                    label="A區 內部崗位"
                    isActive={activeMenu === 'station-a'}
                    onClick={() => handleMenuSelect('station-a')}
                  />
                  <SubMenuItem
                    label="B區 外部崗位"
                    isActive={activeMenu === 'station-b'}
                    onClick={() => handleMenuSelect('station-b')}
                  />
                  <SubMenuItem
                    label="機動支援組"
                    isActive={activeMenu === 'station-c'}
                    onClick={() => handleMenuSelect('station-c')}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-col pb-8 shrink-0">
            <div className="flex flex-col gap-1 text-[15px] text-gray-600">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer hover:bg-white/80 hover:text-black transition-colors">
                <Folder className="w-5 h-5" strokeWidth={1.5} />
                <span>歸檔紀錄 (Archive)</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer hover:bg-white/80 hover:text-black transition-colors">
                <Star className="w-5 h-5" strokeWidth={1.5} />
                <span>常用設定 (Favourite's)</span>
              </div>
            </div>
            <div className="pt-3 mt-1">
              <div className="mx-4 border-t border-gray-200 pt-4 mb-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>草稿箱 (3)</span>
                  <Pin className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col gap-1 text-[15px] text-gray-600">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer hover:bg-white/80 hover:text-black transition-colors">
                  <Code className="w-5 h-5" strokeWidth={1.5} />
                  <span>一般流程</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer hover:bg-white/80 hover:text-black transition-colors">
                  <Code className="w-5 h-5" strokeWidth={1.5} />
                  <span>未發布排班</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer hover:bg-white/80 hover:text-black transition-colors">
                  <Code className="w-5 h-5" strokeWidth={1.5} />
                  <span>系統反饋</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. 主內容顯示區 */}
        <main className="flex-1 bg-[#f9f9fb] lg:rounded-[2rem] rounded-none p-5 pt-20 pb-[100px] lg:pt-8 lg:pb-8 lg:px-8 xl:px-12 2xl:px-16 shadow-sm overflow-y-auto w-full flex flex-col h-full">
          {renderContent()}
        </main>
      </div>
    </>
  );
};

// --- Sub-components ---

const MenuItem = ({
  icon,
  label,
  isActive,
  onClick,
  badge,
  hasNotification,
}) => (
  <div
    onClick={onClick}
    className={`relative flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all text-[15px] ${
      isActive
        ? 'bg-[#1a1b1e] text-white shadow-lg font-medium'
        : 'text-gray-600 hover:bg-white/80 font-normal'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="relative">
        {icon}
        {hasNotification && !isActive && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-400 rounded-full border-2 border-[#f2f2f6]"></span>
        )}
      </div>
      <span>{label}</span>
    </div>
    {badge && (
      <span
        className={`text-xs w-5 h-5 flex items-center justify-center rounded-full ${
          isActive ? 'bg-white text-black' : 'bg-black text-white'
        }`}
      >
        {badge}
      </span>
    )}
  </div>
);

const SubMenuItem = ({ label, isActive, onClick }) => (
  <div
    onClick={onClick}
    className="relative flex items-center py-1 group cursor-pointer"
  >
    <div className="absolute left-[11px] top-1/2 w-4 h-[1.5px] bg-gray-300"></div>
    <div
      className={`ml-8 flex items-center gap-3 px-4 py-2 rounded-xl transition-all w-full ${
        isActive
          ? 'bg-white text-black shadow-sm font-medium'
          : 'text-gray-500 hover:bg-white/40'
      }`}
    >
      <Folder className="w-4 h-4 shrink-0" strokeWidth={1.5} />
      <span className="text-[14px]">{label}</span>
    </div>
  </div>
);

const EditableSubMenuItem = ({
  item,
  isActive,
  onClick,
  onSave,
  onDelete,
  isEditMode,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isEditing && isEditMode) {
    return (
      <div className="relative flex flex-col gap-2 py-2 ml-8 pr-4 animate-fade-in">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-gray-400 shadow-sm text-gray-900 font-medium"
          autoFocus
        />
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              setIsEditing(false);
              setEditName(item.name);
            }}
            className="text-xs text-gray-600 hover:bg-gray-200 bg-gray-100 px-3 py-1.5 rounded-md font-medium"
          >
            取消
          </button>
          <button
            onClick={() => {
              onSave(editName);
              setIsEditing(false);
            }}
            className="text-xs bg-black text-white px-3 py-1.5 rounded-md shadow-sm font-medium hover:bg-gray-800"
          >
            儲存
          </button>
        </div>
      </div>
    );
  }

  if (isDeleting && isEditMode) {
    return (
      <div className="relative flex flex-col gap-2 py-2 ml-8 pr-4 animate-fade-in">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 shadow-sm">
          <span className="text-xs text-red-600 font-bold block mb-2">
            確定刪除？
          </span>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setIsDeleting(false)}
              className="text-xs text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
            <button
              onClick={onDelete}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm transition-colors"
            >
              確認刪除
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center py-1 group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute left-[11px] top-1/2 w-4 h-[1.5px] bg-gray-300"></div>
      <div
        className={`ml-8 flex items-center justify-between px-4 py-2 rounded-xl transition-all w-full ${
          isActive
            ? 'bg-white text-black shadow-sm font-medium'
            : 'text-gray-500 hover:bg-white/40'
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          <Folder className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span className="text-[14px] truncate">{item.name}</span>
        </div>
        {isEditMode && (
          <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-2 animate-fade-in">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1.5 hover:bg-gray-100 hover:text-black rounded-lg text-gray-400 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleting(true);
              }}
              className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================================================================================
   Workflow Content (工作流程管理)
=================================================================================== */

const TimelineEditForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || { time: '09:00', title: '', content: '' }
  );

  return (
    <div className="relative pl-8 md:pl-12 mb-8 group animate-fade-in">
      <div className="absolute -left-[9px] top-1.5 w-5 h-5 bg-black rounded-full border-4 border-white shadow-sm animate-pulse z-10"></div>
      <div className="bg-gray-50 rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              style={{ colorScheme: 'light' }}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm md:w-32 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all font-bold text-gray-900"
            />
            <input
              type="text"
              placeholder="輸入工作標題..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex-1 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all font-bold text-gray-900"
            />
          </div>
          <textarea
            placeholder="詳細工作內容與注意事項說明..."
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm w-full h-28 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all resize-none text-gray-800 font-medium leading-relaxed"
          ></textarea>
          <div className="flex justify-end gap-3 mt-1">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200/50 bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-5 py-2.5 text-sm font-medium bg-black text-white hover:bg-gray-800 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> 儲存流程
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ task, onSave, onDelete, isEditMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isEditing && isEditMode) {
    return (
      <TimelineEditForm
        initialData={task}
        onSave={(updatedData) => {
          onSave(task.id, updatedData);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="relative pl-8 md:pl-12 mb-8 group animate-fade-in">
      <div className="absolute -left-[9px] top-1.5 w-5 h-5 bg-black rounded-full border-4 border-white shadow-sm group-hover:scale-125 transition-transform duration-300 z-10"></div>
      <div className="bg-[#f8f9fa] rounded-3xl p-5 md:p-6 border border-transparent hover:border-gray-200 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-gray-200 text-gray-900 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm">
              <Clock className="w-4 h-4" /> {task.time}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              {task.title}
            </h3>
          </div>
          {isEditMode && (
            <div className="flex items-center gap-2 self-end sm:self-auto animate-fade-in relative min-h-[36px]">
              {confirmDelete ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-red-100 p-1.5 rounded-xl shadow-md z-20 whitespace-nowrap">
                  <span className="text-xs text-red-600 font-bold ml-2">
                    確定刪除？
                  </span>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    確認刪除
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <p className="text-gray-700 text-[15px] font-medium leading-relaxed mt-2">
          {task.content}
        </p>
      </div>
    </div>
  );
};

const WorkflowContent = ({
  categoryName,
  tasks,
  onSave,
  onDelete,
  onAdd,
  isEditMode,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="animate-fade-in flex flex-col h-full w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          {categoryName}
        </h2>
        {isEditMode && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md flex items-center justify-center gap-2 w-full sm:w-auto animate-fade-in
              ${
                isAdding
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 active:scale-95'
              }`}
          >
            <PlusSquare className="w-4 h-4" /> 新增流程節點
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 flex-1 overflow-y-auto">
        {tasks.length === 0 && (!isAdding || !isEditMode) ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <ClipboardList className="w-16 h-16 opacity-20" />
            <p>
              {isEditMode
                ? '目前沒有任何工作流程，點擊上方按鈕新增。'
                : '目前沒有任何工作流程資料。'}
            </p>
          </div>
        ) : (
          <div className="relative border-l-[3px] border-gray-100 ml-3 md:ml-6 mt-4 pb-12">
            {tasks.map((task) => (
              <TimelineItem
                key={task.id}
                task={task}
                onSave={onSave}
                onDelete={onDelete}
                isEditMode={isEditMode}
              />
            ))}
            {isAdding && isEditMode && (
              <TimelineEditForm
                onSave={(newTask) => {
                  onAdd(newTask);
                  setIsAdding(false);
                }}
                onCancel={() => setIsAdding(false)}
              />
            )}
            {(!isAdding || !isEditMode) && (
              <div className="absolute -left-[7px] bottom-0 w-3 h-3 bg-gray-300 rounded-full"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================================================================================
   🆕 RecordsContent：全新升級的「風琴夾 Tabs」工作紀錄與人員編輯介面
=================================================================================== */

const RecordsContent = ({
  isEditMode,
  setIsEditMode,
  recordTabs,
  setRecordTabs,
  activeTabId,
  setActiveTabId,
  staffMembers,
  setStaffMembers,
  recordCounts,
  setRecordCounts,
}) => {
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [deletingTabId, setDeletingTabId] = useState(null); // Tab 防呆刪除狀態

  // 新增人員表單狀態
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('店長');
  const [deletingStaffId, setDeletingStaffId] = useState(null); // Staff 防呆刪除狀態

  // 處理計數加減
  const updateCount = (staffId, change) => {
    setRecordCounts((prev) => {
      const currentCount = prev[activeTabId]?.[staffId] || 0;
      const newCount = Math.max(0, currentCount + change);
      return {
        ...prev,
        [activeTabId]: { ...(prev[activeTabId] || {}), [staffId]: newCount },
      };
    });
  };

  // 處理新增分類 Tab
  const handleAddTab = () => {
    if (!newTabName.trim()) return;
    const newId = 't' + Date.now();
    setRecordTabs([...recordTabs, { id: newId, name: newTabName.trim() }]);
    setRecordCounts((prev) => ({ ...prev, [newId]: {} }));
    setActiveTabId(newId);
    setNewTabName('');
    setIsAddingTab(false);
  };

  // 處理刪除分類 Tab
  const handleDeleteTab = (id) => {
    const updatedTabs = recordTabs.filter((t) => t.id !== id);
    setRecordTabs(updatedTabs);
    if (activeTabId === id && updatedTabs.length > 0) {
      setActiveTabId(updatedTabs[0].id);
    }
  };

  // 處理新增工作人員
  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;
    const newId = 's' + Date.now();
    setStaffMembers([
      ...staffMembers,
      { id: newId, name: newStaffName.trim(), role: newStaffRole },
    ]);
    setNewStaffName('');
  };

  // 處理刪除工作人員
  const handleDeleteStaff = (id) => {
    setStaffMembers(staffMembers.filter((s) => s.id !== id));
  };

  return (
    <div className="animate-fade-in flex flex-col h-full w-full max-w-5xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 shrink-0">
        工作紀錄
      </h2>

      {/* 解鎖模式：顯示從上方推播下來的【管理介面卡片】 */}
      {isEditMode && (
        <div className="animate-fade-in-down bg-gray-50 rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-gray-200 mb-6 shrink-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> 管理模式：手動新增工作人員
            </h3>
            {/* 儲存並鎖定按鈕，給予使用者明確的完成感 */}
            <button
              onClick={() => setIsEditMode(false)}
              className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-gray-800 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <CheckCircle2 className="w-4 h-4" /> 儲存變更並鎖定
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                手動新增姓名名稱
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="輸入人員姓名..."
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()}
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 font-bold text-gray-900"
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none font-bold text-gray-900 cursor-pointer"
                >
                  <option value="店長">店長</option>
                  <option value="正職">正職</option>
                  <option value="兼職">兼職</option>
                </select>
                <button
                  onClick={handleAddStaff}
                  disabled={!newStaffName.trim()}
                  className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:bg-gray-300 transition-colors shadow-sm"
                >
                  新增
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 風琴夾 / Tabs 分類標籤區 */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 overflow-x-auto no-scrollbar shrink-0 pt-2 px-2">
        {recordTabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`group relative flex items-center gap-2 px-6 py-3.5 rounded-t-2xl cursor-pointer font-bold transition-all
              ${
                activeTabId === tab.id
                  ? 'bg-white text-black shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-10'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
          >
            <span className="text-[15px]">{tab.name}</span>
            {/* 解鎖模式下才顯示標籤刪除按鈕 (加入確認儲存防呆) */}
            {isEditMode &&
              recordTabs.length > 1 &&
              (deletingTabId === tab.id ? (
                <div className="flex items-center gap-1 ml-2 animate-fade-in bg-white p-1 rounded-lg shadow-sm border border-red-100 absolute right-1 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTab(tab.id);
                      setDeletingTabId(null);
                    }}
                    className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md hover:bg-red-600 shadow-sm"
                  >
                    確認刪除
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingTabId(null);
                    }}
                    className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md hover:bg-gray-200"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingTabId(tab.id);
                  }}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ))}
          </div>
        ))}

        {/* 新增分類 Tab (僅解鎖模式顯示) */}
        {isEditMode &&
          (isAddingTab ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-t-2xl shadow-[0_-4px_15px_rgba(0,0,0,0.03)] animate-fade-in z-10">
              <input
                type="text"
                autoFocus
                placeholder="分類名稱..."
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTab()}
                className="border-b border-gray-300 w-24 outline-none text-sm font-bold text-gray-900 pb-1"
              />
              <button
                onClick={handleAddTab}
                className="text-black bg-gray-100 p-1 rounded-md hover:bg-gray-200"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAddingTab(false)}
                className="text-gray-400 bg-gray-100 p-1 rounded-md hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsAddingTab(true)}
              className="flex items-center gap-2 px-5 py-3.5 text-gray-400 cursor-pointer hover:text-black hover:bg-white rounded-t-2xl transition-colors font-bold text-sm"
            >
              <PlusSquare className="w-4 h-4" /> <span>新增分類</span>
            </div>
          ))}
      </div>

      {/* 工作人員計數卡片列表區塊 */}
      <div className="flex flex-col gap-4 overflow-y-auto pb-10 pt-2 px-1 relative">
        {staffMembers.map((staff) => {
          const currentCount = recordCounts[activeTabId]?.[staff.id] || 0;
          return (
            <div
              key={staff.id}
              className="bg-white rounded-[1.5rem] p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:border-gray-200 transition-colors animate-fade-in group"
            >
              {/* 左側：頭像與姓名資訊 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50 text-gray-400 shrink-0 shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <span className="font-bold text-gray-900 text-lg leading-none">
                    {staff.name}
                  </span>
                  <span
                    className={`text-[10px] text-white font-bold px-2.5 py-0.5 rounded-md leading-none shadow-sm
                        ${
                          staff.role === '店長'
                            ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                  >
                    {staff.role}
                  </span>
                </div>
              </div>

              {/* 右側：完成次數與控制按鈕 */}
              <div className="flex items-center gap-5 md:gap-8 relative min-h-[40px]">
                <div className="flex flex-col items-center justify-center hidden sm:flex">
                  <span className="text-[11px] text-gray-500 font-bold mb-1 tracking-wide">
                    完成次數
                  </span>
                  <span className="text-2xl font-black text-black leading-none">
                    {currentCount}
                  </span>
                </div>

                <div className="flex items-center bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm">
                  <button
                    onClick={() => updateCount(staff.id, -1)}
                    className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-black font-black text-xl leading-none transition-colors active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="font-black text-black w-10 text-center text-lg">
                    {currentCount}
                  </span>

                  <button
                    onClick={() => updateCount(staff.id, 1)}
                    className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-black hover:bg-gray-200 hover:text-black font-black text-xl leading-none transition-colors active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* 優化後的全覆蓋防誤刪視窗，避免手機端點不到 */}
                {isEditMode &&
                  (deletingStaffId === staff.id ? (
                    <div className="absolute inset-y-[-10px] right-0 pl-16 pr-2 bg-gradient-to-l from-white via-white to-transparent flex items-center justify-end gap-2 z-20 animate-fade-in">
                      <span className="text-xs text-red-600 font-bold mr-1 hidden sm:inline">
                        確定移除 {staff.name}？
                      </span>
                      <button
                        onClick={() => setDeletingStaffId(null)}
                        className="text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteStaff(staff.id);
                          setDeletingStaffId(null);
                        }}
                        className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                      >
                        確認刪除
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingStaffId(staff.id)}
                      className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors md:opacity-0 md:group-hover:opacity-100"
                      title="刪除此人員"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
        {staffMembers.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-medium flex flex-col items-center gap-3">
            <Users className="w-12 h-12 opacity-20" />
            {isEditMode
              ? '尚未設定工作人員，請在上方管理模式新增'
              : '目前沒有工作人員資料'}
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================================================================================
   StationContent
=================================================================================== */

const StationContent = ({ activeArea }) => {
  const areaName =
    activeArea === 'station-a'
      ? 'A區 內部崗位'
      : activeArea === 'station-b'
      ? 'B區 外部崗位'
      : '所有崗位區域總覽';

  return (
    <div className="animate-fade-in h-full flex flex-col w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          {areaName}
        </h2>
        <button className="bg-black text-white px-4 py-2.5 sm:py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shadow-md sm:shadow-none">
          <PlusSquare className="w-4 h-4" /> 新增排班
        </button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Map className="w-32 h-32 md:w-40 md:h-40" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  主入口迎賓櫃台
                </h3>
                <p className="text-gray-500 text-sm mt-1 font-medium">
                  目前排班: 2 人
                </p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                運作中
              </span>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm">
                    王
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      王大明
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 早班 08:00 - 16:00
                    </p>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-11 md:h-11 bg-pink-100 rounded-full flex items-center justify-center text-pink-700 font-bold text-lg shadow-sm">
                    林
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      林小美
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 晚班 16:00 - 00:00
                    </p>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkDashboard;

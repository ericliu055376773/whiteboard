import React, { useState, useEffect } from 'react';
import { 
  Home, Briefcase, ClipboardList, Map, 
  Folder, Pin, PlusSquare, CreditCard, Box, 
  CheckCircle2, Clock, Users, Archive, Star, 
  MessageSquare, Code, Menu, X, GitMerge, 
  FileText, LayoutGrid, Edit2, Trash2, Key, 
  Unlock, Settings2, Plus, Minus, User, Type,
  LayoutTemplate, Calendar, BarChart2, Bell
} from 'lucide-react';

// ===== 引入 Firebase SDK =====
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

// 您的 Firebase 設定檔
const firebaseConfig = {
  apiKey: "AIzaSyDLTYRom_8CdTWKk3HqhqQz3_yzHTOc37E",
  authDomain: "wthiteboard.firebaseapp.com",
  projectId: "wthiteboard",
  storageBucket: "wthiteboard.firebasestorage.app",
  messagingSenderId: "699339559143",
  appId: "1:699339559143:web:118305be188efa745a1242"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================================================
   自訂 Hook：自動同步 React State 與 Firebase Firestore
========================================================= */
function useFirestoreState(collectionName, docId, defaultValue) {
  const [state, setState] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const docRef = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setState(snap.data().value);
      } else {
        // 如果雲端沒有這筆資料，就建立並寫入預設值
        setDoc(docRef, { value: defaultValue }).catch(console.error);
        setState(defaultValue);
      }
      setIsLoaded(true);
    }, (error) => {
      console.error(`讀取 Firestore 失敗 (${docId}):`, error);
      setIsLoaded(true); // 發生錯誤時仍解除讀取畫面，使用本地狀態
    });

    return () => unsubscribe();
  }, [collectionName, docId]);

  // 覆寫 setState，讓它同時更新本地畫面與雲端資料庫
  const setFirestoreState = (newValue) => {
    setState(prevState => {
      const resolvedValue = typeof newValue === 'function' ? newValue(prevState) : newValue;
      setDoc(doc(db, collectionName, docId), { value: resolvedValue }).catch(console.error);
      return resolvedValue;
    });
  };

  return [state, setFirestoreState, isLoaded];
}


// 客製化：完美還原設計圖的「四角星星」Logo
const StarLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1.5C12 1.5 13 9 22.5 12C13 15 12 22.5 12 22.5C12 22.5 11 15 1.5 12C11 9 12 1.5 12 1.5Z" />
  </svg>
);

export default function App() {
  const [activeMenu, setActiveMenu] = useState('home'); 
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  /* =========================================================
     編輯權限鎖定狀態 (預設鎖定)
  ========================================================= */
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 

  // ===== 全域設定面板的 UI State =====
  const [settingTab, setSettingTab] = useState('staff');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('正職');
  const [selectedStationCat, setSelectedStationCat] = useState('');
  const [newStationName, setNewStationName] = useState('');

  const handleLogoClick = () => {
    if (isEditMode) {
      setIsSettingsOpen(true); 
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
     Firebase 雲端儲存系統 (取代原本的 LocalStorage)
  ========================================================= */
  
  // 1. 主選單排序狀態
  const [mainMenuOrder, setMainMenuOrder, isL1] = useFirestoreState('workOS_v1', 'mainMenuOrder', ['home', 'workflow', 'integrations', 'records', 'station']);
  
  // 2. 工作流程分類
  const [workflowCategories, setWorkflowCategories, isL2] = useFirestoreState('workOS_v1', 'workflowCategories', [
    { id: 'workflow', name: '標準作業程序 (SOP)' },
    { id: 'workflow-project', name: '專案排程追蹤' }
  ]);

  // 3. 介面文字設定
  const [menuLabels, setMenuLabels, isL3] = useFirestoreState('workOS_v1', 'menuLabels', {
    home: '首頁', workflow: '工作流程', integrations: '物料消耗', records: '工作紀錄', station: '崗位區域安排'
  });

  // 4. 崗位區域分類
  const [stationCategories, setStationCategories, isL4] = useFirestoreState('workOS_v1', 'stationCategories', [
    { id: 'station-a', name: 'A區 內部崗位' }, { id: 'station-b', name: 'B區 外部崗位' }, { id: 'station-c', name: '機動支援組' }
  ]);

  // 5. 崗位卡片
  const [stations, setStations, isL5] = useFirestoreState('workOS_v1', 'stations', [
    { id: 'st1', categoryId: 'station-a', name: '主入口迎賓櫃台' },
    { id: 'st2', categoryId: 'station-a', name: '車道訪客管制區' },
    { id: 'st3', categoryId: 'station-b', name: '戶外巡檢站' }
  ]);

  // 6. 崗位指派名單
  const [stationAssignments, setStationAssignments, isL6] = useFirestoreState('workOS_v1', 'stationAssignments', { 'st1': ['s1', 's2'] });

  // 7. 所有任務節點
  const [allTasks, setAllTasks, isL7] = useFirestoreState('workOS_v1', 'allTasks', {
    'workflow': [
      { id: 1, time: '08:00', title: '早班交接與設備點交', content: '確認大廳櫃台所有系統與設備運作正常，閱讀昨日工作日誌，並與夜班人員完成口頭與書面交接手續。確保零用金與重要鑰匙清點無誤。' },
      { id: 2, time: '10:30', title: '主入口區域巡檢', content: '檢查A區、B區訪客動線是否順暢，維持環境整潔，並排除任何可能的安全隱患。主動協助訪客辦理換證與引導作業。' }
    ],
    'workflow-project': [
      { id: 4, time: '09:00', title: '專案A進度會議', content: '確認各部門進度與潛在阻礙，準備週報。' }
    ]
  });

  // 8. 物料消耗紀錄
  const [consumptionRecords, setConsumptionRecords, isL8] = useFirestoreState('workOS_v1', 'consumptionRecords', []);

  // 9. 工作紀錄標籤 (送餐、收桌...)
  const [recordTabs, setRecordTabs, isL9] = useFirestoreState('workOS_v1', 'recordTabs', [
    { id: 't1', name: '送餐' }, { id: 't2', name: '收桌' }, { id: 't3', name: '買單' }
  ]);

  // 10. 工作人員名單
  const [staffMembers, setStaffMembers, isL10] = useFirestoreState('workOS_v1', 'staffMembers', [
    { id: 's1', name: '王大明', role: '店長' }, { id: 's2', name: '林小美', role: '正職' }, { id: 's3', name: '陳建國', role: '兼職' }
  ]);

  // 11. 每個分類下的工作計數
  const [recordCounts, setRecordCounts, isL11] = useFirestoreState('workOS_v1', 'recordCounts', {
    't1': { 's1': 0, 's2': 0, 's3': 0 }, 't2': { 's1': 0, 's2': 0, 's3': 0 }, 't3': { 's1': 0, 's2': 0, 's3': 0 }
  });

  // 12. 首頁公告資料
  const [announcements, setAnnouncements, isL12] = useFirestoreState('workOS_v1', 'announcements', [
    { id: 'a1', date: new Date().toISOString().split('T')[0], title: '雲端系統正式上線 🚀', content: 'Work OS 系統已正式連線至 Firebase 雲端資料庫！現在您所有的修改與設定都會即時儲存並同步給團隊成員。' },
    { id: 'a2', date: '2024-05-18', title: '端午節排班注意事項', content: '端午連假排班已開放填寫，請於本週五前完成畫假。' }
  ]);

  // 新增分類 UI 狀態變數
  const [isAddingWorkflowCat, setIsAddingWorkflowCat] = useState(false);
  const [newWorkflowCatName, setNewWorkflowCatName] = useState('');
  const [isAddingStationCat, setIsAddingStationCat] = useState(false);
  const [newStationCatName, setNewStationCatName] = useState('');
  const [activeTabId, setActiveTabId] = useState(recordTabs[0]?.id || 't1');

  // 確認所有雲端資料是否載入完畢
  const isAppReady = isL1 && isL2 && isL3 && isL4 && isL5 && isL6 && isL7 && isL8 && isL9 && isL10 && isL11 && isL12;

  /* =========================================================
     拖曳排序 (Drag & Drop) 系統
  ========================================================= */
  const [dragState, setDragState] = useState({ type: null, overIndex: null });
  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  const handleDragStart = (e, index, type) => {
    if (!isEditMode) return;
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => setDragState({ type, overIndex: index }), 0);
  };

  const handleDragEnter = (e, index, type) => {
    if (!isEditMode || dragState.type !== type) return;
    e.preventDefault();
    if (dragOverItem.current !== index) {
      dragOverItem.current = index;
      setDragState({ type, overIndex: index });
    }
  };

  const handleDragEnd = (e, type, list, setList) => {
    if (!isEditMode) return;
    e.preventDefault();
    
    const sourceIndex = dragItem.current;
    const targetIndex = dragOverItem.current;

    dragItem.current = null;
    dragOverItem.current = null;
    setDragState({ type: null, overIndex: null });

    if (sourceIndex === null || targetIndex === null || sourceIndex === targetIndex || dragState.type !== type) {
      return;
    }
    
    const newList = [...list];
    const [draggedItemContent] = newList.splice(sourceIndex, 1);
    newList.splice(targetIndex, 0, draggedItemContent);
    setList(newList);
  };

  const DraggableWrapper = ({ type, index, list, setList, children, className = '' }) => {
    const isDraggingThisType = dragState.type === type;
    const isDropTarget = isDraggingThisType && dragState.overIndex === index;
    const isBeingDragged = isDraggingThisType && dragItem.current === index;

    if (!isEditMode) {
      return <div className={className}>{children}</div>;
    }

    return (
      <div
        draggable
        onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, index, type); }}
        onDragEnter={(e) => { e.stopPropagation(); handleDragEnter(e, index, type); }}
        onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(e, type, list, setList); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className={`${className} cursor-grab active:cursor-grabbing transition-all duration-200 
          ${isDropTarget && !isBeingDragged ? 'border-t-[2px] border-dashed border-blue-500 pt-1 mt-1 opacity-90 scale-[0.98]' : ''}
          ${isBeingDragged ? 'opacity-30 scale-95 grayscale' : ''}
        `}
      >
        {children}
      </div>
    );
  };

  /* =========================================================
     公用函式與情境側邊欄判定
  ========================================================= */

  const getMenuProps = (menuId) => {
    const isActive = menuId === 'home' || menuId === 'integrations' || menuId === 'records' ? activeMenu === menuId : activeMenu.startsWith(menuId);
    let Icon = Box;
    let hasNotification = false;
    let label = menuLabels[menuId] || menuId;

    if (menuId === 'home') Icon = Home;
    if (menuId === 'workflow') { Icon = Briefcase; hasNotification = !activeMenu.startsWith('workflow'); }
    if (menuId === 'integrations') Icon = PlusSquare;
    if (menuId === 'records') Icon = ClipboardList;
    if (menuId === 'station') Icon = Map;

    return { isActive, Icon, hasNotification, label };
  };

  const handleUpdateCategory = (id, newName) => {
    if (!newName.trim()) return;
    setWorkflowCategories(workflowCategories.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleDeleteCategory = (id) => {
    setWorkflowCategories(workflowCategories.filter(c => c.id !== id));
    if (activeMenu === id) setActiveMenu('home');
  };

  const handleMenuSelect = (menuId) => {
    setActiveMenu(menuId);
    if (window.innerWidth < 1024) setIsMobileDrawerOpen(false);
  };

  // 左側主導覽列點擊邏輯 (自動選取第一個子分類)
  const handleLeftNavClick = (menuId) => {
    if (menuId === 'workflow') {
       setActiveMenu(workflowCategories[0]?.id || 'workflow');
    } else if (menuId === 'station') {
       setActiveMenu(stationCategories[0]?.id || 'station');
    } else {
       setActiveMenu(menuId);
    }
    if (window.innerWidth < 1024) setIsMobileDrawerOpen(false);
  };

  const getLeftNavBtnClass = (isActive) => {
    return `w-[48px] h-[48px] flex items-center justify-center rounded-2xl transition-all ${isActive ? 'bg-white shadow-md text-black' : 'text-gray-500 hover:text-black hover:bg-white/60'}`;
  };

  // 判斷當前的大分類與是否需要顯示側邊欄 (右側展開選單)
  const currentMainCategory = 
    activeMenu.startsWith('workflow') ? 'workflow' : 
    activeMenu.startsWith('station') ? 'station' : 
    activeMenu === 'integrations' ? 'integrations' : 
    activeMenu === 'records' ? 'records' : 'home';

  const hasSubMenu = currentMainCategory === 'workflow' || currentMainCategory === 'station';

  /* =========================================================
     全域管理面板元件 (Global Settings Modal)
  ========================================================= */
  const renderGlobalSettings = () => {
    if (!isSettingsOpen) return null;
    
    const activeStationCat = selectedStationCat || stationCategories[0]?.id || '';

    return (
      <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="bg-[#f9f9fb] w-full max-w-5xl h-[85vh] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200">
          
          {/* 左側 Sidebar */}
          <div className="w-full md:w-64 bg-white border-r border-gray-100 p-6 flex flex-col shrink-0 overflow-y-auto">
            <div className="flex items-center gap-3 mb-8 text-black">
              <Settings2 className="w-6 h-6" />
              <h2 className="text-xl font-bold">全域管理面板</h2>
            </div>
            
            <div className="flex flex-col gap-2">
              <button onClick={() => setSettingTab('staff')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${settingTab === 'staff' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}><Users className="w-4 h-4"/> 人員名單管理</button>
              <button onClick={() => setSettingTab('stations')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${settingTab === 'stations' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}><LayoutTemplate className="w-4 h-4"/> 崗位卡片管理</button>
              <button onClick={() => setSettingTab('text')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${settingTab === 'text' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}><Type className="w-4 h-4"/> 介面文字設定</button>
            </div>

            <div className="mt-auto pt-8 flex flex-col gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">關閉面板 (保持解鎖)</button>
              <button onClick={() => { setIsSettingsOpen(false); setIsEditMode(false); }} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2 text-sm"><Unlock className="w-4 h-4" /> 儲存並鎖定系統</button>
            </div>
          </div>

          {/* 右側 Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            
            {/* 人員管理 Tab */}
            {settingTab === 'staff' && (
              <div className="animate-fade-in max-w-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">人員名單管理</h3>
                <p className="text-gray-500 text-sm mb-6 font-bold">在此新增的人員名單將同步至全系統（包含工作紀錄、崗位區域安排等）。</p>
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                  <label className="block text-xs font-bold text-gray-700 mb-2">新增人員</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" placeholder="輸入人員姓名..." value={newStaffName} onChange={e => setNewStaffName(e.target.value)} onKeyDown={e => e.key==='Enter' && newStaffName.trim() && setStaffMembers([...staffMembers, {id: 's'+Date.now(), name: newStaffName.trim(), role: newStaffRole}])} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-black focus:ring-1 focus:ring-black" />
                    <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-black cursor-pointer">
                      <option value="店長">店長</option>
                      <option value="正職">正職</option>
                      <option value="兼職">兼職</option>
                    </select>
                    <button onClick={() => { if(newStaffName.trim()) { setStaffMembers([...staffMembers, {id: 's'+Date.now(), name: newStaffName.trim(), role: newStaffRole}]); setNewStaffName(''); } }} className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors">新增</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 ml-1">現有人員清單</label>
                  {staffMembers.map(staff => (
                    <div key={staff.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">{staff.name.charAt(0)}</div>
                        <span className="font-bold text-gray-900 text-lg">{staff.name}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-bold">{staff.role}</span>
                      </div>
                      <button onClick={() => setStaffMembers(staffMembers.filter(s => s.id !== staff.id))} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  ))}
                  {staffMembers.length === 0 && <p className="text-gray-400 text-center py-6 font-bold">目前沒有任何人員</p>}
                </div>
              </div>
            )}

            {/* 崗位卡片管理 Tab */}
            {settingTab === 'stations' && (
              <div className="animate-fade-in max-w-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">崗位卡片管理</h3>
                <p className="text-gray-500 text-sm mb-6 font-bold">為不同的分類區域建立工作崗位卡片，這些卡片將顯示在「崗位區域安排」介面中供指派人員。</p>
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                  <label className="block text-xs font-bold text-gray-700 mb-2">選擇要設定的區域分類</label>
                  <select value={activeStationCat} onChange={e => setSelectedStationCat(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-black cursor-pointer">
                    {stationCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    {stationCategories.length === 0 && <option value="" disabled>請先在側邊欄建立區域分類</option>}
                  </select>
                </div>

                {activeStationCat && (
                  <>
                    <div className="flex gap-3 mb-6">
                      <input type="text" placeholder="輸入新崗位名稱..." value={newStationName} onChange={e => setNewStationName(e.target.value)} onKeyDown={e => e.key==='Enter' && newStationName.trim() && (() => { setStations([...stations, {id: 'st'+Date.now(), categoryId: activeStationCat, name: newStationName.trim()}]); setNewStationName(''); })()} className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm" />
                      <button onClick={() => { if(newStationName.trim()) { setStations([...stations, {id: 'st'+Date.now(), categoryId: activeStationCat, name: newStationName.trim()}]); setNewStationName(''); } }} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm">新增崗位</button>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-700 ml-1">「{stationCategories.find(c=>c.id===activeStationCat)?.name}」的現有崗位</label>
                      {stations.filter(s => s.categoryId === activeStationCat).map(station => (
                        <div key={station.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-3 flex-1 mr-4">
                            <LayoutGrid className="w-5 h-5 text-gray-400" />
                            <input 
                              value={station.name} 
                              onChange={e => setStations(stations.map(s => s.id === station.id ? {...s, name: e.target.value} : s))} 
                              className="font-bold text-gray-900 text-lg w-full outline-none bg-transparent border-b border-transparent focus:border-gray-300 transition-colors"
                            />
                          </div>
                          <button onClick={() => { setStations(stations.filter(s => s.id !== station.id)); const newAssignments = {...stationAssignments}; delete newAssignments[station.id]; setStationAssignments(newAssignments); }} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
                        </div>
                      ))}
                      {stations.filter(s => s.categoryId === activeStationCat).length === 0 && <p className="text-gray-400 text-center py-6 font-bold">此區域尚未設定任何崗位</p>}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 介面文字設定 Tab */}
            {settingTab === 'text' && (
              <div className="animate-fade-in max-w-2xl pb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">介面文字設定</h3>
                <p className="text-gray-500 text-sm mb-6 font-bold">你可以隨時修改選單中顯示的文字，打造符合公司習慣的專屬系統。</p>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                  {Object.entries(menuLabels).map(([key, value]) => {
                    const keyNames = { home: '首頁按鈕', workflow: '工作流程 (主分類)', integrations: '整合功能 (現為消耗紀錄)', records: '工作紀錄', station: '崗位安排 (主分類)' };
                    return (
                      <div key={key}>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">{keyNames[key] || key}</label>
                        <input 
                          type="text" value={value} 
                          onChange={(e) => setMenuLabels({...menuLabels, [key]: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (activeMenu === 'home') {
      return (
        <HomeContent 
          announcements={announcements} 
          setAnnouncements={setAnnouncements} 
          isEditMode={isEditMode} 
          menuLabel={menuLabels.home} 
        />
      );
    }

    if (activeMenu.startsWith('workflow')) {
      const category = workflowCategories.find(c => c.id === activeMenu) || workflowCategories[0];
      return (
        <WorkflowContent 
          categoryName={category?.name || menuLabels.workflow}
          tasks={allTasks[activeMenu] || []}
          isEditMode={isEditMode}
          onSave={(id, updatedTask) => {
            setAllTasks(prev => ({
              ...prev,
              [activeMenu]: prev[activeMenu].map(t => t.id === id ? updatedTask : t).sort((a, b) => a.time.localeCompare(b.time))
            }));
          }}
          onDelete={(id) => {
            setAllTasks(prev => ({ ...prev, [activeMenu]: prev[activeMenu].filter(t => t.id !== id) }));
          }}
          onAdd={(newTask) => {
            const newTaskWithId = { ...newTask, id: Date.now() };
            setAllTasks(prev => ({
              ...prev,
              [activeMenu]: [...(prev[activeMenu] || []), newTaskWithId].sort((a, b) => a.time.localeCompare(b.time))
            }));
          }}
        />
      );
    }

    if (activeMenu === 'integrations') {
      return (
        <ConsumptionContent 
          isEditMode={isEditMode}
          consumptionRecords={consumptionRecords}
          setConsumptionRecords={setConsumptionRecords}
          staffMembers={staffMembers}
          menuLabel={menuLabels.integrations}
        />
      );
    }

    if (activeMenu.startsWith('station')) {
      const category = stationCategories.find(c => c.id === activeMenu);
      return (
        <StationContent 
          areaName={category?.name || menuLabels.station} 
          categoryId={activeMenu}
          stations={stations}
          staffMembers={staffMembers}
          stationAssignments={stationAssignments}
          setStationAssignments={setStationAssignments}
          isEditMode={isEditMode}
        />
      );
    }

    switch(activeMenu) {
      case 'records': 
        return (
          <RecordsContent 
            isEditMode={isEditMode}
            recordTabs={recordTabs} setRecordTabs={setRecordTabs}
            activeTabId={activeTabId} setActiveTabId={setActiveTabId}
            staffMembers={staffMembers}
            recordCounts={recordCounts} setRecordCounts={setRecordCounts}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 w-full">
            <StarLogo className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-bold">請從左側選單選擇一個項目</p>
          </div>
        );
    }
  };

  // 在 Firebase 資料完整載入前顯示讀取畫面
  if (!isAppReady) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#dce0e4] gap-4 transition-opacity">
        <StarLogo className="w-12 h-12 text-gray-500 animate-pulse" />
        <p className="text-gray-500 font-bold tracking-widest text-sm animate-pulse">正在連線至雲端資料庫...</p>
      </div>
    );
  }

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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 text-black rounded-full mb-4 mx-auto"><Key className="w-6 h-6" /></div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">管理員解鎖</h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-bold">請輸入編輯密碼以開啟新增、修改與刪除功能</p>
            <input type="password" value={passwordInput} onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }} onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} className={`w-full px-4 py-3 rounded-xl border ${passwordError ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-center tracking-[0.5em] font-mono text-lg font-bold`} placeholder="••••" maxLength={4} autoFocus />
            {passwordError ? <p className="text-red-500 text-xs text-center mt-2 font-bold">密碼錯誤，請重新輸入</p> : <p className="text-transparent text-xs text-center mt-2 select-none font-bold">.</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowPasswordModal(false); setPasswordInput(''); setPasswordError(false); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">取消</button>
              <button onClick={handlePasswordSubmit} className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">解鎖</button>
            </div>
          </div>
        </div>
      )}

      {/* 呼叫全域設定面板 */}
      {renderGlobalSettings()}

      <div className="fixed inset-0 flex bg-[#dce0e4] p-0 lg:p-6 xl:p-8 overflow-hidden font-sans text-gray-800 lg:gap-4 xl:gap-6">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-16 bg-[#f2f2f6] flex items-center justify-between px-5 z-30 shadow-sm">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
            <div className="relative">
              <StarLogo className={`w-6 h-6 transition-all duration-300 ${isEditMode ? 'text-blue-600 drop-shadow-sm' : 'text-black'}`} />
              {isEditMode && <div className="absolute -top-1 -right-2 bg-blue-100 text-blue-600 rounded-full p-0.5 shadow-sm"><Settings2 className="w-2.5 h-2.5" /></div>}
            </div>
            <span className="font-bold text-lg tracking-wide">Work OS</span>
          </div>
          {/* 手機版：只有在目前分類有子選單時，才顯示呼叫抽屜的按鈕 */}
          {hasSubMenu && (
            <button onClick={() => setIsMobileDrawerOpen(true)} className="p-2 bg-white rounded-full shadow-sm active:scale-95 transition-transform"><Menu className="w-5 h-5 text-black" /></button>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden absolute bottom-0 left-0 w-full h-[80px] bg-white border-t border-gray-100 flex justify-around items-center px-4 z-30 pb-4 shadow-[0_-4px_25px_rgba(0,0,0,0.05)] rounded-t-3xl">
          {mainMenuOrder.map(menuId => {
            const { isActive, Icon, hasNotification } = getMenuProps(menuId);
            return (
              <button key={menuId} onClick={() => handleLeftNavClick(menuId)} className={`relative p-3 rounded-xl transition-all ${isActive ? (menuId === 'station' ? 'bg-black text-white shadow-md' : 'text-black bg-gray-100') : 'text-gray-400 hover:text-black'}`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
                {hasNotification && <span className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full border-2 border-white"></span>}
              </button>
            )
          })}
        </div>

        {/* 1. Desktop Nav (左側工具列) */}
        <nav className="hidden lg:flex w-[72px] bg-[#f2f2f6] rounded-full flex-col items-center pt-8 pb-6 shadow-sm flex-shrink-0 relative justify-between">
          <div className="flex flex-col gap-2 w-full items-center relative z-10 px-2 mt-4">
            {mainMenuOrder.map((menuId, index) => {
              const { isActive, Icon, hasNotification, label } = getMenuProps(menuId);
              return (
                <DraggableWrapper key={menuId} type="mainMenu" index={index} list={mainMenuOrder} setList={setMainMenuOrder} className="w-full flex justify-center relative">
                  <button onClick={() => handleLeftNavClick(menuId)} className={getLeftNavBtnClass(isActive)} title={label}>
                    <div className="relative">
                      <Icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                      {hasNotification && <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full border-2 border-[#f2f2f6]"></span>}
                    </div>
                  </button>
                </DraggableWrapper>
              )
            })}
          </div>
          <div className="flex-1 w-[1.5px] bg-gray-200 my-4 z-0"></div>
          
          <div className="relative cursor-pointer z-10 shrink-0 mb-2 bg-white/50 hover:bg-white p-3 rounded-2xl transition-all shadow-sm" onClick={handleLogoClick} title={isEditMode ? "全域設定" : "解鎖編輯"}>
            <StarLogo className={`w-7 h-7 transition-all duration-300 ${isEditMode ? 'text-blue-600 drop-shadow-md scale-110' : 'text-black hover:scale-110'}`} />
            {isEditMode && <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-600 rounded-full p-1 shadow-sm animate-fade-in"><Settings2 className="w-3.5 h-3.5" /></div>}
          </div>
        </nav>

        {isMobileDrawerOpen && hasSubMenu && (<div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileDrawerOpen(false)}></div>)}

        {/* 2. Menu Sidebar (情境展開側邊欄 Contextual Sidebar) */}
        {hasSubMenu && (
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-[280px] lg:w-[240px] xl:w-[280px] bg-[#f2f2f6] lg:rounded-[2rem] pt-8 px-4 pb-6 shadow-2xl lg:shadow-sm flex-shrink-0 flex flex-col h-full overflow-y-auto no-scrollbar
            transform transition-transform duration-300 ease-in-out ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          `}>
            <div className="flex justify-end mb-4 lg:hidden shrink-0"><button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 bg-gray-200/60 rounded-full text-gray-600 hover:bg-gray-300"><X className="w-4 h-4" /></button></div>

            {/* 側邊欄標題區塊 */}
            <div className="flex items-center gap-3 px-4 mb-6 shrink-0">
               {currentMainCategory === 'workflow' && <Briefcase className="w-6 h-6 text-gray-800" strokeWidth={2} />}
               {currentMainCategory === 'station' && <Map className="w-6 h-6 text-gray-800" strokeWidth={2} />}
               <h2 className="text-xl font-bold text-gray-900">{menuLabels[currentMainCategory]}</h2>
            </div>

            {/* 子分類列表 */}
            <div className="flex flex-col gap-1 shrink-0">
               {currentMainCategory === 'workflow' && workflowCategories.map((category, catIndex) => (
                  <DraggableWrapper key={category.id} type="workflowCat" index={catIndex} list={workflowCategories} setList={setWorkflowCategories} className="w-full">
                    <ContextualMenuItem 
                      item={category} isActive={activeMenu === category.id} isEditMode={isEditMode}
                      onClick={() => handleMenuSelect(category.id)} onSave={(newName) => handleUpdateCategory(category.id, newName)} onDelete={() => handleDeleteCategory(category.id)}
                    />
                  </DraggableWrapper>
               ))}
               
               {currentMainCategory === 'station' && stationCategories.map((category, catIndex) => (
                  <DraggableWrapper key={category.id} type="stationCat" index={catIndex} list={stationCategories} setList={setStationCategories} className="w-full">
                    <ContextualMenuItem 
                      item={category} isActive={activeMenu === category.id} isEditMode={isEditMode}
                      onClick={() => handleMenuSelect(category.id)}
                      onSave={(newName) => { if(newName.trim()) setStationCategories(stationCategories.map(c => c.id === category.id ? { ...c, name: newName } : c)); }}
                      onDelete={() => { setStationCategories(stationCategories.filter(c => c.id !== category.id)); if (activeMenu === category.id) setActiveMenu('home'); }}
                    />
                  </DraggableWrapper>
               ))}

               {/* 新增分類按鈕 */}
               {isEditMode && currentMainCategory === 'workflow' && (
                  isAddingWorkflowCat ? (
                    <div className="relative flex flex-col gap-2 py-3 px-4 animate-fade-in w-full bg-white rounded-2xl shadow-sm mt-2">
                      <input type="text" placeholder="分類名稱..." value={newWorkflowCatName} onChange={(e) => setNewWorkflowCatName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { const newId = 'workflow-' + Date.now(); setWorkflowCategories([...workflowCategories, { id: newId, name: newWorkflowCatName }]); setAllTasks({ ...allTasks, [newId]: [] }); setNewWorkflowCatName(''); setIsAddingWorkflowCat(false); setActiveMenu(newId); } }} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-gray-400 font-bold text-gray-900" autoFocus />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsAddingWorkflowCat(false)} className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md font-bold">取消</button>
                        <button onClick={() => { if(newWorkflowCatName.trim()){ const newId = 'workflow-' + Date.now(); setWorkflowCategories([...workflowCategories, { id: newId, name: newWorkflowCatName }]); setAllTasks({ ...allTasks, [newId]: [] }); setNewWorkflowCatName(''); setIsAddingWorkflowCat(false); setActiveMenu(newId); } }} className="text-xs bg-black text-white px-3 py-1.5 rounded-md font-bold">確認</button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center py-3 group cursor-pointer animate-fade-in w-full hover:bg-white/60 rounded-2xl transition-colors mt-2" onClick={() => setIsAddingWorkflowCat(true)}>
                      <div className="flex items-center gap-2 text-gray-500 font-bold hover:text-black"><PlusSquare className="w-4 h-4" /><span className="text-[14px]">新增分類</span></div>
                    </div>
                  )
               )}

               {isEditMode && currentMainCategory === 'station' && (
                  isAddingStationCat ? (
                    <div className="relative flex flex-col gap-2 py-3 px-4 animate-fade-in w-full bg-white rounded-2xl shadow-sm mt-2">
                      <input type="text" placeholder="區域分類名稱..." value={newStationCatName} onChange={(e) => setNewStationCatName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { const newId = 'station-' + Date.now(); setStationCategories([...stationCategories, { id: newId, name: newStationCatName }]); setNewStationCatName(''); setIsAddingStationCat(false); setActiveMenu(newId); } }} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-gray-400 font-bold text-gray-900" autoFocus />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsAddingStationCat(false)} className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md font-bold">取消</button>
                        <button onClick={() => { if(newStationCatName.trim()){ const newId = 'station-' + Date.now(); setStationCategories([...stationCategories, { id: newId, name: newStationCatName }]); setNewStationCatName(''); setIsAddingStationCat(false); setActiveMenu(newId); } }} className="text-xs bg-black text-white px-3 py-1.5 rounded-md font-bold">確認</button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center py-3 group cursor-pointer animate-fade-in w-full hover:bg-white/60 rounded-2xl transition-colors mt-2" onClick={() => setIsAddingStationCat(true)}>
                      <div className="flex items-center gap-2 text-gray-500 font-bold hover:text-black"><PlusSquare className="w-4 h-4" /><span className="text-[14px]">新增區域</span></div>
                    </div>
                  )
               )}
            </div>
          </aside>
        )}

        {/* 3. 主內容顯示區 */}
        <main className="flex-1 bg-[#f9f9fb] lg:rounded-[2rem] rounded-none p-5 pt-20 pb-[100px] lg:pt-8 lg:pb-8 lg:px-8 xl:px-12 2xl:px-16 shadow-sm overflow-y-auto w-full flex flex-col h-full transition-all duration-300">
          {renderContent()}
        </main>
      </div>
    </>
  );
}

// --- Sub-components ---

// 情境側邊欄內的專屬單行選單組件
const ContextualMenuItem = ({ item, isActive, onClick, onSave, onDelete, isEditMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isEditing && isEditMode) {
    return (
      <div className="relative flex flex-col gap-2 py-3 px-4 animate-fade-in w-full bg-white rounded-2xl shadow-sm border border-gray-200/50">
        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-gray-400 font-bold text-gray-900" autoFocus />
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => { setIsEditing(false); setEditName(item.name); }} className="text-xs text-gray-600 hover:bg-gray-200 bg-gray-100 px-3 py-1.5 rounded-md font-bold">取消</button>
          <button onClick={() => { onSave(editName); setIsEditing(false); }} className="text-xs bg-black text-white px-3 py-1.5 rounded-md shadow-sm font-bold hover:bg-gray-800">儲存</button>
        </div>
      </div>
    );
  }

  if (isDeleting && isEditMode) {
    return (
      <div className="relative flex flex-col gap-2 py-3 px-4 animate-fade-in w-full bg-red-50 rounded-2xl shadow-sm border border-red-100">
        <span className="text-xs text-red-600 font-bold block mb-1">確定刪除分類？</span>
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => setIsDeleting(false)} className="text-xs text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold transition-colors bg-white shadow-sm">取消</button>
          <button onClick={onDelete} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm transition-colors">確認刪除</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all w-full group ${isActive ? 'bg-[#1a1b1e] text-white shadow-lg font-bold' : 'text-gray-600 hover:bg-white/80 font-bold'}`} onClick={onClick}>
      <div className="flex items-center gap-3 truncate">
         <Folder className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
         <span className="text-[15px] truncate">{item.name}</span>
      </div>
      {isEditMode && (
        <div className={`hidden group-hover:flex items-center gap-1 shrink-0 ml-2 animate-fade-in ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1.5 hover:bg-white/20 hover:text-white rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setIsDeleting(true); }} className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  );
};

/* ===================================================================================
   🆕 Consumption Content (物料消耗紀錄系統)
=================================================================================== */

const ConsumptionContent = ({ isEditMode, consumptionRecords, setConsumptionRecords, staffMembers, menuLabel }) => {
  const [activeTab, setActiveTab] = useState('meat');
  const tabs = [
    { id: 'meat', name: '肉品消耗' },
    { id: 'veg', name: '菜葉消耗' }
  ];

  const defaultDate = new Date().toISOString().split('T')[0];
  const defaultTime = new Date().toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    date: defaultDate,
    time: defaultTime,
    staffId: '',
    itemName: '',
    amount: ''
  });

  const [deletingId, setDeletingId] = useState(null);

  const handleAdd = () => {
    if (!formData.staffId || !formData.amount || !formData.date || !formData.itemName) return;
    const newRecord = {
      id: Date.now(),
      type: activeTab,
      ...formData,
      amount: parseFloat(formData.amount)
    };
    setConsumptionRecords([newRecord, ...consumptionRecords]);
    setFormData({ ...formData, amount: '', itemName: '' });
  };

  const handleDelete = (id) => {
    setConsumptionRecords(consumptionRecords.filter(r => r.id !== id));
    setDeletingId(null);
  };

  // 計算數據: 本日、本週、本月、本年
  const getWeekYear = (d) => {
      const date = new Date(d);
      date.setDate(date.getDate() + 4 - (date.getDay()||7));
      return date.getFullYear();
  };
  const getWeekNumber = (d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentWeekYear = getWeekYear(now);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const todayStr = now.toISOString().split('T')[0];

  const records = consumptionRecords.filter(r => r.type === activeTab);

  let dayTotal = 0, weekTotal = 0, monthTotal = 0, yearTotal = 0;

  records.forEach(r => {
    const rDate = new Date(r.date);
    if (r.date === todayStr) dayTotal += r.amount;
    if (getWeekYear(rDate) === currentWeekYear && getWeekNumber(rDate) === currentWeek) weekTotal += r.amount;
    if (rDate.getFullYear() === currentYear && rDate.getMonth() === currentMonth) monthTotal += r.amount;
    if (rDate.getFullYear() === currentYear) yearTotal += r.amount;
  });

  return (
    <div className="animate-fade-in flex flex-col h-full w-full max-w-6xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 shrink-0">{menuLabel}</h2>

      {/* 風琴夾 / Tabs 分頁 */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 overflow-x-auto no-scrollbar shrink-0 pt-2 px-2">
        {tabs.map(tab => (
          <div 
            key={tab.id} onClick={() => setActiveTab(tab.id)} 
            className={`group relative flex items-center gap-2 px-8 py-3.5 rounded-t-2xl cursor-pointer font-bold transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
          >
            <span className="text-[15px]">{tab.name}</span>
          </div>
        ))}
      </div>

      {/* 四大數據卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 shrink-0">
        {[
          { label: '本日消耗', value: dayTotal, icon: <Calendar className="w-5 h-5 text-gray-400" /> },
          { label: '本週消耗', value: weekTotal, icon: <BarChart2 className="w-5 h-5 text-gray-400" /> },
          { label: '本月消耗', value: monthTotal, icon: <ClipboardList className="w-5 h-5 text-gray-400" /> },
          { label: '本年消耗', value: yearTotal, icon: <Archive className="w-5 h-5 text-gray-400" /> }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
             <div className="flex justify-between items-center mb-3">
               <span className="text-xs text-gray-500 font-bold">{stat.label}</span>
               {stat.icon}
             </div>
             <div className="flex items-baseline gap-1">
               <span className="text-3xl font-black text-gray-900">{stat.value.toLocaleString()}</span>
               <span className="text-sm font-bold text-gray-400 mb-1">份</span>
             </div>
          </div>
        ))}
      </div>

      {/* 新增消耗紀錄表單 */}
      <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 mb-6 shrink-0">
        <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
          <PlusSquare className="w-4 h-4" /> 新增消耗紀錄
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-700 mb-2">日期</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-black text-gray-900" style={{colorScheme:'light'}}/>
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-gray-700 mb-2">時間</label>
            <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-black text-gray-900" style={{colorScheme:'light'}}/>
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-gray-700 mb-2">登記人</label>
            <select value={formData.staffId} onChange={(e) => setFormData({...formData, staffId: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-black text-gray-900 cursor-pointer appearance-none">
              <option value="" disabled>選擇人員...</option>
              {staffMembers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
            </select>
          </div>

          <div className="w-full md:col-span-2 flex gap-3">
             <div className="flex-1">
               <label className="block text-xs font-bold text-gray-700 mb-2">消耗品項 / 備註</label>
               <input type="text" placeholder="例如：五花肉..." value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-black text-gray-900"/>
             </div>
             <div className="w-24">
               <label className="block text-xs font-bold text-gray-700 mb-2">數量</label>
               <input type="number" min="0" step="0.5" placeholder="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-black text-gray-900"/>
             </div>
             <button onClick={handleAdd} disabled={!formData.staffId || !formData.amount || !formData.itemName} className={`w-16 h-[42px] mt-[26px] flex items-center justify-center rounded-xl transition-all shadow-sm ${(!formData.staffId || !formData.amount || !formData.itemName) ? 'bg-gray-200 text-gray-400' : 'bg-black text-white hover:bg-gray-800 active:scale-95'}`}>
               <Plus className="w-5 h-5" />
             </button>
          </div>

        </div>
      </div>

      {/* 歷史紀錄表 */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-x-auto w-full flex-1">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <th className="p-4 md:p-5 font-bold whitespace-nowrap">日期</th>
              <th className="p-4 md:p-5 font-bold whitespace-nowrap">時間</th>
              <th className="p-4 md:p-5 font-bold whitespace-nowrap">登記人</th>
              <th className="p-4 md:p-5 font-bold w-full">消耗品項</th>
              <th className="p-4 md:p-5 font-bold text-right whitespace-nowrap">數量 (份)</th>
              {isEditMode && <th className="p-4 md:p-5 font-bold text-center whitespace-nowrap">操作</th>}
            </tr>
          </thead>
          <tbody className="text-sm">
            {records.map((row) => {
              const staff = staffMembers.find(s => s.id === row.staffId);
              return (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 md:p-5 text-gray-600 font-bold whitespace-nowrap">{row.date}</td>
                  <td className="p-4 md:p-5 text-gray-500 font-bold whitespace-nowrap">{row.time}</td>
                  <td className="p-4 md:p-5 font-bold text-gray-900 whitespace-nowrap">
                    {staff ? <span className="bg-gray-100 px-3 py-1.5 rounded-lg">{staff.name}</span> : <span className="text-gray-400">已刪除人員</span>}
                  </td>
                  <td className="p-4 md:p-5 text-gray-700 font-bold">{row.itemName}</td>
                  <td className="p-4 md:p-5 font-black text-right text-gray-900 text-lg">{row.amount}</td>
                  
                  {isEditMode && (
                    <td className="p-4 md:p-5 text-center whitespace-nowrap">
                      {deletingId === row.id ? (
                        <div className="flex items-center gap-2 justify-center animate-fade-in bg-white p-1 rounded-lg shadow-sm border border-red-100">
                          <button onClick={() => handleDelete(row.id)} className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md hover:bg-red-600">確認</button>
                          <button onClick={() => setDeletingId(null)} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md hover:bg-gray-200">取消</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(row.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
            {records.length === 0 && (
              <tr><td colSpan={isEditMode ? 6 : 5} className="p-8 text-center text-gray-400 font-bold">目前沒有任何消耗紀錄</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* ===================================================================================
   Workflow Content (工作流程管理)
=================================================================================== */

const TimelineEditForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || { time: '09:00', title: '', content: '' });
  return (
    <div className="relative pl-8 md:pl-12 mb-8 group animate-fade-in">
      <div className="absolute -left-[9px] top-1.5 w-5 h-5 bg-black rounded-full border-4 border-white shadow-sm animate-pulse z-10"></div>
      <div className="bg-gray-50 rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm">
         <div className="flex flex-col gap-4">
           <div className="flex flex-col md:flex-row gap-3 md:items-center">
             <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} style={{ colorScheme: 'light' }} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm md:w-32 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all font-bold text-gray-900" />
             <input type="text" placeholder="輸入工作標題..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex-1 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all font-bold text-gray-900" />
           </div>
           <textarea placeholder="詳細工作內容與注意事項說明..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm w-full h-28 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all resize-none text-gray-800 font-bold leading-relaxed"></textarea>
           <div className="flex justify-end gap-3 mt-1">
             <button onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200/50 bg-gray-50">取消</button>
             <button onClick={() => onSave(formData)} className="px-5 py-2.5 text-sm font-bold bg-black text-white hover:bg-gray-800 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 儲存流程</button>
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
    return <TimelineEditForm initialData={task} onSave={(updatedData) => { onSave(task.id, updatedData); setIsEditing(false); }} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="relative pl-8 md:pl-12 mb-8 group animate-fade-in">
      <div className="absolute -left-[9px] top-1.5 w-5 h-5 bg-black rounded-full border-4 border-white shadow-sm group-hover:scale-125 transition-transform duration-300 z-10"></div>
      <div className="bg-[#f8f9fa] rounded-3xl p-5 md:p-6 border border-transparent hover:border-gray-200 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-gray-200 text-gray-900 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm"><Clock className="w-4 h-4" /> {task.time}</span>
              <h3 className="text-lg md:text-xl font-bold text-gray-900">{task.title}</h3>
            </div>
            {isEditMode && (
              <div className="flex items-center gap-2 self-end sm:self-auto animate-fade-in relative min-h-[36px]">
                {confirmDelete ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-red-100 p-1.5 rounded-xl shadow-md z-20 whitespace-nowrap">
                    <span className="text-xs text-red-600 font-bold ml-2">確定刪除？</span>
                    <button onClick={() => setConfirmDelete(false)} className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">取消</button>
                    <button onClick={() => onDelete(task.id)} className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">確認刪除</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete(true)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            )}
         </div>
         <p className="text-gray-700 text-[15px] font-bold leading-relaxed mt-2">{task.content}</p>
      </div>
    </div>
  );
};

const WorkflowContent = ({ categoryName, tasks, onSave, onDelete, onAdd, isEditMode }) => {
  const [isAdding, setIsAdding] = useState(false);
  return (
    <div className="animate-fade-in flex flex-col h-full w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{categoryName}</h2>
        {isEditMode && (
          <button 
            onClick={() => setIsAdding(true)} disabled={isAdding}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 w-full sm:w-auto animate-fade-in
              ${isAdding ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 active:scale-95'}`}
          ><PlusSquare className="w-4 h-4" /> 新增流程節點</button>
        )}
      </div>

      <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 flex-1 overflow-y-auto">
        {tasks.length === 0 && (!isAdding || !isEditMode) ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
             <ClipboardList className="w-16 h-16 opacity-20" />
             <p className="font-bold">{isEditMode ? '目前沒有任何工作流程，點擊上方按鈕新增。' : '目前沒有任何工作流程資料。'}</p>
          </div>
        ) : (
          <div className="relative border-l-[3px] border-gray-100 ml-3 md:ml-6 mt-4 pb-12">
            {tasks.map(task => <TimelineItem key={task.id} task={task} onSave={onSave} onDelete={onDelete} isEditMode={isEditMode} />)}
            {isAdding && isEditMode && <TimelineEditForm onSave={(newTask) => { onAdd(newTask); setIsAdding(false); }} onCancel={() => setIsAdding(false)} />}
            {(!isAdding || !isEditMode) && (<div className="absolute -left-[7px] bottom-0 w-3 h-3 bg-gray-300 rounded-full"></div>)}
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================================================================================
   RecordsContent：風琴夾 Tabs 工作紀錄與無表單純淨介面
=================================================================================== */

const RecordsContent = ({ isEditMode, recordTabs, setRecordTabs, activeTabId, setActiveTabId, staffMembers, recordCounts, setRecordCounts }) => {
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [deletingTabId, setDeletingTabId] = useState(null); 

  const updateCount = (staffId, change) => {
    setRecordCounts(prev => {
      const currentCount = prev[activeTabId]?.[staffId] || 0;
      const newCount = Math.max(0, currentCount + change);
      return { ...prev, [activeTabId]: { ...(prev[activeTabId] || {}), [staffId]: newCount } };
    });
  };

  const handleAddTab = () => {
    if (!newTabName.trim()) return;
    const newId = 't' + Date.now();
    setRecordTabs([...recordTabs, { id: newId, name: newTabName.trim() }]);
    setRecordCounts(prev => ({ ...prev, [newId]: {} }));
    setActiveTabId(newId);
    setNewTabName('');
    setIsAddingTab(false);
  };

  const handleDeleteTab = (id) => {
    const updatedTabs = recordTabs.filter(t => t.id !== id);
    setRecordTabs(updatedTabs);
    if (activeTabId === id && updatedTabs.length > 0) setActiveTabId(updatedTabs[0].id);
  };

  return (
    <div className="animate-fade-in flex flex-col h-full w-full max-w-5xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 shrink-0">工作紀錄</h2>

      {/* 風琴夾 / Tabs 分類標籤區 */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 overflow-x-auto no-scrollbar shrink-0 pt-2 px-2">
        {recordTabs.map(tab => (
          <div key={tab.id} onClick={() => setActiveTabId(tab.id)} className={`group relative flex items-center gap-2 px-6 py-3.5 rounded-t-2xl cursor-pointer font-bold transition-all ${activeTabId === tab.id ? 'bg-white text-black shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}>
            <span className="text-[15px]">{tab.name}</span>
            {isEditMode && recordTabs.length > 1 && (
              deletingTabId === tab.id ? (
                <div className="flex items-center gap-1 ml-2 animate-fade-in bg-white p-1 rounded-lg shadow-sm border border-red-100 absolute right-1 z-20">
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteTab(tab.id); setDeletingTabId(null); }} className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md hover:bg-red-600 shadow-sm">確認刪除</button>
                  <button onClick={(e) => { e.stopPropagation(); setDeletingTabId(null); }} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md hover:bg-gray-200">取消</button>
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setDeletingTabId(tab.id); }} className="ml-2 text-gray-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
              )
            )}
          </div>
        ))}
        {isEditMode && (
          isAddingTab ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-t-2xl shadow-[0_-4px_15px_rgba(0,0,0,0.03)] animate-fade-in z-10">
              <input type="text" autoFocus placeholder="分類名稱..." value={newTabName} onChange={(e) => setNewTabName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTab()} className="border-b border-gray-300 w-24 outline-none text-sm font-bold text-gray-900 pb-1" />
              <button onClick={handleAddTab} className="text-black bg-gray-100 p-1 rounded-md hover:bg-gray-200"><CheckCircle2 className="w-4 h-4"/></button>
              <button onClick={() => setIsAddingTab(false)} className="text-gray-400 bg-gray-100 p-1 rounded-md hover:bg-gray-200"><X className="w-4 h-4"/></button>
            </div>
          ) : (
            <div onClick={() => setIsAddingTab(true)} className="flex items-center gap-2 px-5 py-3.5 text-gray-400 cursor-pointer hover:text-black hover:bg-white rounded-t-2xl transition-colors font-bold text-sm"><PlusSquare className="w-4 h-4"/> <span>新增分類</span></div>
          )
        )}
      </div>

      {/* 工作人員計數卡片列表區塊 */}
      <div className="flex flex-col gap-4 overflow-y-auto pb-10 pt-2 px-1 relative">
        {staffMembers.map(staff => {
          const currentCount = recordCounts[activeTabId]?.[staff.id] || 0;
          return (
            <div key={staff.id} className="bg-white rounded-[1.5rem] p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:border-gray-200 transition-colors animate-fade-in group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50 text-gray-400 shrink-0 shadow-sm"><User className="w-6 h-6" /></div>
                  <div className="flex flex-col items-start gap-1.5">
                     <span className="font-bold text-gray-900 text-lg leading-none">{staff.name}</span>
                     <span className={`text-[10px] text-white font-bold px-2.5 py-0.5 rounded-md leading-none shadow-sm ${staff.role === '店長' ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>{staff.role}</span>
                  </div>
               </div>
               <div className="flex items-center gap-5 md:gap-8 relative min-h-[40px]">
                  <div className="flex flex-col items-center justify-center hidden sm:flex">
                     <span className="text-[11px] text-gray-500 font-bold mb-1 tracking-wide">完成次數</span>
                     <span className="text-2xl font-black text-black leading-none">{currentCount}</span>
                  </div>
                  <div className="flex items-center bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm">
                     <button onClick={() => updateCount(staff.id, -1)} className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-black font-black text-xl leading-none transition-colors active:scale-95"><Minus className="w-4 h-4"/></button>
                     <span className="font-black text-black w-10 text-center text-lg">{currentCount}</span>
                     <button onClick={() => updateCount(staff.id, 1)} className="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-lg text-black hover:bg-gray-200 hover:text-black font-black text-xl leading-none transition-colors active:scale-95"><Plus className="w-4 h-4"/></button>
                  </div>
               </div>
            </div>
          );
        })}
        {staffMembers.length === 0 && (
          <div className="text-center py-10 text-gray-400 font-bold flex flex-col items-center gap-3">
             <Users className="w-12 h-12 opacity-20" />
             {isEditMode ? '尚未設定工作人員，請點擊左下角星號 Logo 進入全域設定新增' : '目前沒有工作人員資料'}
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================================================================================
   StationContent (崗位區域安排 - 卡片與下拉指派人員)
=================================================================================== */

const StationContent = ({ areaName, categoryId, stations, stationAssignments, setStationAssignments, staffMembers, isEditMode }) => {
  const cards = stations.filter(s => s.categoryId === categoryId);

  const assignStaffToStation = (stationId, staffId) => {
    if(!staffId) return;
    setStationAssignments(prev => {
      const current = prev[stationId] || [];
      if(current.includes(staffId)) return prev;
      return { ...prev, [stationId]: [...current, staffId] };
    });
  };

  const removeStaffFromStation = (stationId, staffId) => {
    setStationAssignments(prev => {
      const current = prev[stationId] || [];
      return { ...prev, [stationId]: current.filter(id => id !== staffId) };
    });
  };

  return (
    <div className="animate-fade-in h-full flex flex-col w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{areaName}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-10">
        {cards.map(station => {
          const assignedStaffIds = stationAssignments[station.id] || [];
          return (
            <div key={station.id} className="bg-white rounded-[1.5rem] md:rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col h-full group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none z-0"><Map className="w-32 h-32 md:w-40 md:h-40" /></div>
              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6 shrink-0">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">{station.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 font-bold">目前排班: {assignedStaffIds.length} 人</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${assignedStaffIds.length > 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {assignedStaffIds.length > 0 ? '運作中' : '需支援'}
                  </span>
                </div>
                
                <div className="space-y-3 md:space-y-4 flex-1 overflow-y-auto pr-1">
                  {assignedStaffIds.map((staffId, idx) => {
                    const staff = staffMembers.find(s => s.id === staffId);
                    if(!staff) return null;
                    const colors = ['bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-teal-100 text-teal-700'];
                    const colorClass = colors[idx % colors.length];
                    return (
                      <div key={staff.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-lg shadow-sm ${colorClass}`}>
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm md:text-base font-bold text-gray-900">{staff.name}</p>
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5 flex items-center gap-1 font-bold"><Clock className="w-3 h-3"/> {staff.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                          {/* 只有在解鎖模式下才能移除指派人員 */}
                          {isEditMode && (
                            <button onClick={() => removeStaffFromStation(station.id, staff.id)} className="text-gray-400 hover:text-red-500 transition-colors bg-white p-1.5 rounded-lg shadow-sm border border-gray-200">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 下拉式選單選擇人員：僅在解鎖模式顯示 */}
                {isEditMode && (
                  <div className="mt-5 shrink-0">
                    <select
                      className="w-full py-3.5 px-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-600 text-sm md:text-base font-bold hover:border-black hover:text-black hover:bg-gray-50 transition-all outline-none appearance-none cursor-pointer text-center bg-transparent"
                      value=""
                      onChange={(e) => assignStaffToStation(station.id, e.target.value)}
                    >
                      <option value="" disabled>+ 分配人員至此崗位</option>
                      {staffMembers.filter(s => !assignedStaffIds.includes(s.id)).map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {cards.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-400 gap-4 py-20">
             <LayoutGrid className="w-16 h-16 opacity-20" />
             <p className="font-bold">此區域目前沒有崗位卡片，請點擊左下角星號 Logo 進入全域設定新增。</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ===================================================================================
   🆕 Home Content (首頁 - 公告系統)
=================================================================================== */

const HomeContent = ({ announcements, setAnnouncements, isEditMode, menuLabel }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    const newAnn = {
      id: editingId || 'a' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: formData.title,
      content: formData.content
    };

    if (editingId) {
      setAnnouncements(announcements.map(a => a.id === editingId ? newAnn : a));
      setEditingId(null);
    } else {
      setAnnouncements([newAnn, ...announcements]);
      setIsAdding(false);
    }
  };

  const handleDelete = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const openEdit = (ann) => {
    setEditingId(ann.id);
    setFormData({ title: ann.title, content: ann.content });
    setIsAdding(false);
  };

  const openAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  const latestAnn = announcements[0];
  const oldAnns = announcements.slice(1);

  return (
    <div className="animate-fade-in flex flex-col h-full w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
         <h2 className="text-xl md:text-2xl font-bold text-gray-900">{menuLabel}</h2>
         {isEditMode && !isAdding && !editingId && (
           <button onClick={openAdd} className="bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md text-sm flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95">
             <PlusSquare className="w-4 h-4" /> 新增公告
           </button>
         )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-10 flex flex-col gap-6">
        {/* 新增 / 編輯公告表單 */}
        {(isAdding || editingId) && isEditMode && (
           <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-200 animate-fade-in">
             <h3 className="font-bold text-gray-800 mb-4 text-lg">{editingId ? '編輯公告' : '新增公告'}</h3>
             <input type="text" placeholder="輸入公告標題..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-black mb-4 transition-colors" />
             <textarea placeholder="輸入詳細公告內容..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-black min-h-[160px] resize-none mb-6 transition-colors leading-relaxed" />
             <div className="flex justify-end gap-3">
               <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm shadow-sm">取消</button>
               <button onClick={handleSave} className="px-6 py-2.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {editingId ? '儲存修改' : '發布公告'}</button>
             </div>
           </div>
        )}

        {/* 最新公告 (大卡片) */}
        {!isAdding && !editingId && latestAnn && (
           <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 relative group animate-fade-in">
             <div className="flex items-center gap-3 mb-5">
               <span className="bg-red-50 border border-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-black tracking-wider flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> 最新消息</span>
               <span className="text-gray-400 text-sm font-bold">{latestAnn.date}</span>
             </div>
             <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">{latestAnn.title}</h3>
             <p className="text-gray-700 font-bold leading-relaxed whitespace-pre-wrap text-[15px]">{latestAnn.content}</p>
             
             {isEditMode && (
               <div className="absolute top-6 right-6 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                 <button onClick={() => openEdit(latestAnn)} className="p-2 bg-gray-100 text-gray-500 hover:text-black rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                 <button onClick={() => handleDelete(latestAnn.id)} className="p-2 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
               </div>
             )}
           </div>
        )}

        {/* 歷史公告 (手風琴列表) */}
        {!isAdding && !editingId && oldAnns.length > 0 && (
           <div className="mt-2 animate-fade-in">
             <h4 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2"><Archive className="w-4 h-4" /> 歷史公告</h4>
             <div className="flex flex-col gap-3">
               {oldAnns.map(ann => (
                 <div key={ann.id} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden relative group transition-all duration-300">
                   <div 
                     className={`p-5 flex justify-between items-center cursor-pointer transition-colors ${expandedId === ann.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                     onClick={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                   >
                     <div className="flex items-center gap-3 md:gap-5 flex-1 pr-4">
                       <span className="text-gray-400 text-sm font-bold shrink-0">{ann.date}</span>
                       <h4 className="text-gray-800 font-bold text-[15px] md:text-lg truncate">{ann.title}</h4>
                     </div>
                     <div className="flex items-center gap-3 shrink-0">
                       {isEditMode && (
                         <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity mr-2">
                           <button onClick={(e) => { e.stopPropagation(); openEdit(ann); }} className="p-1.5 bg-gray-100 text-gray-500 hover:text-black rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(ann.id); }} className="p-1.5 bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                         </div>
                       )}
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expandedId === ann.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                         <span className="font-bold text-lg leading-none mt-[-2px]">{expandedId === ann.id ? '-' : '+'}</span>
                       </div>
                     </div>
                   </div>
                   {expandedId === ann.id && (
                     <div className="px-5 md:px-[6.5rem] pb-6 pt-2 bg-gray-50 animate-fade-in border-t border-gray-100/50">
                       <p className="text-gray-600 font-bold leading-relaxed whitespace-pre-wrap text-sm md:text-[15px]">{ann.content}</p>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* 無公告空狀態 */}
        {!isAdding && !editingId && announcements.length === 0 && (
           <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center gap-4 h-[300px] animate-fade-in">
             <MessageSquare className="w-16 h-16 opacity-20" />
             <p className="text-gray-500 font-bold">{isEditMode ? '目前沒有任何公告，點擊右上角新增公告。' : '目前沒有任何最新公告'}</p>
           </div>
        )}
      </div>
    </div>
  );
}

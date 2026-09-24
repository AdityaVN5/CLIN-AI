import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Settings, 
  Sun, 
  Moon, 
  Download, 
  Sparkles,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  Pin,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { Consultation } from '../types/clinical';

interface SidebarProps {
  consultations: Consultation[];
  currentConsultationId: string | null;
  onSelectConsultation: (id: string) => void;
  onNewConsultation: () => void;
  onDeleteConsultation: (id: string) => void;
  onRenameConsultation?: (id: string, newTitle: string) => void;
  onTogglePin?: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  doctorName: string;
  specialty: string;
  activeView: 'chat' | 'dashboard';
  onOpenDashboard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  consultations,
  currentConsultationId,
  onSelectConsultation,
  onNewConsultation,
  onDeleteConsultation,
  onRenameConsultation,
  onTogglePin,
  isDark,
  onToggleTheme,
  onOpenSettings,
  isOpen,
  onToggleSidebar,
  doctorName,
  specialty,
  activeView,
  onOpenDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Close three dots menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.encounter-menu-container')) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenuId]);

  const filteredConsultations = consultations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patient.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pinned encounters appear at top
  const sortedConsultations = [...filteredConsultations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim() && onRenameConsultation) {
      onRenameConsultation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onToggleSidebar}
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 flex flex-col w-[260px] shrink-0
        ${isDark ? 'bg-[#171717] border-neutral-800 text-[#ececec]' : 'bg-[#fbfbfb] border-neutral-200/80 text-[#0d0d0d]'}
        border-r transition-all duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:border-r-0'}
      `}>
        {/* Top Header */}
        <div className="p-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 px-1">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
              <Stethoscope className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-bold text-sm tracking-tight">Clin AT</span>
          </div>
          <button
            onClick={onToggleSidebar}
            title="Collapse sidebar"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-200 text-neutral-600 hover:text-black'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Note & Dashboard Action Buttons */}
        <div className="px-3 pt-2 pb-1 space-y-1.5">
          <button
            onClick={onNewConsultation}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeView === 'chat' && !currentConsultationId
                ? isDark 
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs' 
                  : 'bg-neutral-900 text-white font-semibold shadow-xs'
                : isDark 
                  ? 'bg-neutral-800/80 hover:bg-neutral-800 text-white border border-neutral-700/60' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200/90 shadow-2xs hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New consultation</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono">⌘N</span>
          </button>

          {/* Dashboard Button */}
          <button
            onClick={onOpenDashboard}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeView === 'dashboard'
                ? isDark 
                  ? 'bg-white text-black font-bold shadow-xs' 
                  : 'bg-black text-white font-bold shadow-xs'
                : isDark 
                  ? 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 border border-neutral-800' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 shadow-2xs hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              activeView === 'dashboard'
                ? isDark ? 'bg-black text-white' : 'bg-white text-black'
                : isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {consultations.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-1">
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
            isDark ? 'bg-neutral-900 border border-neutral-800 text-neutral-300' : 'bg-white border border-neutral-200/90 text-neutral-800'
          }`}>
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              placeholder="Search patients or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent focus:outline-none placeholder:text-neutral-500 text-xs"
            />
          </div>
        </div>

        {/* Consultations List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-neutral-500">
            Recent Encounters
          </div>

          {sortedConsultations.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-neutral-500">
              No consultations found
            </div>
          ) : (
            sortedConsultations.map((item) => {
              const isSelected = activeView === 'chat' && item.id === currentConsultationId;
              const isMenuOpen = activeMenuId === item.id;
              const isEditingThis = editingId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectConsultation(item.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected 
                      ? isDark 
                        ? 'bg-neutral-800 text-white font-semibold' 
                        : 'bg-neutral-200/80 text-black font-semibold shadow-2xs'
                      : isDark ? 'hover:bg-neutral-800/50 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {isEditingThis ? (
                    <div className="flex flex-col gap-1 w-full py-0.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveRename(item.id);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                          autoFocus
                          placeholder="Encounter title..."
                          className={`flex-1 min-w-0 px-2 py-1 text-xs rounded border outline-none font-normal ${
                            isDark ? 'bg-neutral-900 border-neutral-600 text-white focus:border-white' : 'bg-white border-neutral-300 text-black focus:border-black'
                          }`}
                        />
                        <button
                          onClick={() => handleSaveRename(item.id)}
                          className="p-1 hover:text-emerald-500 text-neutral-400 transition-colors shrink-0"
                          title="Save title"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 hover:text-neutral-500 text-neutral-400 transition-colors shrink-0"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 px-0.5">
                        <span className="truncate">Patient: <strong className="font-medium text-neutral-600 dark:text-neutral-300">{item.patient.name}</strong></span>
                        <span className="text-[9px] text-neutral-400 italic shrink-0">(name locked)</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          {item.isPinned && (
                            <Pin className="w-3 h-3 text-neutral-400 dark:text-neutral-300 shrink-0 fill-current" />
                          )}
                          <p className="truncate text-xs font-medium">{item.title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
                          <span className="font-normal truncate">{item.patient.name}</span>
                        </div>
                      </div>

                      {/* Three Dots Button (Hover Only) */}
                      <div className="relative encounter-menu-container" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : item.id);
                          }}
                          title="Encounter options"
                          className={`p-1 rounded-md transition-all ${
                            isMenuOpen
                              ? 'opacity-100 bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white'
                              : 'opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/80 dark:hover:bg-neutral-700'
                          }`}
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div 
                            className={`absolute right-0 top-full mt-1 w-36 rounded-xl shadow-xl border p-1 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                              isDark ? 'bg-[#212121] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-black'
                            }`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onTogglePin) onTogglePin(item.id);
                                setActiveMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                isDark ? 'hover:bg-neutral-800 text-neutral-200 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black'
                              }`}
                            >
                              <Pin className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{item.isPinned ? 'Unpin' : 'Pin'}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(item.id);
                                setEditingTitle(item.title);
                                setActiveMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                isDark ? 'hover:bg-neutral-800 text-neutral-200 hover:text-white' : 'hover:bg-neutral-100 text-neutral-700 hover:text-black'
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Rename</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConsultation(item.id);
                                setActiveMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                isDark ? 'hover:bg-red-950/40 text-red-400' : 'hover:bg-red-50 text-red-600'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom User Bar */}
        <div className={`p-2 border-t ${isDark ? 'border-neutral-800' : 'border-neutral-200/80'}`}>
          <div className="flex items-center justify-between p-1.5 rounded-lg">
            <div 
              onClick={onOpenSettings}
              className={`flex items-center gap-2 cursor-pointer flex-1 min-w-0 p-1 rounded-md transition-colors ${
                isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                isDark ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-black'
              }`}>
                AM
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate">{doctorName}</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-medium">{specialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleTheme}
                title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
                className={`p-1.5 rounded-md transition-colors ${
                  isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-200 text-neutral-600 hover:text-black'
                }`}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onOpenSettings}
                title="Settings"
                className={`p-1.5 rounded-md transition-colors ${
                  isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-neutral-200 text-neutral-600 hover:text-black'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

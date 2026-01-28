import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TreeView } from './components/TreeView';
import { Editor } from './components/Editor';
import { Chat } from './components/Chat';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { useStore } from './store';
import { Settings as SettingsIcon, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Moon, Sun, LogOut } from 'lucide-react';

import { ModalManager } from './components/ModalManager';
import { translations } from './i18n/translations';
import { useSwipeable } from 'react-swipeable';

// Wake Lock Hook
const useWakeLock = () => {
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          // console.log('Wake Lock is active');
        }
      } catch (err: any) {
        console.warn(`Wake Lock request failed: ${err.name}, ${err.message}`);
      }
    };

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release()
          .then(() => {
            wakeLock = null;
            console.log('Wake Lock released');
          });
      }
    };
  }, []);
};

function App() {
  useWakeLock();
  const { isAuthenticated, isCheckingAuth, user, checkAuth, logout, fetchTree, fetchGlobalSettings, toggleSettings, language, selectedNoteTitle, darkMode, setDarkMode } = useStore();
  const t = translations[language];
  // Mobile Check helper
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [showExplorer, setShowExplorer] = useState(true);
  const [showChat, setShowChat] = useState(!isMobile);

  // Sync Document Title ONLY for Print/PDF (Ctrl+P)
  useEffect(() => {
    const handleBeforePrint = () => {
      document.title = selectedNoteTitle || 'Licium';
    };
    const handleAfterPrint = () => {
      document.title = 'Licium';
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [selectedNoteTitle]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTree();
      fetchGlobalSettings();
    }
  }, [isAuthenticated, fetchTree, fetchGlobalSettings]);

  // Refetch tree on window focus (visibility change) for multi-device sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        fetchTree();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isAuthenticated, fetchTree]);

  // Dark Mode & PWA Theme Color
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // localStorage is handled in store

    // Manage PWA Status Bar & Theme Color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!themeColorMeta) {
      themeColorMeta = document.querySelector('meta[name="theme-color"]');
    }

    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }

    if (themeColorMeta.hasAttribute('media')) {
      themeColorMeta.removeAttribute('media');
    }

    if (darkMode) {
      themeColorMeta.setAttribute('content', '#1f2937'); // gray-800
    } else {
      themeColorMeta.setAttribute('content', '#ffffff'); // white
    }
  }, [darkMode]);

  // Swipe Handlers for Mobile Navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isMobile) return;
      // Moving Right (Explorer -> Editor -> Chat)
      if (showExplorer) {
        setShowExplorer(false);
      } else if (!showChat) {
        setShowChat(true);
      }
    },
    onSwipedRight: () => {
      if (!isMobile) return;
      // Moving Left (Chat -> Editor -> Explorer)
      if (showChat) {
        setShowChat(false);
      } else if (!showExplorer) {
        setShowExplorer(true);
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: false
  });

  const toggleExplorer = () => {
    if (isMobile && !showExplorer) setShowChat(false);
    setShowExplorer(!showExplorer);
  };

  const toggleChat = () => {
    if (isMobile && !showChat) setShowExplorer(false);
    setShowChat(!showChat);
  };

  if (isCheckingAuth) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">{t.general.loading}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div {...swipeHandlers} className="flex flex-col h-full w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans text-sm sm:text-base overflow-hidden">
      <ModalManager />
      {/* Header - Includes Safe Area Top */}
      <header className="shrink-0 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm z-10 pt-[env(safe-area-inset-top)] print:hidden">
        <div className="h-10 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleExplorer}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${showExplorer ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : ''}`}
              title={showExplorer ? t.general.hideExplorer : t.general.showExplorer}
            >
              {showExplorer ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <button
              onClick={() => {
                if (isMobile) {
                  setShowExplorer(false);
                  setShowChat(false);
                }
              }}
              className={`flex items-center gap-2 font-bold text-lg text-blue-600 dark:text-blue-400 truncate ${isMobile ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              <img src="/icon_32x32@2x.png" alt="Licium" className="w-5 h-5 shrink-0 rounded-sm" />
              <span className="hidden sm:inline">Licium</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isMobile && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                @{user?.username}
              </span>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={darkMode ? t.general.lightMode : t.general.darkMode}
            >
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
            <button
              onClick={toggleChat}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${showChat ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : ''}`}
              title={showChat ? t.general.hideChat : t.general.showChat}
            >
              {showChat ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>
            <button onClick={toggleSettings} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" title={t.settings.title}>
              <SettingsIcon size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
              title={t.general.logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden relative">
        {isMobile ? (
          // Mobile Layout: Full Screen Overlays
          <>
            {/* Editor (Always "open" in background) */}
            <div className="absolute inset-0 z-0">
              <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                <Editor />
              </div>
            </div>

            {/* Left Sidebar Overlay */}
            {showExplorer && (
              <div className="absolute inset-0 z-20 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-xl flex flex-col print:hidden">
                <TreeView onNodeSelect={() => isMobile && setShowExplorer(false)} isMobile={isMobile} />
              </div>
            )}

            {/* Right Sidebar Overlay */}
            {showChat && (
              <div className="absolute inset-0 z-20 bg-white dark:bg-gray-900 flex flex-col shadow-xl print:hidden">
                <Chat />
              </div>
            )}
          </>
        ) : (
          // Desktop Layout: Resizable Panels
          <PanelGroup direction="horizontal">
            {/* Left Sidebar: Explorer */}
            {showExplorer && (
              <>
                <Panel defaultSize={20} minSize={15} maxSize={40} className="print:hidden">
                  <div className="h-full border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
                    <TreeView onNodeSelect={() => isMobile && setShowExplorer(false)} isMobile={isMobile} />
                  </div>
                </Panel>
                <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors cursor-col-resize print:hidden" />
              </>
            )}

            {/* Center: Editor */}
            <Panel minSize={30}>
              <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                <Editor />
              </div>
            </Panel>

            {/* Right Sidebar: Chat */}
            {showChat && (
              <>
                <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors cursor-col-resize print:hidden" />
                <Panel defaultSize={25} minSize={20} maxSize={50} className="print:hidden">
                  <div className="h-full bg-white dark:bg-gray-900 flex flex-col shadow-lg">
                    <Chat />
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        )}
      </div>

      <Settings />
    </div>
  );
}

export default App;

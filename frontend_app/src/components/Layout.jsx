import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { 
  Sun, 
  Moon, 
  Search, 
  Bell, 
  Check, 
  Sparkles, 
  Target, 
  Plane, 
  Truck, 
  Calendar, 
  Cpu,
  X,
  Menu,
  Clock
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { AutomationControlCenter } from './AutomationControlCenter';

export const Layout = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Automation Control Center State
  const [isAutomationCenterOpen, setIsAutomationCenterOpen] = useState(false);

  // Notification Center State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New High-Value Lead Captured',
      description: 'Sheikh Rashid enquired for 85ft Mega Yacht Charter this Saturday.',
      time: '5 mins ago',
      type: 'lead',
      unread: true,
      link: '/leads'
    },
    {
      id: 2,
      title: 'Driver Dispatched to Airport',
      description: 'Driver Tariq is en route for VIP Transfer #BK-1002 (Terminal 3).',
      time: '24 mins ago',
      type: 'dispatch',
      unread: true,
      link: '/operations'
    },
    {
      id: 3,
      title: 'AI Scheduled Social Post',
      description: 'Sunset Safari Reel scheduled for tomorrow 10:00 AM on Instagram.',
      time: '1 hour ago',
      type: 'marketing',
      unread: false,
      link: '/calendar'
    }
  ]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Global Ctrl + K / Cmd + K Shortcut Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const navItems = [
    { to: '/', label: 'Dashboard', roles: ['Admin', 'Sales'] },
    { to: '/leads', label: 'Leads', roles: ['Admin', 'Sales'] },
    { to: '/customers', label: 'Customers', roles: ['Admin', 'Sales'] },
    { to: '/bookings', label: 'Bookings', roles: ['Admin', 'Sales'] },
    { to: '/operations', label: 'Operations', roles: ['Admin', 'Sales'] },
    { to: '/payments', label: 'Payments', roles: ['Admin'] },
    { to: '/marketing', label: 'Ads Command Center', roles: ['Admin'] },
    { to: '/campaigns/new', label: 'Campaign Builder', roles: ['Admin'] },
    { to: '/calendar', label: 'Content Calendar', roles: ['Admin'] },
    { to: '/cms', label: 'Website CMS', roles: ['Admin'] },
    { to: '/studio', label: 'AI Content Studio', roles: ['Admin'] },
    { to: '/media', label: 'Media Library', roles: ['Admin'] },
    { to: '/analytics', label: 'Analytics', roles: ['Admin'] },
    { to: '/reports', label: 'Reports', roles: ['Admin'] },
    { to: '/settings', label: 'Settings', roles: ['Admin'] },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'lead': return <Target size={14} className="text-amber-500" />;
      case 'dispatch': return <Truck size={14} className="text-purple-400" />;
      case 'marketing': return <Calendar size={14} className="text-ocean" />;
      default: return <Sparkles size={14} className="text-ocean" />;
    }
  };

  const renderNavLinks = (onItemClick) => (
    navItems.filter(item => item.roles.includes(user?.role)).map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onItemClick}
        className={({ isActive }) =>
          `px-4 py-2.5 rounded-xl transition-all text-sm font-bold flex items-center ${
            isActive
              ? 'bg-gradient-to-r from-ocean to-ocean-dark text-white shadow-md shadow-ocean/25'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          }`
        }
      >
        {item.label}
      </NavLink>
    ))
  );

  return (
    <div className="flex h-[100dvh] bg-[url('/grid-pattern.svg')] bg-fixed p-2 sm:p-3 md:p-4 gap-2 sm:gap-3 md:gap-4 transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      
      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[150] lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE DRAWER SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] card-glass z-[160] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden rounded-r-3xl overflow-hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-card-bg)' }}
      >
        <div className="p-5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="OceanGate" className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-ocean" />
            <div>
              <h2 className="m-0 tracking-widest font-extrabold text-xs" style={{ color: 'var(--color-text-main)' }}>OCEAN GATE</h2>
              <span className="inline-block px-2 py-0.5 bg-ocean/10 text-ocean text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                {user?.role || 'Staff'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-3 flex-1 overflow-y-auto custom-scrollbar gap-1">
          {renderNavLinks(() => setIsMobileMenuOpen(false))}
        </nav>

        <div className="p-4 border-t border-black/5 dark:border-white/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-ocean to-navy flex items-center justify-center text-white font-bold shadow text-xs shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-bold truncate leading-tight" style={{ color: 'var(--color-text-main)' }}>{user?.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="text-xs font-bold text-red-500 hover:text-red-600 p-2 rounded-xl hover:bg-red-500/10 shrink-0"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </aside>

      {/* DESKTOP FLOATING SIDEBAR */}
      <aside className="w-64 card-glass hidden lg:flex flex-col relative z-20 rounded-3xl shadow-2xl shrink-0 overflow-hidden">
        <div className="p-6 text-center border-b border-black/5 dark:border-white/10 mb-2 shrink-0">
          <img src="/logo.jpg" alt="OceanGate" className="w-20 h-20 mx-auto mb-2.5 rounded-full object-cover shadow-lg border-2 border-ocean" />
          <h2 className="m-0 tracking-widest font-extrabold text-sm" style={{ color: 'var(--color-text-main)' }}>OCEAN GATE</h2>
          <div className="mt-1.5 inline-block px-3 py-0.5 bg-ocean/10 text-ocean text-xs font-extrabold rounded-full uppercase tracking-wider">
            {user?.role || 'Staff'}
          </div>
        </div>

        <nav className="flex flex-col px-3 py-2 flex-1 overflow-y-auto custom-scrollbar gap-1">
          {renderNavLinks()}
        </nav>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col h-full relative z-10 gap-2 sm:gap-3 md:gap-4 min-w-0">
        
        {/* FLOATING HEADER */}
        <header className="h-16 sm:h-20 card-glass rounded-2xl sm:rounded-3xl flex items-center justify-between px-3 sm:px-6 shrink-0 shadow-xl relative z-30">
          
          {/* Left: Mobile Hamburger & Search Trigger & AI Core Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Toggle (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center lg:hidden text-ocean cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu size={19} />
            </button>

            {/* Compact Brand Label on small mobile screens */}
            <span className="font-extrabold text-xs sm:text-sm tracking-wider lg:hidden truncate max-w-[110px] sm:max-w-none text-ocean">
              OCEANGATE
            </span>

            {/* Global Spotlight Search Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-all text-xs font-semibold group cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}
              title="Press Ctrl + K to Search"
            >
              <Search size={15} className="text-ocean group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Search CRM, Guests, Bookings...</span>
              <span className="hidden sm:inline md:hidden">Search...</span>
              <span className="ml-1 sm:ml-2 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[9px] sm:text-[10px] text-slate-400 hidden xs:inline">
                Ctrl K
              </span>
            </button>

            {/* Clickable AI & Automation Live Core Status Pill */}
            <button
              onClick={() => setIsAutomationCenterOpen(true)}
              className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-ocean/10 hover:bg-ocean/20 border border-ocean/30 transition-all text-xs font-extrabold cursor-pointer group shadow-sm"
              title="Click to view AI & Automation Control Center"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ocean opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ocean"></span>
              </span>
              <span className="text-ocean group-hover:underline flex items-center gap-1">
                <Cpu size={13} />
                <span>AI & Automation: Active</span>
              </span>
            </button>
          </div>
          
          {/* Right Section: Theme Toggle, Notifications, Profile & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(prev => !prev)}
                className="p-2 sm:p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center relative z-10"
                style={{ color: 'var(--color-text-main)' }}
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-extrabold text-[9px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {isNotificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[90]" 
                    onClick={() => setIsNotificationsOpen(false)}
                  />
                  <div 
                    className="absolute right-0 mt-3 w-72 sm:w-96 card-glass shadow-2xl rounded-2xl overflow-hidden border border-ocean/30 z-[100] animate-fade-in"
                    style={{ backgroundColor: 'var(--color-card-bg)' }}
                  >
                    <div className="p-3.5 sm:p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-xs sm:text-sm" style={{ color: 'var(--color-text-main)' }}>Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-ocean/20 text-ocean px-2 py-0.5 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllRead} 
                          className="text-[10px] sm:text-[11px] text-ocean hover:underline font-bold flex items-center gap-1"
                        >
                          <Check size={12} /> Mark read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-black/5 dark:divide-white/5 custom-scrollbar">
                      {notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-3 sm:p-3.5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors flex items-start gap-2.5 sm:gap-3 ${
                            n.unread ? 'bg-ocean/[0.04]' : ''
                          }`}
                        >
                          <div className="p-1.5 sm:p-2 rounded-xl bg-black/5 dark:bg-white/10 shrink-0 mt-0.5">
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <p className="font-bold text-xs truncate" style={{ color: 'var(--color-text-main)' }}>{n.title}</p>
                              <span className="text-[9px] sm:text-[10px] text-slate-400 shrink-0">{n.time}</span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] leading-tight line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                              {n.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 sm:p-2.5 text-center border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                      <span className="text-[10px] sm:text-[11px] font-bold text-ocean">OceanGate Automated Telemetry System</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
              style={{ color: 'var(--color-text-main)' }}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} className="text-navy" />
                  <span className="hidden md:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun size={16} className="text-yellow" />
                  <span className="hidden md:inline">Light</span>
                </>
              )}
            </button>

            <div className="h-6 sm:h-7 w-px bg-black/10 dark:bg-white/10 hidden sm:block"></div>

            <div className="text-right hidden md:block">
              <p className="text-xs sm:text-sm font-extrabold leading-tight truncate max-w-[120px]" style={{ color: 'var(--color-text-main)' }}>{user?.name}</p>
              <p className="text-[10px] sm:text-xs font-medium truncate max-w-[120px]" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
            </div>
            
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-ocean to-navy flex items-center justify-center text-white font-bold shadow-md border-2 border-white/20 text-xs sm:text-base shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>

            <div className="h-6 sm:h-7 w-px bg-black/10 dark:bg-white/10 hidden sm:block"></div>
            
            <button 
              onClick={logout} 
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl hover:bg-red-500/10"
              title="Logout"
            >
              <span>🚪</span> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 relative rounded-2xl sm:rounded-3xl card-glass overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-3.5 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* GLOBAL COMMAND PALETTE */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onToggleTheme={toggleTheme}
        currentTheme={theme}
      />

      {/* AI & AUTOMATION CONTROL CENTER MODAL */}
      <AutomationControlCenter
        isOpen={isAutomationCenterOpen}
        onClose={() => setIsAutomationCenterOpen(false)}
      />
    </div>
  );
};

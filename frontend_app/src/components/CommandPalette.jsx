import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { 
  Search, 
  LayoutDashboard, 
  Target, 
  Users, 
  Plane, 
  Truck, 
  DollarSign, 
  Megaphone, 
  Calendar, 
  Image, 
  Sparkles, 
  BarChart3, 
  FileText, 
  Settings, 
  Plus, 
  Sun, 
  Moon, 
  ArrowRight,
  Command
} from 'lucide-react';

export function CommandPalette({ isOpen, onClose, onToggleTheme, currentTheme }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const staticNavigation = [
    { title: 'Operations Dashboard', path: '/', icon: LayoutDashboard, category: 'Navigation' },
    { title: 'Leads Pipeline', path: '/leads', icon: Target, category: 'Navigation' },
    { title: 'Customer Database', path: '/customers', icon: Users, category: 'Navigation' },
    { title: 'Bookings & Itineraries', path: '/bookings', icon: Plane, category: 'Navigation' },
    { title: 'Operations & Fleet Dispatch', path: '/operations', icon: Truck, category: 'Navigation' },
    { title: 'Payments & Ledger', path: '/payments', icon: DollarSign, category: 'Navigation' },
    { title: 'Ads Command Center', path: '/marketing', icon: Megaphone, category: 'Navigation' },
    { title: 'Content Calendar', path: '/calendar', icon: Calendar, category: 'Navigation' },
    { title: 'Media Library', path: '/media', icon: Image, category: 'Navigation' },
    { title: 'AI Content Studio', path: '/studio', icon: Sparkles, category: 'Navigation' },
    { title: 'Analytics Engine', path: '/analytics', icon: BarChart3, category: 'Navigation' },
    { title: 'Reports & PDF Export', path: '/reports', icon: FileText, category: 'Navigation' },
    { title: 'Platform Settings', path: '/settings', icon: Settings, category: 'Navigation' }
  ];

  const staticActions = [
    { title: 'Create New Booking', action: () => navigate('/bookings/new'), icon: Plus, category: 'Actions' },
    { title: 'Open AI Studio Render', action: () => navigate('/studio'), icon: Sparkles, category: 'Actions' },
    { title: 'Schedule Social Post', action: () => navigate('/calendar'), icon: Calendar, category: 'Actions' },
    { title: `Switch to ${currentTheme === 'light' ? 'Dark' : 'Light'} Mode`, action: () => onToggleTheme && onToggleTheme(), icon: currentTheme === 'light' ? Moon : Sun, category: 'Actions' }
  ];

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Live entity search when query is >= 2 chars
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [leadsRes, bookingsRes, customersRes] = await Promise.all([
          api.get('/leads'),
          api.get('/bookings'),
          api.get('/customers')
        ]);

        const q = query.toLowerCase();
        const matched = [];

        // Leads
        (leadsRes.data || []).forEach(lead => {
          const name = lead.source_details?.name || lead.name || 'Lead';
          if (name.toLowerCase().includes(q) || (lead.service_interest && lead.service_interest.toLowerCase().includes(q))) {
            matched.push({
              title: `Lead: ${name} (${lead.service_interest || 'General'})`,
              subtitle: `Status: ${lead.status} • Source: ${lead.source}`,
              action: () => navigate('/leads'),
              icon: Target,
              category: 'CRM Records'
            });
          }
        });

        // Bookings
        (bookingsRes.data || []).forEach(b => {
          const bNum = b.booking_number || '';
          const sType = b.service_type || '';
          if (bNum.toLowerCase().includes(q) || sType.toLowerCase().includes(q)) {
            matched.push({
              title: `Booking #${bNum}: ${sType}`,
              subtitle: `Date: ${b.service_date ? new Date(b.service_date).toLocaleDateString() : 'Active'} • Status: ${b.status}`,
              action: () => navigate('/bookings'),
              icon: Plane,
              category: 'CRM Records'
            });
          }
        });

        // Customers
        (customersRes.data || []).forEach(c => {
          const name = `${c.first_name || ''} ${c.last_name || ''}`;
          if (name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q))) {
            matched.push({
              title: `Guest: ${name}`,
              subtitle: `${c.email || 'No email'} • ${c.phone || ''}`,
              action: () => navigate('/customers'),
              icon: Users,
              category: 'CRM Records'
            });
          }
        });

        setSearchResults(matched.slice(0, 5));
      } catch (err) {
        console.error('Command palette search error:', err);
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, navigate]);

  // Combine items
  const filteredNav = staticNavigation.filter(item => 
    !query || item.title.toLowerCase().includes(query.toLowerCase())
  ).map(item => ({ ...item, action: () => navigate(item.path) }));

  const filteredActions = staticActions.filter(item => 
    !query || item.title.toLowerCase().includes(query.toLowerCase())
  );

  const allItems = query.trim().length >= 2 
    ? [...searchResults, ...filteredActions, ...filteredNav]
    : [...filteredActions, ...filteredNav];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-8 sm:pt-20 p-2.5 sm:p-4 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div 
        className="card-glass w-full max-w-xl max-h-[85vh] sm:max-h-[75vh] flex flex-col border border-ocean/30 shadow-2xl rounded-2xl overflow-hidden relative z-10"
        style={{ backgroundColor: 'var(--color-card-bg)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center gap-3 shrink-0">
          <Search size={18} className="text-ocean shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Type a command, page, guest name, or booking #..."
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
            style={{ color: 'var(--color-text-main)' }}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-mono text-slate-400">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto flex-1 custom-scrollbar max-h-[400px] space-y-1">
          {searching && (
            <div className="p-4 text-center text-xs font-semibold text-ocean flex items-center justify-center gap-2">
              <div className="animate-spin h-3.5 w-3.5 border-2 border-ocean border-t-transparent rounded-full"></div>
              Searching live CRM records...
            </div>
          )}

          {allItems.length === 0 && !searching && (
            <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
              <p className="text-xs font-semibold">No matching commands or records found.</p>
            </div>
          )}

          {allItems.map((item, index) => {
            const Icon = item.icon || ArrowRight;
            const isSelected = selectedIndex === index;

            return (
              <div
                key={`${item.category}-${item.title}-${index}`}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-ocean text-white shadow-md shadow-ocean/25 font-bold' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={{ color: isSelected ? '#FFFFFF' : 'var(--color-text-main)' }}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-ocean'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{item.title}</div>
                    {item.subtitle && (
                      <div className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-slate-400'
                  }`}>
                    {item.category}
                  </span>
                  <ArrowRight size={14} className={isSelected ? 'opacity-100' : 'opacity-30'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="p-2.5 sm:p-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-medium shrink-0 bg-black/[0.02] dark:bg-white/[0.02]" style={{ color: 'var(--color-text-muted)' }}>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">↑</span>
              <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">↓</span> to navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">↵</span> to select
            </span>
          </div>
          <div className="text-ocean font-bold flex items-center gap-1 ml-auto sm:ml-0 text-xs">
            <Command size={12} /> OceanGate Spotlight
          </div>
        </div>

      </div>
    </div>
  );
}

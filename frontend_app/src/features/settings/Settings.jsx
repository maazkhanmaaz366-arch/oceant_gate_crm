import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useUser } from '../../contexts/UserContext';
import api from '../../lib/api';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { user, changeRole } = useUser();
  const [envSecrets, setEnvSecrets] = useState({});
  const [savingEnv, setSavingEnv] = useState(false);

  useEffect(() => {
    if (activeTab === 'secrets' && user?.role === 'Admin') {
      api.get('/settings/env')
        .then(res => {
           if (res.data && typeof res.data === 'object') {
             setEnvSecrets(res.data);
           } else {
             setEnvSecrets({});
           }
        })
        .catch(err => {
           console.error("Failed to fetch env", err);
           setEnvSecrets({});
        });
    }
  }, [activeTab, user]);

  const handleSaveEnv = async () => {
    setSavingEnv(true);
    try {
      await api.post('/settings/env', envSecrets);
      alert('Secrets saved successfully!\n\nNote: Please restart your backend server (start_servers.bat) for these changes to fully take effect in memory.');
    } catch (err) {
      console.error(err);
      alert('Failed to save secrets.');
    }
    setSavingEnv(false);
  };

  const handleEnvChange = (key, value) => {
    setEnvSecrets(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', label: 'General Preferences', icon: '⚙️' },
    { id: 'integrations', label: 'API Integrations', icon: '🔌' },
    { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
    { id: 'secrets', label: 'Environment Secrets', icon: '🔐', adminOnly: true },
    { id: 'users', label: 'Users & Roles', icon: '👥' }
  ];

  return (
    <Layout>
      <div className="mb-6 sm:mb-8 relative z-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: 'var(--color-text-main)' }}>Platform Settings</h1>
        <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Configure your agency preferences, integrations, and security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative z-10">
        {/* SIDEBAR TABS */}
        <div className="flex flex-row lg:flex-col overflow-x-auto w-full lg:w-64 gap-2 pb-2 lg:pb-0 shrink-0 custom-scrollbar">
          {tabs.filter(t => !t.adminOnly || user?.role === 'Admin').map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none lg:w-full whitespace-nowrap flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === tab.id ? 'bg-ocean text-white shadow-lg shadow-ocean/20' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
              style={{ color: activeTab === tab.id ? '' : 'var(--color-text-main)' }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 card-glass p-4 sm:p-8 min-h-[400px]">
          
          {/* GENERAL PREFERENCES */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>General Preferences</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>Agency Name</label>
                  <input type="text" defaultValue="OceanGate Travel & Tours" className="input-glass" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>Base Currency</label>
                  <select className="input-glass">
                    <option>AED - UAE Dirham</option>
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>Support Email</label>
                <input type="email" defaultValue="support@oceangate.ae" className="input-glass" />
              </div>
              <button className="btn-primary mt-4">Save Changes</button>
            </div>
          )}

          {/* API INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>Connected Applications</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Link external platforms to synchronize data with your CRM.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <div>
                    <h3 className="font-bold text-lg text-blue-500">Meta Business Manager</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sync Facebook & Instagram leads and ad spend.</p>
                  </div>
                  <a href="/api/oauth/meta/login" className="btn-primary bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40">Connect Meta</a>
                </div>

                <div className="flex items-center justify-between p-6 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                  <div>
                    <h3 className="font-bold text-lg text-red-500">Google Ads</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sync Google Ads conversion data and campaign spend.</p>
                  </div>
                  <a href="/api/oauth/google/login" className="btn-primary bg-red-500 shadow-red-500/20 hover:shadow-red-500/40">Connect Google</a>
                </div>
              </div>
            </div>
          )}

          {/* ENVIRONMENT SECRETS */}
          {activeTab === 'secrets' && user?.role === 'Admin' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-red-500">Environment Secrets (.env)</h2>
                 <button onClick={handleSaveEnv} disabled={savingEnv} className="btn-primary bg-red-500 shadow-red-500/20 border-red-500">
                   {savingEnv ? 'Saving...' : 'Save Secrets to .env'}
                 </button>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Directly manage production-level secrets, API keys, and configurations. <br/>
                <strong className="text-red-500">Warning: Changes here require the Node.js backend server to be restarted to fully take effect.</strong>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['NODE_ENV', 'JWT_SECRET', 'META_APP_ID', 'META_APP_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'TIKTOK_APP_KEY', 'TIKTOK_APP_SECRET', 'WEBHOOK_API_KEY', 'GEMINI_API_KEY'].map(key => (
                  <div key={key}>
                    <label className="block text-xs font-bold mb-1 opacity-70 font-mono text-ocean">{key}</label>
                    <input 
                      type="text" 
                      value={(envSecrets && envSecrets[key]) || ''} 
                      onChange={(e) => handleEnvChange(key, e.target.value)}
                      className="input-glass font-mono text-sm w-full" 
                      placeholder={`Enter ${key}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WEBHOOKS */}
          {activeTab === 'webhooks' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-main)' }}>Webhooks & Endpoints</h2>
              
              <div className="p-6 rounded-xl border-2 border-dashed border-ocean bg-ocean/5">
                <h3 className="font-bold text-lg text-ocean mb-2">Universal Lead Capture Webhook</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  Send HTTP POST requests to this URL from Zapier, Typeform, or Custom Forms to automatically generate leads in the CRM.
                </p>
                <div className="flex gap-4">
                  <input type="text" readOnly value={`${window.location.origin}/api/webhooks/incoming`} className="input-glass flex-1 font-mono text-sm" />
                  <button className="btn-primary" onClick={() => alert('URL Copied to clipboard!')}>Copy URL</button>
                </div>
              </div>
            </div>
          )}

          {/* USERS & ROLES (RBAC) */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>User Management & Roles</h2>
                 <button className="btn-primary text-sm px-4 py-2">+ Invite User</button>
              </div>
              
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="pb-3 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>User</th>
                    <th className="pb-3 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Email</th>
                    <th className="pb-3 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>System Role</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black/5 dark:border-white/5">
                    <td className="py-4 font-bold flex items-center gap-3" style={{ color: 'var(--color-text-main)' }}>
                      <div className="w-8 h-8 rounded-full bg-ocean text-white flex items-center justify-center text-xs">DA</div>
                      Demo Admin (You)
                    </td>
                    <td className="py-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>admin@oceangate.ae</td>
                    <td className="py-4">
                      <select 
                        value={user.role} 
                        onChange={(e) => changeRole(e.target.value)} 
                        className="input-glass py-1 px-3 text-sm"
                      >
                        <option value="Admin">Administrator (Full Access)</option>
                        <option value="Sales">Sales Agent (Restricted)</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

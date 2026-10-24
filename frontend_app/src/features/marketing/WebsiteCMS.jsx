import React, { useState } from 'react';
import { Layout } from '../../components/Layout';

export const WebsiteCMS = () => {
  const [activeTab, setActiveTab] = useState('landing_pages');

  const landingPages = [
    { id: 1, title: 'Desert Safari Offer', url: '/promo/safari-2026', views: 1250, leads: 45, status: 'Live' },
    { id: 2, title: 'Summer Yacht Party', url: '/promo/yacht-summer', views: 890, leads: 32, status: 'Live' },
    { id: 3, title: 'Corporate Retreats', url: '/b2b/corporate', views: 0, leads: 0, status: 'Draft' },
  ];

  return (
    <Layout>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: 'var(--color-text-main)' }}>Website Content (CMS)</h1>
          <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Build and manage campaign landing pages and offers.</p>
        </div>
        <button className="btn-primary flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-4 w-full sm:w-auto">
          <span>➕</span> Create New Page
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative z-10 animate-fade-in">
        
        {/* Sidebar Tabs */}
        <div className="flex flex-row lg:flex-col overflow-x-auto w-full lg:w-64 gap-2 pb-2 lg:pb-0 shrink-0 custom-scrollbar">
          {[
            { id: 'landing_pages', label: 'Landing Pages', icon: '📄' },
            { id: 'blog', label: 'Blog Posts', icon: '✍️' },
            { id: 'banners', label: 'Hero Banners', icon: '🖼️' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none lg:w-full whitespace-nowrap flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${activeTab === tab.id ? 'bg-ocean text-white shadow-lg shadow-ocean/20' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
              style={{ color: activeTab === tab.id ? '' : 'var(--color-text-main)' }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 card-glass p-8 min-h-[500px]">
          
          {activeTab === 'landing_pages' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                Landing Pages
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* New Page Card */}
                <div className="border-2 border-dashed border-ocean/30 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-ocean/5 transition-colors min-h-[200px]">
                  <span className="text-4xl mb-2">✨</span>
                  <span className="font-bold text-ocean">Start from Template</span>
                </div>

                {/* Existing Pages */}
                {landingPages.map(page => (
                  <div key={page.id} className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-6 hover:shadow-lg transition-all relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${page.status === 'Live' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                        {page.status}
                      </span>
                      <button className="text-ocean opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-xs font-bold">✏️ Edit</button>
                    </div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-main)' }}>{page.title}</h3>
                    <p className="text-xs font-mono mb-4" style={{ color: 'var(--color-text-muted)' }}>oceangate.ae{page.url}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-black/10 dark:border-white/10">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Views</p>
                        <p className="font-bold text-sm" style={{ color: 'var(--color-text-main)' }}>{page.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Leads</p>
                        <p className="font-bold text-sm" style={{ color: 'var(--color-text-main)' }}>{page.leads.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab !== 'landing_pages' && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-4xl mb-4">🚧</span>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-main)' }}>Under Construction</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>The {activeTab.replace('_', ' ')} module is currently being built.</p>
            </div>
          )}

        </div>

      </div>
    </Layout>
  );
};

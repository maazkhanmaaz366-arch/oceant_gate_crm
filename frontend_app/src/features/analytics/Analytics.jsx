import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data?.metrics);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-ocean border-t-transparent rounded-full mb-4"></div>
        </div>
      </Layout>
    );
  }

  if (!data) return <Layout>Failed to load data</Layout>;

  // Formatters
  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(val);

  // Spend percentages for the progress bar
  const metaPct = data.total_ad_spend > 0 ? (data.platform_spend.meta / data.total_ad_spend) * 100 : 0;
  const googlePct = data.total_ad_spend > 0 ? (data.platform_spend.google / data.total_ad_spend) * 100 : 0;
  const tiktokPct = data.total_ad_spend > 0 ? (data.platform_spend.tiktok / data.total_ad_spend) * 100 : 0;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: 'var(--color-text-main)' }}>Global Analytics</h1>
          <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Deep dive into your agency's real-time performance metrics.</p>
        </div>
        <div className="text-xs px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-green-500/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live Sync Active
        </div>
      </div>

      {/* CORE BUSINESS KPIS */}
      <h2 className="text-lg sm:text-xl font-bold mb-4 mt-6 sm:mt-8" style={{ color: 'var(--color-text-main)' }}>Business Performance</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
        <div className="card-glass p-4 sm:p-6">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Total Revenue</div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ocean mb-1">{formatCurrency(data.total_revenue)}</div>
          <div className="text-xs text-green-500 font-medium">↑ Linked from Bookings</div>
        </div>
        <div className="card-glass p-4 sm:p-6">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Gross Margin</div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-yellow-500 mb-1">{formatCurrency(data.gross_margin)}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Revenue minus payables</div>
        </div>
        <div className="card-glass p-6">
          <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Confirmed Bookings</div>
          <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-text-main)' }}>{data.confirmed_bookings}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total fulfilled or active</div>
        </div>
        <div className="card-glass p-6">
          <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Lead Conversion Rate</div>
          <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--color-text-main)' }}>{data.conversion_rate}%</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>From {data.total_leads} total leads</div>
        </div>
      </div>

      {/* ADVERTISING ENGINE */}
      <h2 className="text-xl font-bold mb-4 mt-12" style={{ color: 'var(--color-text-main)' }}>Marketing & Advertising Engine</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Ad Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-glass p-6 flex flex-col justify-center">
            <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Total Ad Spend</div>
            <div className="text-4xl font-extrabold text-red-500 mb-1">{formatCurrency(data.total_ad_spend)}</div>
            <div className="text-xs font-medium bg-red-500/10 text-red-500 px-2 py-1 rounded w-max">Aggregated Cross-Platform</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card-glass p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Blended ROAS</div>
              <div className="text-2xl font-extrabold text-ocean">{data.roas}x</div>
            </div>
            <div className="card-glass p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Cost per Lead</div>
              <div className="text-2xl font-extrabold" style={{ color: 'var(--color-text-main)' }}>{formatCurrency(data.cost_per_lead)}</div>
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="lg:col-span-2 card-glass p-8 flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>Spend by Platform</h3>
          
          {/* Progress Bar */}
          <div className="w-full h-8 rounded-full overflow-hidden flex bg-black/5 dark:bg-white/5 mb-6 shadow-inner border border-black/10 dark:border-white/10">
            {metaPct > 0 && <div style={{ width: `${metaPct}%` }} className="h-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000">META {Math.round(metaPct)}%</div>}
            {googlePct > 0 && <div style={{ width: `${googlePct}%` }} className="h-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000">GOOG {Math.round(googlePct)}%</div>}
            {tiktokPct > 0 && <div style={{ width: `${tiktokPct}%` }} className="h-full bg-black flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000">TK {Math.round(tiktokPct)}%</div>}
          </div>

          {/* Breakdown Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col items-center">
              <span className="text-xs font-bold text-blue-500 mb-1">META (FB/IG)</span>
              <span className="text-xl font-extrabold" style={{ color: 'var(--color-text-main)' }}>{formatCurrency(data.platform_spend.meta)}</span>
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col items-center">
              <span className="text-xs font-bold text-red-500 mb-1">GOOGLE ADS</span>
              <span className="text-xl font-extrabold" style={{ color: 'var(--color-text-main)' }}>{formatCurrency(data.platform_spend.google)}</span>
            </div>
            <div className="p-4 rounded-xl border border-black/10 dark:border-white/20 bg-black/5 dark:bg-white/5 flex flex-col items-center">
              <span className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-main)' }}>TIKTOK</span>
              <span className="text-xl font-extrabold" style={{ color: 'var(--color-text-main)' }}>{formatCurrency(data.platform_spend.tiktok)}</span>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';

export const Reports = () => {
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setReportData(null);
    try {
      let fetchedData = null;
      if (reportType === 'financial') {
        const res = await api.get('/analytics/dashboard');
        fetchedData = res.data?.metrics;
      } else if (reportType === 'bookings') {
        const res = await api.get('/bookings');
        fetchedData = res.data;
      } else if (reportType === 'leads') {
        const res = await api.get('/leads');
        fetchedData = res.data;
      }
      
      setReportData(fetchedData);
      
      // Wait a tick for React to render the printable area, then trigger print
      setTimeout(() => {
        window.print();
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error("Report Generation Error:", error);
      alert('Failed to generate report data.');
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <>
      <div className="print:hidden">
        <Layout>
          <div className="mb-6 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: 'var(--color-text-main)' }}>Reports & PDFs</h1>
            <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Generate branded, highly-detailed PDF reports.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {/* CONFIGURATION PANEL */}
            <div className="card-glass p-5 sm:p-8">
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-main)' }}>Report Configuration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>Report Type</label>
                  <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-glass">
                    <option value="financial">Financial & Advertising Performance</option>
                    <option value="bookings">Complete Bookings Export</option>
                    <option value="leads">Complete CRM Leads Export</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>Date Range</label>
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="input-glass">
                    <option value="30d">Last 30 Days</option>
                    <option value="ytd">Year to Date</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg mt-4 flex justify-center items-center gap-2"
                >
                  {loading ? (
                     <><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> Compiling PDF...</>
                  ) : '📄 Generate & Download PDF'}
                </button>
              </div>
            </div>

            {/* PREVIEW/INFO PANEL */}
            <div className="card-glass p-8 flex flex-col justify-center items-center text-center">
              <div className="text-6xl mb-4">🖨️</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Instant Generation</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>The system will securely fetch live data from the backend, render a beautiful branded template, and open the print dialog. Save as PDF for high-quality, external-server-free reports.</p>
            </div>
          </div>
        </Layout>
      </div>

      {/* PRINT-ONLY TEMPLATE */}
      <div className="hidden print:block bg-white text-black min-h-screen p-8" style={{ fontFamily: 'sans-serif' }}>
          
          {/* PDF HEADER */}
          <div className="flex justify-between items-end border-b-4 border-[#0E3F5D] pb-6 mb-8">
             <div>
                <h1 className="text-4xl font-extrabold text-[#0E3F5D] tracking-tight m-0 uppercase">OceanGate</h1>
                <p className="text-lg font-bold text-[#00AEEF] m-0 uppercase tracking-widest mt-1">Travel & Tours</p>
             </div>
             <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-800 m-0 capitalize">{reportType} Report</h2>
                <p className="text-gray-500 font-medium mt-1">Date Range: {dateRange.toUpperCase()}</p>
                <p className="text-gray-400 text-sm mt-1">Generated: {new Date().toLocaleDateString()}</p>
             </div>
          </div>

          {/* DYNAMIC REPORT BODY */}
          {reportData && (
            <div>
              {/* FINANCIAL REPORT TEMPLATE */}
              {reportType === 'financial' && (
                <div>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                     <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-gray-500 uppercase font-bold text-xs mb-1">Total Revenue</div>
                        <div className="text-4xl font-extrabold text-[#0E3F5D]">{formatCurrency(reportData.total_revenue)}</div>
                     </div>
                     <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-gray-500 uppercase font-bold text-xs mb-1">Gross Margin</div>
                        <div className="text-4xl font-extrabold text-[#0E3F5D]">{formatCurrency(reportData.gross_margin)}</div>
                     </div>
                     <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-gray-500 uppercase font-bold text-xs mb-1">Total Ad Spend</div>
                        <div className="text-4xl font-extrabold text-[#0E3F5D]">{formatCurrency(reportData.total_ad_spend)}</div>
                     </div>
                     <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-gray-500 uppercase font-bold text-xs mb-1">Blended ROAS</div>
                        <div className="text-4xl font-extrabold text-[#0E3F5D]">{reportData.roas}x</div>
                     </div>
                  </div>

                  <h3 className="text-xl font-bold border-b border-gray-200 pb-2 mb-4 text-[#0E3F5D]">Platform Advertising Breakdown</h3>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 font-bold text-gray-700 uppercase text-sm border-b border-gray-300">Platform</th>
                        <th className="p-3 font-bold text-gray-700 uppercase text-sm border-b border-gray-300 text-right">Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium">Meta (Facebook/Instagram)</td>
                        <td className="p-3 font-bold text-right">{formatCurrency(reportData.platform_spend?.meta)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium">Google Ads</td>
                        <td className="p-3 font-bold text-right">{formatCurrency(reportData.platform_spend?.google)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="p-3 font-medium">TikTok</td>
                        <td className="p-3 font-bold text-right">{formatCurrency(reportData.platform_spend?.tiktok)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mt-12 text-center text-gray-400 text-sm italic">
                    This report was generated automatically by the OceanGate CRM Engine.
                  </div>
                </div>
              )}

              {/* BOOKINGS REPORT TEMPLATE */}
              {reportType === 'bookings' && Array.isArray(reportData) && (
                <table className="w-full text-left border-collapse" style={{ width: '10.5in' }}> {/* Landscape width */}
                  <thead>
                    <tr className="bg-[#0E3F5D] text-white">
                      <th className="p-3 font-bold uppercase text-xs">ID</th>
                      <th className="p-3 font-bold uppercase text-xs">Customer Name</th>
                      <th className="p-3 font-bold uppercase text-xs">Service</th>
                      <th className="p-3 font-bold uppercase text-xs">Date</th>
                      <th className="p-3 font-bold uppercase text-xs">Status</th>
                      <th className="p-3 font-bold uppercase text-xs text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((b) => (
                      <tr key={b.id} className="border-b border-gray-200">
                        <td className="p-3 text-xs text-gray-500">{b.booking_number}</td>
                        <td className="p-3 font-bold text-sm">{b.customer_name}</td>
                        <td className="p-3 text-sm">{b.service_type}</td>
                        <td className="p-3 text-sm">{b.booking_date?.substring(0,10)}</td>
                        <td className="p-3 text-sm font-bold uppercase text-[#00AEEF]">{b.status}</td>
                        <td className="p-3 font-bold text-right text-sm">{formatCurrency(b.customer_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* LEADS REPORT TEMPLATE */}
              {reportType === 'leads' && Array.isArray(reportData) && (
                <table className="w-full text-left border-collapse" style={{ width: '10.5in' }}> {/* Landscape width */}
                  <thead>
                    <tr className="bg-[#0E3F5D] text-white">
                      <th className="p-3 font-bold uppercase text-xs">Name</th>
                      <th className="p-3 font-bold uppercase text-xs">Phone</th>
                      <th className="p-3 font-bold uppercase text-xs">Interest</th>
                      <th className="p-3 font-bold uppercase text-xs">Source</th>
                      <th className="p-3 font-bold uppercase text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((l) => (
                      <tr key={l.id} className="border-b border-gray-200">
                        <td className="p-3 font-bold text-sm">{l.name}</td>
                        <td className="p-3 text-sm">{l.phone}</td>
                        <td className="p-3 text-sm">{l.service_interest}</td>
                        <td className="p-3 text-sm font-bold uppercase text-purple-600">{l.source}</td>
                        <td className="p-3 text-sm font-bold uppercase text-green-600">{l.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          )}
      </div>
    </>
  );
};

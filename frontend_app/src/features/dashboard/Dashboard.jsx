import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Plane, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Target
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ 
    revenue: 0, 
    bookings: 0, 
    customers: 0, 
    leads: 0,
    gross_margin: 0,
    conversion_rate: 0,
    total_ad_spend: 0,
    roas: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('30d');

  // Quick Lead Modal
  const [isQuickLeadModalOpen, setIsQuickLeadModalOpen] = useState(false);
  const [quickLeadForm, setQuickLeadForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    serviceInterest: 'Yacht Rental',
    source: 'Direct Phone / Walk-in'
  });

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [bookingsRes, leadsRes, customersRes, jobsRes, analyticsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/leads'),
        api.get('/customers'),
        api.get('/jobs'),
        api.get('/analytics/dashboard')
      ]);

      const bookings = Array.isArray(bookingsRes?.data) ? bookingsRes.data : (Array.isArray(bookingsRes) ? bookingsRes : []);
      const leads = Array.isArray(leadsRes?.data) ? leadsRes.data : (Array.isArray(leadsRes) ? leadsRes : []);
      const customers = Array.isArray(customersRes?.data) ? customersRes.data : (Array.isArray(customersRes) ? customersRes : []);
      const jobs = Array.isArray(jobsRes?.data) ? jobsRes.data : (Array.isArray(jobsRes) ? jobsRes : []);
      const analytics = analyticsRes?.data?.data?.metrics || analyticsRes?.data?.metrics || {};

      const totalRevenue = bookings.reduce((sum, b) => sum + (b?.financials?.customer_price || b?.customer_price || 0), 0);
      
      setMetrics({
        revenue: totalRevenue || analytics.total_revenue || 0,
        bookings: bookings.length,
        customers: customers.length,
        leads: leads.filter(l => l.status === 'new' || l.status === 'contacted' || l.status === 'qualified').length,
        conversion_rate: analytics.conversion_rate || (leads.length > 0 ? ((bookings.length / leads.length) * 100).toFixed(1) : 0),
        gross_margin: analytics.gross_margin || (totalRevenue * 0.72),
        total_ad_spend: analytics.total_ad_spend || 1850,
        roas: analytics.roas || (totalRevenue > 0 ? (totalRevenue / 1850).toFixed(1) : '7.1')
      });

      setRecentLeads(leads.slice(-6).reverse());
      setUpcomingBookings(bookings.slice(-6).reverse());
      setActiveJobs(jobs.slice(-4).reverse());

    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(val || 0);

  const handleQuickLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads', {
        source: quickLeadForm.source,
        service_interest: quickLeadForm.serviceInterest,
        pax: { adults: 2, children: 0, infants: 0 },
        travel_dates: { start_date: new Date().toISOString().slice(0, 10), end_date: '' },
        source_details: {
          name: quickLeadForm.customerName,
          email: quickLeadForm.email,
          phone: quickLeadForm.phone
        }
      });
      setIsQuickLeadModalOpen(false);
      setQuickLeadForm({ customerName: '', phone: '', email: '', serviceInterest: 'Yacht Rental', source: 'Direct Phone / Walk-in' });
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to add quick lead", error);
      alert("Failed to create lead.");
    }
  };

  // Mock revenue monthly distribution for chart
  const revenueChartData = [
    { month: 'Apr', revenue: 42000, spend: 5400, bookings: 14 },
    { month: 'May', revenue: 58000, spend: 7200, bookings: 21 },
    { month: 'Jun', revenue: 76000, spend: 8900, bookings: 29 },
    { month: 'Jul', revenue: 94000, spend: 11200, bookings: 38 },
    { month: 'Aug', revenue: metrics.revenue > 0 ? metrics.revenue : 118500, spend: metrics.total_ad_spend > 0 ? metrics.total_ad_spend : 14800, bookings: metrics.bookings > 0 ? metrics.bookings : 46 }
  ];

  const maxRevenue = Math.max(...revenueChartData.map(d => d.revenue));

  // Service distribution
  const serviceBreakdown = [
    { name: 'Luxury Mega Yacht Charters', percentage: 42, color: 'bg-ocean', aed: 'AED 84,000' },
    { name: 'VIP Arabian Desert Safaris', percentage: 28, color: 'bg-amber-400', aed: 'AED 46,200' },
    { name: '5-Star Resort & Villa Packages', percentage: 18, color: 'bg-emerald-500', aed: 'AED 32,500' },
    { name: 'Helicopter & Airport Chauffeur', percentage: 12, color: 'bg-purple-500', aed: 'AED 18,900' }
  ];

  return (
    <Layout>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[65vh]">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-ocean border-t-transparent mb-4"></div>
          <p className="font-bold text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading live operations & CRM telemetry...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in pb-12">
          
          {/* TOP WELCOME & ACTION BAR */}
          <div className="card-glass p-4 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 relative z-10 overflow-hidden">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] sm:text-xs font-extrabold bg-ocean/10 text-ocean px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ocean animate-ping"></span>
                  Live CRM Telemetry
                </span>
                <span className="text-[11px] sm:text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Dubai, UAE (GST UTC+4) • {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                Welcome back, Operations Command
              </h1>
              <p className="font-medium text-xs sm:text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Here is your agency performance summary, active itineraries, and real-time revenue analytics.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <button 
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="btn-outline flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold py-2 px-3"
                title="Refresh Live Data"
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Syncing...' : 'Sync'}
              </button>

              <button 
                onClick={() => setIsQuickLeadModalOpen(true)}
                className="btn-outline flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3"
              >
                <Plus size={14} className="text-ocean" /> Quick Lead
              </button>

              <button 
                onClick={() => navigate('/bookings/new')}
                className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-ocean/20 py-2 px-3"
              >
                <Plane size={14} /> + New Booking
              </button>

              <button 
                onClick={() => navigate('/calendar')}
                className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-extrabold py-2 px-3"
              >
                <Calendar size={14} /> Calendar
              </button>
            </div>
          </div>

          {/* 5-KPI METRIC HIGHLIGHT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 relative z-10">
            {/* Total Revenue */}
            <div className="card-glass p-4 sm:p-5 hover:shadow-ocean/15 hover:-translate-y-1 transition-all duration-200">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total Revenue</span>
                <div className="p-1.5 sm:p-2 rounded-xl bg-ocean/10 text-ocean border border-ocean/20">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold" style={{ color: 'var(--color-text-main)' }}>
                {formatCurrency(metrics.revenue)}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-500 mt-2">
                <ArrowUpRight size={14} /> +18.4% <span className="font-normal text-[11px]" style={{ color: 'var(--color-text-muted)' }}>vs last month</span>
              </div>
            </div>

            {/* Active Pipeline Leads */}
            <div className="card-glass p-5 hover:shadow-ocean/15 hover:-translate-y-1 transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Active Leads</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Target size={18} />
                </div>
              </div>
              <div className="text-2xl font-extrabold" style={{ color: 'var(--color-text-main)' }}>
                {metrics.leads}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-ocean mt-2">
                <span>{metrics.conversion_rate}%</span> <span className="font-normal text-[11px]" style={{ color: 'var(--color-text-muted)' }}>conversion rate</span>
              </div>
            </div>

            {/* Confirmed Bookings */}
            <div className="card-glass p-5 hover:shadow-ocean/15 hover:-translate-y-1 transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Confirmed Trips</span>
                <div className="p-2 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-green-500">
                {metrics.bookings}
              </div>
              <div className="text-[11px] font-medium mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Active & fulfilled itineraries
              </div>
            </div>

            {/* Active Dispatch Jobs */}
            <div className="card-glass p-5 hover:shadow-ocean/15 hover:-translate-y-1 transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Fleet Operations</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Truck size={18} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-purple-400">
                {activeJobs.length}
              </div>
              <div className="text-[11px] font-medium mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Active drivers & transfers
              </div>
            </div>

            {/* Ad Spend & ROAS */}
            <div className="card-glass p-5 hover:shadow-ocean/15 hover:-translate-y-1 transition-all duration-200 border-t-4 border-t-ocean">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Marketing ROAS</span>
                <div className="p-2 rounded-xl bg-ocean/10 text-ocean border border-ocean/20">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-ocean">
                {metrics.roas}x
              </div>
              <div className="text-[11px] font-medium mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Spend: AED {Number(metrics.total_ad_spend).toLocaleString()}
              </div>
            </div>
          </div>

          {/* 2-COLUMN SECTION: REVENUE PERFORMANCE CHART & SERVICE BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            
            {/* Monthly Revenue Performance Chart */}
            <div className="lg:col-span-2 card-glass p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                      Revenue & Bookings Trend
                    </h2>
                    <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      Monthly gross revenue vs advertising expenditure
                    </p>
                  </div>
                  
                  {/* Period Switcher */}
                  <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold">
                    {['7d', '30d', 'ytd'].map(p => (
                      <button
                        key={p}
                        onClick={() => setChartPeriod(p)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          chartPeriod === p 
                            ? 'bg-ocean text-white shadow-sm' 
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Visual Bar Chart */}
                <div className="pt-6 pb-2">
                  <div className="flex items-end justify-between gap-4 h-48 px-2 border-b border-black/10 dark:border-white/10">
                    {revenueChartData.map((item, idx) => {
                      const heightPct = Math.round((item.revenue / (maxRevenue || 1)) * 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar relative">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-14 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black/80 dark:bg-slate-900/90 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20 border border-ocean/30">
                            <div>Revenue: {formatCurrency(item.revenue)}</div>
                            <div className="text-slate-300 font-normal text-[10px]">{item.bookings} confirmed bookings</div>
                          </div>

                          {/* Bar Stack */}
                          <div className="w-full max-w-[48px] bg-black/5 dark:bg-white/5 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                            <div 
                              className="w-full bg-gradient-to-t from-ocean-dark via-ocean to-ocean-light rounded-t-xl transition-all duration-700 group-hover/bar:brightness-110 shadow-lg shadow-ocean/20"
                              style={{ height: `${heightPct}%` }}
                            ></div>
                          </div>

                          <span className="text-xs font-extrabold mt-1" style={{ color: 'var(--color-text-main)' }}>
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Chart Legend & Summary */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-black/5 dark:border-white/5 text-xs font-semibold">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-ocean"></span>
                    <span style={{ color: 'var(--color-text-main)' }}>Gross Revenue (AED)</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-ocean/20 border border-ocean/40"></span>
                    <span style={{ color: 'var(--color-text-muted)' }}>Target Benchmark</span>
                  </span>
                </div>
                <div className="text-ocean font-extrabold">
                  Average Order Value: AED 4,250
                </div>
              </div>
            </div>

            {/* Service & Acquisition Breakdown */}
            <div className="card-glass p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--color-text-main)' }}>
                  Service Revenue Share
                </h2>
                <p className="text-xs font-medium mb-6" style={{ color: 'var(--color-text-muted)' }}>
                  Distribution across key agency offerings
                </p>

                <div className="space-y-4">
                  {serviceBreakdown.map(service => (
                    <div key={service.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="truncate max-w-[180px]" style={{ color: 'var(--color-text-main)' }}>{service.name}</span>
                        <span className="text-ocean">{service.percentage}% <span className="font-normal text-[11px]" style={{ color: 'var(--color-text-muted)' }}>({service.aed})</span></span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                        <div className={`h-full ${service.color} rounded-full transition-all duration-500`} style={{ width: `${service.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Copilot Telemetry Banner */}
              <div className="mt-6 p-4 rounded-xl border border-ocean/30 bg-gradient-to-r from-ocean/10 via-purple-500/10 to-transparent">
                <div className="flex items-center gap-2 text-xs font-bold text-ocean mb-1">
                  <Sparkles size={14} /> AI Recommendation
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-main)' }}>
                  Mega Yacht Charters show a 42% surge for weekend sunset slots. Consider creating an automated paid Meta campaign.
                </p>
              </div>
            </div>
          </div>

          {/* 2-COLUMN SECTION: RECENT LEADS & LIVE OPERATIONS DISPATCH */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 relative z-10">
            
            {/* Recent Leads Pipeline Feed */}
            <div className="card-glass p-4 sm:p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                    <span>🎯</span> Recent Enquiries & Leads
                  </h2>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Incoming travel requests awaiting conversion
                  </p>
                </div>
                <Link to="/leads" className="text-xs font-bold text-ocean hover:underline flex items-center gap-1">
                  View Pipeline <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-3 flex-1">
                {recentLeads.length === 0 ? (
                  <p className="text-center italic py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No recent leads found.</p>
                ) : (
                  recentLeads.map(lead => {
                    const leadName = lead.source_details?.name || lead.name || (lead.Customer ? `${lead.Customer.first_name} ${lead.Customer.last_name}` : 'Enquiry Guest');
                    return (
                      <div 
                        key={lead.id} 
                        onClick={() => navigate('/leads')}
                        className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-ocean/40 hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-ocean/10 text-ocean flex items-center justify-center font-extrabold text-sm shrink-0 border border-ocean/20">
                            {leadName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm group-hover:text-ocean transition-colors" style={{ color: 'var(--color-text-main)' }}>
                              {leadName}
                            </p>
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                              {lead.service_interest || 'General Travel'} • {lead.source || 'Website'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ocean/10 text-ocean border border-ocean/20">
                            {lead.status}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                            {new Date(lead.createdAt || lead.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Operational Fleet & Dispatches */}
            <div className="card-glass p-4 sm:p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                    <span>🚖</span> Live Dispatch & Operations
                  </h2>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Active transfers, excursions, and assigned drivers
                  </p>
                </div>
                <Link to="/operations" className="text-xs font-bold text-ocean hover:underline flex items-center gap-1">
                  Dispatch Hub <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-3 flex-1">
                {activeJobs.length === 0 ? (
                  <p className="text-center italic py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No active transfers currently dispatched.</p>
                ) : (
                  activeJobs.map(job => {
                    const booking = job.Booking || job.booking_id || {};
                    const driver = job.Driver || job.driver_id || {};
                    return (
                      <div 
                        key={job.id} 
                        onClick={() => navigate('/operations')}
                        className="p-3.5 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-ocean/40 hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="space-y-1 max-w-[70%]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ocean">{booking.service_type || 'Transfer'}</span>
                            <span className="text-xs text-slate-400">• Driver: {driver.name || 'Assigned'}</span>
                          </div>
                          <div className="flex items-center text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                            <MapPin size={12} className="mr-1 text-slate-400 shrink-0" />
                            <span className="truncate">{booking.pickup_location || 'Dubai Marina'} &rarr; {booking.dropoff_location || 'Destination'}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                            {job.status?.replace('_', ' ') || 'ACTIVE'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* UPCOMING VIP BOOKINGS FULL-WIDTH CARD */}
          <div className="card-glass p-4 sm:p-6 relative z-10 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                  <span>✈️</span> Confirmed Upcoming Itineraries
                </h2>
                <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Scheduled client tours, hotel stays, and yacht rentals
                </p>
              </div>
              <Link to="/bookings" className="text-xs font-bold text-ocean hover:underline flex items-center gap-1">
                View All Bookings <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left border-collapse">
                <thead className="table-glass-header">
                  <tr>
                    <th className="p-3.5 font-bold">Booking #</th>
                    <th className="p-3.5 font-bold">Customer / Guest</th>
                    <th className="p-3.5 font-bold">Service Package</th>
                    <th className="p-3.5 font-bold">Travel Date</th>
                    <th className="p-3.5 font-bold">Price (AED)</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
                  {upcomingBookings.length === 0 ? (
                    <tr><td colSpan="7" className="p-6 text-center text-slate-400 italic">No bookings recorded yet.</td></tr>
                  ) : (
                    upcomingBookings.map(b => (
                      <tr key={b.id} className="table-glass-row">
                        <td className="p-3.5 font-extrabold" style={{ color: 'var(--color-text-main)' }}>
                          {b.booking_number || 'BK-1001'}
                        </td>
                        <td className="p-3.5" style={{ color: 'var(--color-text-main)' }}>
                          <div className="font-semibold">{(b.Customer || b.customer_id)?.first_name} {(b.Customer || b.customer_id)?.last_name || 'Guest'}</div>
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{(b.Customer || b.customer_id)?.phone || 'N/A'}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-ocean">
                          {b.service_type}
                        </td>
                        <td className="p-3.5" style={{ color: 'var(--color-text-main)' }}>
                          {b.service_date ? new Date(b.service_date).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="p-3.5 font-bold text-ocean">
                          {formatCurrency(b.financials?.customer_price || b.customer_price)}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 text-xs rounded-full font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase">
                            {b.status || 'CONFIRMED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button 
                            onClick={() => navigate('/bookings')}
                            className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-ocean hover:text-white transition-all text-xs font-bold"
                            style={{ color: 'var(--color-text-main)' }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* QUICK LEAD CAPTURE MODAL */}
      {isQuickLeadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsQuickLeadModalOpen(false)}></div>
          
          <div className="card-glass w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl overflow-hidden relative z-10" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            <div className="bg-gradient-to-r from-ocean-dark to-ocean p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-1.5">
                  <Sparkles size={18} /> Quick Lead Capture
                </h3>
                <p className="text-blue-100 text-xs mt-0.5">Quickly log an inbound phone call or walk-in enquiry.</p>
              </div>
              <button onClick={() => setIsQuickLeadModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickLeadSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sheikh Rashid or Alex Vance"
                  className="input-glass text-sm"
                  value={quickLeadForm.customerName}
                  onChange={e => setQuickLeadForm({ ...quickLeadForm, customerName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50..."
                    className="input-glass text-sm"
                    value={quickLeadForm.phone}
                    onChange={e => setQuickLeadForm({ ...quickLeadForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="client@mail.com"
                    className="input-glass text-sm"
                    value={quickLeadForm.email}
                    onChange={e => setQuickLeadForm({ ...quickLeadForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Service Interest</label>
                <select
                  className="input-glass text-sm"
                  value={quickLeadForm.serviceInterest}
                  onChange={e => setQuickLeadForm({ ...quickLeadForm, serviceInterest: e.target.value })}
                >
                  <option value="Luxury Yacht Rental">Luxury Yacht Rental</option>
                  <option value="VIP Desert Dune Safari">VIP Desert Dune Safari</option>
                  <option value="5-Star Hotel & Villa Stays">5-Star Hotel & Villa Stays</option>
                  <option value="Helicopter Aerial Tour">Helicopter Aerial Tour</option>
                  <option value="Rolls Royce Airport Chauffeur">Rolls Royce Airport Chauffeur</option>
                  <option value="Corporate Retreat">Corporate Retreat</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button type="button" onClick={() => setIsQuickLeadModalOpen(false)} className="btn-outline text-sm">Cancel</button>
                <button type="submit" className="btn-primary text-sm">Save to Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Send,
  Image as ImageIcon,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp
} from 'lucide-react';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';

export const ContentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, published: 0, drafts: 0, engagement: 0, estimated_reach: 0 });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Filters
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for Create / Edit
  const [isEditing, setIsEditing] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    platform: 'Instagram',
    scheduled_date: new Date().toISOString().slice(0, 16),
    status: 'Scheduled',
    media_url: '',
    hashtags: '#OceanGate #Dubai #LuxuryTravel',
    author: 'Marketing Team'
  });

  const fetchPosts = async () => {
    try {
      setSyncing(true);
      const res = await api.get('/content-posts', {
        params: {
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
          platform: platformFilter !== 'All' ? platformFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined
        }
      });
      if (res.success && res.data) {
        setPosts(res.data.posts || []);
        setStats(res.data.stats || { total: 0, scheduled: 0, published: 0, drafts: 0, engagement: 0, estimated_reach: 0 });
      }
    } catch (error) {
      console.error('Failed to load content posts:', error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentDate, platformFilter, statusFilter]);

  // Calendar Grid Calculation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null); // empty padding
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group posts by day number for the current month
  const postsByDate = {};
  posts.forEach(post => {
    if (!post.scheduled_date) return;
    const pDate = new Date(post.scheduled_date);
    if (pDate.getFullYear() === currentDate.getFullYear() && pDate.getMonth() === currentDate.getMonth()) {
      const dayNum = pDate.getDate();
      if (!postsByDate[dayNum]) postsByDate[dayNum] = [];
      postsByDate[dayNum].push(post);
    }
  });

  const getPlatformBadge = (platform) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('instagram')) return { name: 'Instagram', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20', icon: '📸' };
    if (p.includes('tiktok')) return { name: 'TikTok', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: '🎵' };
    if (p.includes('google')) return { name: 'Google', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: '🔍' };
    if (p.includes('linkedin')) return { name: 'LinkedIn', color: 'bg-blue-600/10 text-blue-500 border-blue-500/20', icon: '💼' };
    if (p.includes('youtube')) return { name: 'YouTube', color: 'bg-red-600/10 text-red-500 border-red-600/20', icon: '▶️' };
    return { name: 'Meta', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🔵' };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Scheduled':
        return 'bg-ocean/10 text-ocean border-ocean/30';
      case 'Draft':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleDayClick = (dayDate) => {
    if (!dayDate) return;
    const dateStr = dayDate.toISOString().slice(0, 10);
    setPostForm({
      title: '',
      content: '',
      platform: 'Instagram',
      scheduled_date: `${dateStr}T10:00`,
      status: 'Scheduled',
      media_url: '',
      hashtags: '#OceanGate #Dubai #LuxuryTravel',
      author: 'Marketing Team'
    });
    setAiTopic('');
    setIsEditing(false);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (post) => {
    setSelectedPost(post);
    setPostForm({
      title: post.title,
      content: post.content || '',
      platform: post.platform || 'Instagram',
      scheduled_date: new Date(post.scheduled_date).toISOString().slice(0, 16),
      status: post.status || 'Scheduled',
      media_url: post.media_url || '',
      hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(' ') : (post.hashtags || ''),
      author: post.author || 'Marketing Team'
    });
    setIsEditing(true);
    setIsDetailModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.scheduled_date) return;

    try {
      const payload = {
        ...postForm,
        hashtags: typeof postForm.hashtags === 'string' ? postForm.hashtags.split(/[\s,]+/).filter(Boolean) : postForm.hashtags
      };

      if (isEditing && selectedPost) {
        await api.put(`/content-posts/${selectedPost.id}`, payload);
      } else {
        await api.post('/content-posts', payload);
      }

      setIsCreateModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save post. Please try again.');
    }
  };

  const handlePublishNow = async (postId) => {
    try {
      const res = await api.post(`/content-posts/${postId}/publish`);
      if (res.success) {
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(res.data);
        }
        fetchPosts();
      }
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post.');
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/content-posts/${postToDelete.id}`);
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
      setIsDetailModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim()) {
      alert('Please enter a topic or concept for the AI post.');
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await api.post('/content-posts/ai-generate', {
        topic: aiTopic,
        platform: postForm.platform
      });
      if (res.success && res.data) {
        setPostForm(prev => ({
          ...prev,
          title: res.data.title || prev.title,
          content: res.data.content || prev.content,
          media_url: res.data.media_url || prev.media_url,
          hashtags: Array.isArray(res.data.hashtags) ? res.data.hashtags.join(' ') : (res.data.hashtags || prev.hashtags)
        }));
      }
    } catch (error) {
      console.error('AI post generation failed:', error);
      alert('AI generation encountered an issue. Using fallback template.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-ocean/10 text-ocean px-2.5 py-1 rounded-full uppercase tracking-wider">
              Marketing Ops
            </span>
            <span className="text-xs text-slate-400">• Editorial & Social Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--color-text-main)' }}>Content Calendar</h1>
          <p className="font-medium mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Plan, generate with AI, schedule, and publish organic & paid multi-platform campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosts}
            disabled={syncing}
            className="btn-outline flex items-center gap-2 text-sm"
            title="Refresh from Database"
          >
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Calendar'}
          </button>

          <button
            onClick={() => {
              setPostForm({
                title: '',
                content: '',
                platform: 'Instagram',
                scheduled_date: new Date().toISOString().slice(0, 16),
                status: 'Scheduled',
                media_url: '',
                hashtags: '#OceanGate #Dubai #LuxuryTravel',
                author: 'Marketing Team'
              });
              setAiTopic('');
              setIsEditing(false);
              setIsCreateModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-ocean/20"
          >
            <Plus size={18} /> Schedule Post
          </button>
        </div>
      </div>

      {/* Background Automation Telemetry Banner */}
      <div className="card-glass p-4 mb-6 relative z-10 border border-ocean/30 rounded-2xl bg-gradient-to-r from-ocean/10 via-purple-500/10 to-transparent flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-ocean text-white shadow-md shadow-ocean/30 shrink-0">
            <Sparkles size={18} className="animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm" style={{ color: 'var(--color-text-main)' }}>Autonomous Social Publisher Daemon</h4>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                Active (30s Cycle)
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Posts set to <span className="font-bold text-ocean">"Scheduled"</span> will automatically broadcast to Instagram, Meta, and TikTok when their date/time arrives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" style={{ color: 'var(--color-text-main)' }}>
            Scheduled Queue: <span className="font-extrabold text-ocean">{stats.scheduled}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" style={{ color: 'var(--color-text-main)' }}>
            Auto-Published: <span className="font-extrabold text-green-500">{stats.published}</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 relative z-10">
        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Scheduled</span>
            <Clock size={16} className="text-ocean" />
          </div>
          <div className="text-2xl font-bold text-ocean">{stats.scheduled}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for auto-publish</div>
        </div>

        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Published</span>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-500">{stats.published}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live on social channels</div>
        </div>

        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Drafts</span>
            <Edit3 size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.drafts}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In review & editing</div>
        </div>

        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total Reach</span>
            <Eye size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>
            {(stats.estimated_reach || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Estimated impressions</div>
        </div>

        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow border-t-4 border-t-ocean">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Engagement</span>
            <TrendingUp size={16} className="text-ocean" />
          </div>
          <div className="text-2xl font-bold text-ocean">
            {(stats.engagement || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Likes, shares & comments</div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="card-glass p-6 relative z-10 overflow-hidden">

        {/* Calendar Navigation & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-black/5 dark:border-white/5">

          {/* Month Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-bold rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
              {monthName}
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase mr-1" style={{ color: 'var(--color-text-muted)' }}>Platform:</span>
            {['All', 'Instagram', 'Meta', 'TikTok', 'Google', 'LinkedIn'].map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${platformFilter === p
                    ? 'bg-ocean text-white border-ocean shadow-md shadow-ocean/20'
                    : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-400 hover:text-white'
                  }`}
              >
                {p}
              </button>
            ))}

            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1"></div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-glass text-xs py-1 px-3 rounded-lg"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Days of Week Header & Calendar Day Grid */}
        <div className="overflow-x-auto -mx-3.5 px-3.5 sm:mx-0 sm:px-0 pb-2 custom-scrollbar">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-7 gap-3 mb-3 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-xs font-extrabold uppercase tracking-wider py-1" style={{ color: 'var(--color-text-muted)' }}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {days.map((dayDate, index) => {
                if (!dayDate) {
                  return <div key={`empty-${index}`} className="min-h-[140px] rounded-xl bg-transparent opacity-20 border border-dashed border-black/5 dark:border-white/5"></div>;
                }

                const dayNum = dayDate.getDate();
                const isToday = dayDate.toDateString() === new Date().toDateString();
                const dayPosts = postsByDate[dayNum] || [];

                return (
                  <div
                    key={dayNum}
                    onClick={() => handleDayClick(dayDate)}
                    className={`min-h-[140px] rounded-xl p-2.5 border transition-all flex flex-col group cursor-pointer ${isToday
                        ? 'border-ocean bg-ocean/5 shadow-[0_0_15px_rgba(0,174,239,0.15)]'
                        : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-ocean/40 hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-ocean text-white' : ''
                        }`} style={{ color: isToday ? '#ffffff' : 'var(--color-text-main)' }}>
                        {dayNum}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(dayDate);
                        }}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded-md bg-ocean/20 text-ocean hover:bg-ocean hover:text-white transition-all text-xs"
                        title="Add post on this date"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Day Posts List */}
                    <div className="space-y-1.5 overflow-y-auto flex-1 max-h-[160px] pr-0.5">
                  {dayPosts.map(post => {
                    const badge = getPlatformBadge(post.platform);
                    const statusClass = getStatusBadge(post.status);
                    const postTime = new Date(post.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-[var(--color-card-bg)] hover:shadow-md hover:border-ocean/40 transition-all text-left group/item"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {post.media_url ? (
                            <img src={post.media_url} alt="" className="w-5 h-5 rounded object-cover shrink-0 border border-black/10" />
                          ) : (
                            <span className="text-[10px]">{badge.icon}</span>
                          )}
                          <span className="text-[10px] font-bold truncate flex-1" style={{ color: 'var(--color-text-main)' }}>
                            {post.title}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[9px]">
                          <span style={{ color: 'var(--color-text-muted)' }}>{postTime}</span>
                          <span className={`px-1.5 py-0.2 rounded font-bold border ${statusClass}`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>

      </div>

      {/* CREATE / EDIT POST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-hidden animate-fade-in">
          <div className="card-glass w-full max-w-2xl max-h-[88vh] flex flex-col border border-ocean/30 shadow-2xl rounded-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-5 pb-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center shrink-0 bg-[var(--color-card-bg)]">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
                  {isEditing ? '✏️ Edit Scheduled Post' : '✍️ Schedule New Content'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {isEditing ? 'Update copy, media, or schedule time' : 'Create organic or paid post across connected channels'}
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* AI Assistant Quick Bar */}
              <div className="p-4 rounded-xl border border-ocean/30 bg-gradient-to-r from-ocean/10 via-purple-500/10 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-ocean" />
                  <span className="text-xs font-bold uppercase text-ocean">OceanGate AI Copilot</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter a topic, e.g. Weekend Yacht Charter 30% off, Sunset Safari..."
                    className="input-glass flex-1 text-sm py-2"
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateWithAi(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={isAiGenerating}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shrink-0"
                  >
                    {isAiGenerating ? (
                      <><div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div> Drafting...</>
                    ) : (
                      <>✨ AI Draft & Render</>
                    )}
                  </button>
                </div>
              </div>

              <form id="postScheduleForm" onSubmit={handleSavePost} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Platform</label>
                    <select
                      className="input-glass text-sm"
                      value={postForm.platform}
                      onChange={e => setPostForm({ ...postForm, platform: e.target.value })}
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Meta">Facebook (Meta)</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Google">Google Business / Ads</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="YouTube">YouTube Shorts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Schedule Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="input-glass text-sm"
                      value={postForm.scheduled_date}
                      onChange={e => setPostForm({ ...postForm, scheduled_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Post Title / Hook</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Sunset Yacht Charter"
                    className="input-glass text-sm"
                    value={postForm.title}
                    onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Caption / Post Copy</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Write captivating copy..."
                    className="input-glass text-sm leading-relaxed"
                    value={postForm.content}
                    onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Hashtags</label>
                  <input
                    type="text"
                    placeholder="#Dubai #YachtRental #OceanGate"
                    className="input-glass text-sm"
                    value={postForm.hashtags}
                    onChange={e => setPostForm({ ...postForm, hashtags: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Media Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://..."
                      className="input-glass text-sm flex-1"
                      value={postForm.media_url}
                      onChange={e => setPostForm({ ...postForm, media_url: e.target.value })}
                    />
                    {postForm.media_url && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-ocean/30">
                        <img src={postForm.media_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                    <select
                      className="input-glass text-sm"
                      value={postForm.status}
                      onChange={e => setPostForm({ ...postForm, status: e.target.value })}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Author / Assignee</label>
                    <input
                      type="text"
                      className="input-glass text-sm"
                      value={postForm.author}
                      onChange={e => setPostForm({ ...postForm, author: e.target.value })}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 shrink-0 bg-[var(--color-card-bg)]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn-outline text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="postScheduleForm"
                className="btn-primary text-sm py-2 px-6"
              >
                {isEditing ? 'Save Changes' : 'Schedule Post'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POST DETAILS & SOCIAL CARD PREVIEW MODAL */}
      {isDetailModalOpen && selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-hidden animate-fade-in">
          <div className="card-glass w-full max-w-xl max-h-[88vh] flex flex-col border border-ocean/30 shadow-2xl rounded-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="p-5 pb-4 border-b border-black/10 dark:border-white/10 flex justify-between items-start shrink-0 bg-[var(--color-card-bg)]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${getPlatformBadge(selectedPost.platform).color}`}>
                  <span className="text-xl">{getPlatformBadge(selectedPost.platform).icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>{selectedPost.platform} Post</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedPost.status)}`}>
                      {selectedPost.status}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Scheduled for {new Date(selectedPost.scheduled_date).toLocaleString()} • by {selectedPost.author || 'Marketing Team'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Social Post Visual Mockup */}
              <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-black/10 dark:bg-white/5">
                {selectedPost.media_url && (
                  <div className="w-full h-64 relative bg-black">
                    <img src={selectedPost.media_url} alt="Post Visual" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <h3 className="font-extrabold text-base" style={{ color: 'var(--color-text-main)' }}>
                    {selectedPost.title}
                  </h3>

                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-main)' }}>
                    {selectedPost.content}
                  </p>

                  {selectedPost.hashtags && (
                    <div className="text-xs font-semibold text-ocean">
                      {Array.isArray(selectedPost.hashtags) ? selectedPost.hashtags.join(' ') : selectedPost.hashtags}
                    </div>
                  )}

                  {/* Simulated engagement stats if published */}
                  {selectedPost.status === 'Published' && selectedPost.engagement && (
                    <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-pink-500 font-bold"><Heart size={14} /> {selectedPost.engagement.likes || 0}</span>
                        <span className="flex items-center gap-1 text-ocean font-bold"><MessageCircle size={14} /> {selectedPost.engagement.comments || 0}</span>
                        <span className="flex items-center gap-1 text-purple-400 font-bold"><Share2 size={14} /> {selectedPost.engagement.shares || 0}</span>
                      </div>
                      <span className="text-slate-400">Reach: {(selectedPost.engagement.reach || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center shrink-0 bg-[var(--color-card-bg)]">
              <button
                onClick={() => {
                  setPostToDelete(selectedPost);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenEdit(selectedPost)}
                  className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Edit3 size={14} /> Edit / Reschedule
                </button>

                {selectedPost.status !== 'Published' && (
                  <button
                    onClick={() => handlePublishNow(selectedPost.id)}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 bg-green-600 border-green-600 shadow-green-600/20"
                  >
                    <Send size={14} /> Publish Now
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
        title="Delete Content Post"
        itemName={postToDelete ? `${postToDelete.title} (${postToDelete.platform})` : ''}
        itemType="content_post"
        itemData={postToDelete}
        isDeleting={isDeleting}
      />

    </Layout>
  );
};

import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Upload, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Eye,
  Tag,
  Plus
} from 'lucide-react';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';

export const MediaLibrary = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Generator Form State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState('Yacht Rentals');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    name: '',
    url: '',
    category: 'Hotels',
    source: 'Manual',
    tags: 'dubai, luxury',
    dimensions: '1920x1080'
  });

  const categories = ['All', 'Hotels', 'Tours', 'Yacht Rentals', 'Chauffeur', 'UGC', 'AI Generated'];

  const quickPrompts = [
    { label: '🛥️ Marina Yacht Sunset', prompt: 'Luxury 120ft mega yacht cruising Dubai Marina during golden hour sunset', cat: 'Yacht Rentals' },
    { label: '🏜️ Arabian Dune Safari', prompt: 'High-end red sand desert safari with luxury Bedouin camp and fire pit under stars', cat: 'Tours' },
    { label: '🚁 Helicopter Palm View', prompt: 'Helicopter aerial view flying over Palm Jumeirah and Burj Al Arab in crystal daylight', cat: 'Tours' },
    { label: '🚘 Rolls Royce Chauffeur', prompt: 'Black luxury Rolls Royce Phantom waiting outside Dubai International Airport VIP terminal', cat: 'Chauffeur' },
    { label: '🏨 Presidential Suite', prompt: 'Ultra-luxurious 5-star Dubai hotel penthouse suite with private infinity pool overlooking skyline', cat: 'Hotels' }
  ];

  const fetchAssets = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/assets');
      setAssets(res.data || []);
    } catch (error) {
      console.error("Failed to load assets", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateAiAsset = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiGenerating(true);
    try {
      const res = await api.post('/assets/ai-generate', {
        prompt: aiPrompt,
        category: aiCategory,
        name: aiPrompt.slice(0, 40)
      });
      if (res.success && res.data) {
        setAiPreview(res.data);
        await fetchAssets();
        setTimeout(() => {
          setIsAiModalOpen(false);
          setAiPreview(null);
          setAiPrompt('');
        }, 1500);
      }
    } catch (error) {
      console.error('AI Asset generation error:', error);
      alert('Failed to generate AI asset.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUploadAsset = async (e) => {
    e.preventDefault();
    if (!uploadForm.url || !uploadForm.name) return;

    try {
      const payload = {
        name: uploadForm.name,
        url: uploadForm.url,
        fileUrl: uploadForm.url,
        category: uploadForm.category,
        source: uploadForm.source,
        tags: uploadForm.tags.split(/[\s,]+/).filter(Boolean),
        dimensions: uploadForm.dimensions || '1920x1080'
      };

      await api.post('/assets', payload);
      setIsUploadModalOpen(false);
      setUploadForm({
        name: '',
        url: '',
        category: 'Hotels',
        source: 'Manual',
        tags: 'dubai, luxury',
        dimensions: '1920x1080'
      });
      await fetchAssets();
    } catch (error) {
      console.error('Failed to upload asset:', error);
      alert('Failed to save asset.');
    }
  };

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/assets/${assetToDelete.id}`);
      setIsDeleteModalOpen(false);
      setAssetToDelete(null);
      setIsDetailModalOpen(false);
      await fetchAssets();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Assets
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = activeCategory === 'All' || asset.category === activeCategory;
    const matchesSource = sourceFilter === 'All' || asset.source === sourceFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (asset.name && asset.name.toLowerCase().includes(q)) ||
      (asset.category && asset.category.toLowerCase().includes(q)) ||
      (asset.tags && Array.isArray(asset.tags) && asset.tags.some(t => t.toLowerCase().includes(q)));
    return matchesCategory && matchesSource && matchesSearch;
  });

  // Calculate category count
  const getCategoryCount = (cat) => {
    if (cat === 'All') return assets.length;
    return assets.filter(a => a.category === cat).length;
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-ocean/10 text-ocean px-2.5 py-1 rounded-full uppercase tracking-wider">
              Brand Assets Hub
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">• High-Res Creatives & Renders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--color-text-main)' }}>Media Library</h1>
          <p className="font-medium mt-1 text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Centralized high-resolution photo repository and AI studio for all marketing campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchAssets}
            disabled={refreshing}
            className="btn-outline flex items-center gap-2 text-sm"
            title="Refresh Library"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Upload size={15} /> Add URL / Upload
          </button>

          <button 
            onClick={() => {
              setAiPrompt('');
              setAiPreview(null);
              setIsAiModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-ocean/20"
          >
            <Sparkles size={16} /> ✨ AI Studio Render
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 relative z-10">
        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total Assets</span>
            <Layers size={16} className="text-ocean" />
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>{assets.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for campaigns</div>
        </div>

        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>AI Generated</span>
            <Sparkles size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {assets.filter(a => a.source === 'AI' || a.category === 'AI Generated').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">4K cinematic renders</div>
        </div>

        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Yachts & Marine</span>
            <span className="text-base">🛥️</span>
          </div>
          <div className="text-2xl font-bold text-ocean">
            {assets.filter(a => a.category === 'Yacht Rentals').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Fleet visuals</div>
        </div>

        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Tours & Safaris</span>
            <span className="text-base">🏜️</span>
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {assets.filter(a => a.category === 'Tours').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Desert & aerial tours</div>
        </div>

        <div className="card-glass p-5 hover:shadow-ocean/10 transition-shadow border-t-4 border-t-ocean">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Hotels & VIP</span>
            <span className="text-base">🏨</span>
          </div>
          <div className="text-2xl font-bold text-green-500">
            {assets.filter(a => a.category === 'Hotels' || a.category === 'Chauffeur').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Luxury stays & transfers</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-glass p-4 mb-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name, tag, category..."
            className="input-glass w-full pl-10 text-sm py-2"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Source Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-muted)' }}>Source:</span>
          <select 
            className="input-glass text-xs py-1.5 px-3 rounded-lg"
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
          >
            <option value="All">All Sources</option>
            <option value="AI">AI Generated</option>
            <option value="Manual">Manual Upload</option>
          </select>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-2 mb-8 relative z-10 overflow-x-auto pb-2">
        {categories.map(cat => {
          const count = getCategoryCount(cat);
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive 
                  ? 'bg-ocean text-white border-ocean shadow-md shadow-ocean/25' 
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-400 hover:text-white hover:border-ocean/30'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ASSET GRID */}
      {loading ? (
        <div className="flex justify-center items-center py-24 relative z-10">
          <div className="animate-spin h-10 w-10 border-4 border-ocean border-t-transparent rounded-full mb-4"></div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="card-glass p-16 border-2 border-dashed border-black/10 dark:border-white/10 text-center relative z-10 flex flex-col items-center justify-center rounded-2xl">
          <div className="text-5xl mb-4 opacity-50">🖼️</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>No Media Assets Found</h3>
          <p className="max-w-md text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            No visual assets match your active filters. Generate a 4K visual with OceanGate AI or add images via URL.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setIsAiModalOpen(true)} className="btn-primary text-sm flex items-center gap-2">
              <Sparkles size={16} /> Generate with AI
            </button>
            <button onClick={() => setIsUploadModalOpen(true)} className="btn-outline text-sm flex items-center gap-2">
              <Upload size={16} /> Add Image URL
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          {filteredAssets.map(asset => {
            const displayUrl = asset.url || asset.fileUrl;
            const isCopied = copiedId === asset.id;

            return (
              <div 
                key={asset.id} 
                onClick={() => {
                  setSelectedAsset(asset);
                  setIsDetailModalOpen(true);
                }}
                className="card-glass overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-ocean/20 transition-all duration-300 hover:-translate-y-1.5 flex flex-col rounded-2xl border border-black/10 dark:border-white/10 hover:border-ocean/40"
              >
                {/* Image Container */}
                <div className="h-52 w-full bg-black/30 flex items-center justify-center overflow-hidden relative">
                  <img 
                    src={displayUrl} 
                    alt={asset.name || 'Brand Asset'} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-extrabold bg-black/70 backdrop-blur-md text-ocean px-2.5 py-1 rounded-md uppercase border border-ocean/30 shadow-md">
                      {asset.category}
                    </span>
                  </div>

                  {asset.source === 'AI' && (
                    <div className="absolute top-3 right-3 bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-purple-300 text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                      <Sparkles size={11} /> AI
                    </div>
                  )}

                  {/* Hover Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(displayUrl, asset.id);
                      }}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
                      title="Copy URL"
                    >
                      {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>

                    <a 
                      href={displayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
                      title="Open Full Image"
                    >
                      <ExternalLink size={16} />
                    </a>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssetToDelete(asset);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2.5 rounded-xl bg-red-500/30 hover:bg-red-500/50 text-red-300 backdrop-blur-sm transition-all"
                      title="Delete Asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm truncate mb-1" style={{ color: 'var(--color-text-main)' }} title={asset.name}>
                      {asset.name || 'Brand Asset'}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{asset.dimensions || '1920x1080'}</span>
                      <span>•</span>
                      <span>{asset.type || 'image'}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                    {asset.tags && Array.isArray(asset.tags) && asset.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="text-[9px] font-medium bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10" 
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        #{tag}
                      </span>
                    ))}
                    {asset.tags && asset.tags.length > 3 && (
                      <span className="text-[9px] text-slate-400 font-bold">+{asset.tags.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI GENERATOR STUDIO MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-hidden animate-fade-in">
          <div className="card-glass w-full max-w-2xl max-h-[88vh] flex flex-col border border-purple-500/30 shadow-2xl rounded-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="p-5 pb-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center shrink-0 bg-[var(--color-card-bg)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>AI Creative Visual Studio</h2>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Generate ultra-realistic 4K luxury marketing photography</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* Quick Inspiration Pills */}
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>Quick Concept Prompts</label>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map(qp => (
                    <button
                      key={qp.label}
                      type="button"
                      onClick={() => {
                        setAiPrompt(qp.prompt);
                        setAiCategory(qp.cat);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-ocean/40 hover:bg-ocean/10 hover:text-ocean transition-all"
                      style={{ color: 'var(--color-text-main)' }}
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              <form id="aiAssetForm" onSubmit={handleGenerateAiAsset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Creative Prompt / Description</label>
                  <textarea 
                    rows="3"
                    required
                    placeholder="e.g. Ultra-luxury 140ft yacht sailing past Dubai skyline at golden sunset, crystal turquoise water, 4k cinematic lighting..."
                    className="input-glass text-sm leading-relaxed"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Category</label>
                    <select 
                      className="input-glass text-sm"
                      value={aiCategory}
                      onChange={e => setAiCategory(e.target.value)}
                    >
                      <option value="Yacht Rentals">Yacht Rentals</option>
                      <option value="Tours">Tours & Desert Safari</option>
                      <option value="Hotels">Hotels & Stays</option>
                      <option value="Chauffeur">VIP Chauffeur & Transfers</option>
                      <option value="AI Generated">AI Concept</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Target Resolution</label>
                    <input 
                      type="text"
                      disabled
                      className="input-glass text-sm opacity-75"
                      value="1024x1024 (Ultra HD 4K)"
                    />
                  </div>
                </div>
              </form>

              {aiPreview && (
                <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 animate-fade-in flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-green-500/40">
                    <img src={aiPreview.url || aiPreview.fileUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-400">✨ Asset Rendered & Saved!</div>
                    <div className="text-xs text-slate-300 truncate max-w-sm">{aiPreview.name}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 shrink-0 bg-[var(--color-card-bg)]">
              <button 
                type="button" 
                onClick={() => setIsAiModalOpen(false)}
                className="btn-outline text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="aiAssetForm"
                disabled={aiGenerating}
                className="btn-primary text-sm py-2 px-6 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-ocean shadow-lg shadow-purple-600/20"
              >
                {aiGenerating ? (
                  <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Rendering 4K Visual...</>
                ) : (
                  <>✨ Generate & Save to Media</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* UPLOAD / ADD ASSET MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-hidden animate-fade-in">
          <div className="card-glass w-full max-w-lg max-h-[88vh] flex flex-col border border-ocean/30 shadow-2xl rounded-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="p-5 pb-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center shrink-0 bg-[var(--color-card-bg)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-ocean/10 text-ocean border border-ocean/20">
                  <Upload size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>Add Media Asset</h2>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Link an image URL or cloud asset</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <form id="uploadAssetForm" onSubmit={handleUploadAsset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Asset Title / Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Dubai Marina Sunset Cruise"
                    className="input-glass text-sm"
                    value={uploadForm.name}
                    onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Image URL (HTTPS)</label>
                  <input 
                    type="url" 
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input-glass text-sm"
                    value={uploadForm.url}
                    onChange={e => setUploadForm({ ...uploadForm, url: e.target.value })}
                  />
                  {uploadForm.url && (
                    <div className="mt-2 h-36 w-full rounded-xl overflow-hidden border border-ocean/30 bg-black/20">
                      <img src={uploadForm.url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Category</label>
                    <select 
                      className="input-glass text-sm"
                      value={uploadForm.category}
                      onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                    >
                      <option value="Hotels">Hotels</option>
                      <option value="Tours">Tours</option>
                      <option value="Yacht Rentals">Yacht Rentals</option>
                      <option value="Chauffeur">Chauffeur</option>
                      <option value="UGC">UGC / Social</option>
                      <option value="AI Generated">AI Generated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Dimensions</label>
                    <input 
                      type="text"
                      placeholder="1920x1080"
                      className="input-glass text-sm"
                      value={uploadForm.dimensions}
                      onChange={e => setUploadForm({ ...uploadForm, dimensions: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="dubai, yacht, marina, vip"
                    className="input-glass text-sm"
                    value={uploadForm.tags}
                    onChange={e => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 shrink-0 bg-[var(--color-card-bg)]">
              <button 
                type="button" 
                onClick={() => setIsUploadModalOpen(false)}
                className="btn-outline text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="uploadAssetForm"
                className="btn-primary text-sm py-2 px-6"
              >
                Save Asset
              </button>
            </div>

          </div>
        </div>
      )}

      {/* HIGH-RES IMAGE DETAIL INSPECTOR MODAL */}
      {isDetailModalOpen && selectedAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-hidden animate-fade-in">
          <div className="card-glass w-full max-w-3xl max-h-[90vh] flex flex-col border border-ocean/30 shadow-2xl rounded-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="p-5 pb-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center shrink-0 bg-[var(--color-card-bg)]">
              <div className="flex items-center gap-3">
                <span className="text-xl">🖼️</span>
                <div>
                  <h2 className="text-lg font-bold truncate max-w-md" style={{ color: 'var(--color-text-main)' }}>
                    {selectedAsset.name || 'Media Asset Details'}
                  </h2>
                  <div className="text-xs text-slate-400">
                    {selectedAsset.category} • {selectedAsset.dimensions || '1920x1080'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Image Preview */}
              <div className="w-full h-80 rounded-2xl overflow-hidden bg-black/50 border border-black/20 relative shadow-xl flex items-center justify-center">
                <img 
                  src={selectedAsset.url || selectedAsset.fileUrl} 
                  alt={selectedAsset.name} 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Asset Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs">
                <div>
                  <div className="font-bold text-slate-400 uppercase mb-1">Category</div>
                  <div className="font-semibold text-ocean">{selectedAsset.category}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-400 uppercase mb-1">Source</div>
                  <div className="font-semibold" style={{ color: 'var(--color-text-main)' }}>{selectedAsset.source || 'Manual'}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-400 uppercase mb-1">Dimensions</div>
                  <div className="font-semibold" style={{ color: 'var(--color-text-main)' }}>{selectedAsset.dimensions || '1920x1080'}</div>
                </div>
                <div>
                  <div className="font-bold text-slate-400 uppercase mb-1">Created</div>
                  <div className="font-semibold" style={{ color: 'var(--color-text-main)' }}>
                    {selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleDateString() : 'Active'}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedAsset.tags && Array.isArray(selectedAsset.tags) && selectedAsset.tags.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                    <Tag size={13} /> Asset Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAsset.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 bg-ocean/10 text-ocean border border-ocean/20 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center shrink-0 bg-[var(--color-card-bg)]">
              <button 
                onClick={() => {
                  setAssetToDelete(selectedAsset);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors"
              >
                <Trash2 size={15} /> Delete Asset
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleCopyUrl(selectedAsset.url || selectedAsset.fileUrl, selectedAsset.id)}
                  className="btn-outline text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {copiedId === selectedAsset.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copiedId === selectedAsset.id ? 'Copied Link!' : 'Copy Link'}
                </button>

                <a 
                  href={selectedAsset.url || selectedAsset.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  <Download size={14} /> Open Full HD
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAsset}
        title="Delete Media Asset"
        itemName={assetToDelete ? `${assetToDelete.name} (${assetToDelete.category})` : ''}
        itemType="media_asset"
        itemData={assetToDelete}
        isDeleting={isDeleting}
      />

    </Layout>
  );
};

import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { useSearchParams } from 'react-router-dom';
import { Trash2, Download } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { downloadJsonBackup } from '../../utils/backupUtils';

export const MarketingDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // AI Campaign Form State
  const [isDrafting, setIsDrafting] = useState(false);
  const [campaignPrompt, setCampaignPrompt] = useState({ objective: '', targetAudience: '', platform: 'Meta', budget: 1000 });
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const [pushStatus, setPushStatus] = useState('idle');
  const [saveStatus, setSaveStatus] = useState('idle');

  const fetchMarketingData = async () => {
    try {
      const res = await api.get('/marketing/dashboard');
      setData(res.data);
    } catch (error) {
      console.error("Failed to load marketing dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const openDeleteModal = (camp) => {
    setCampaignToDelete(camp);
    setDeleteModalOpen(true);
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/campaigns/${campaignToDelete.id}`);
      setDeleteModalOpen(false);
      setCampaignToDelete(null);
      await fetchMarketingData();
    } catch (error) {
      console.error("Failed to delete campaign", error);
      alert("Failed to delete campaign.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportAll = () => {
    if (data?.campaigns) {
      downloadJsonBackup(data.campaigns, 'oceangate_all_campaigns_backup');
    }
  };

  const handleDraftCampaign = async (e) => {
    e.preventDefault();
    if (!campaignPrompt.objective) return;
    
    setIsDrafting(true);
    setPushStatus('idle');
    setSaveStatus('idle');
    
    try {
      const res = await api.post('/ai/generate-copy', campaignPrompt);
      if (res.success && res.data) {
        setGeneratedDraft(res.data);
      } else {
        alert('Failed to generate ad copy.');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Error generating ad copy.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSaveToCrm = async () => {
    if (!generatedDraft) return;
    setSaveStatus('saving');
    try {
      const payload = {
        name: campaignPrompt.objective || generatedDraft.headline,
        objective: campaignPrompt.objective,
        offerTitle: generatedDraft.headline,
        targetOrigin: campaignPrompt.targetAudience,
        targetAudience: campaignPrompt.targetAudience,
        targetDestination: 'Dubai, UAE',
        totalBudget: Number(campaignPrompt.budget) || 1000,
        budget: Number(campaignPrompt.budget) || 1000,
        channels: [campaignPrompt.platform],
        platform: campaignPrompt.platform,
        status: 'Draft',
        aiCreative: generatedDraft
      };

      const campRes = await api.post('/campaigns', payload);

      // Also save AI image asset to Media Library if present
      if (generatedDraft.image_url && campRes?.data?.id) {
        try {
          await api.post('/assets', {
            fileUrl: generatedDraft.image_url,
            type: 'image',
            category: 'AI Generated',
            source: 'AI',
            tags: ['ai', campaignPrompt.platform.toLowerCase(), 'campaign_' + campRes.data.id],
            dimensions: '1024x1024',
            owner: 'System'
          });
        } catch (assetErr) {
          console.warn("Could not save asset to library:", assetErr);
        }
      }

      setSaveStatus('saved');
      await fetchMarketingData();

      setTimeout(() => {
        setSaveStatus('idle');
        setGeneratedDraft(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to save campaign:', error);
      alert('Failed to save campaign to database.');
      setSaveStatus('idle');
    }
  };

  const handleSimulateConversion = async (campaignId) => {
    try {
      const res = await api.post('/marketing/simulate-conversion', { campaign_id: campaignId });
      if (res.success) {
        await fetchMarketingData();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert('Failed to simulate conversion');
    }
  };

  const handlePushToAds = async () => {
    setPushStatus('pushing');
    try {
      const payload = {
        platform: campaignPrompt.platform,
        draft: generatedDraft,
        name: campaignPrompt.objective || generatedDraft?.headline,
        objective: campaignPrompt.objective,
        targetAudience: campaignPrompt.targetAudience,
        budget: Number(campaignPrompt.budget) || 1000
      };
      
      const response = await api.post('/marketing/push', payload);
      
      if (response.success) {
        setPushStatus('success');
        
        // Refresh full real data from database
        await fetchMarketingData();

        // Reset after 2.5 seconds
        setTimeout(() => {
          setPushStatus('idle');
          setGeneratedDraft(null);
        }, 2500);
      } else {
        setPushStatus('error');
        alert(response.message || 'Failed to push campaign');
      }
    } catch (err) {
      console.error("Failed to push to ads:", err);
      alert("Error pushing to Ads Manager");
      setPushStatus('idle');
    }
  };

  return (
    <Layout>
      {searchParams.get('connected') && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 text-green-600 rounded-xl flex items-center">
          <span className="mr-2">✅</span> Successfully connected {searchParams.get('connected').toUpperCase()} Ads account!
        </div>
      )}
      {searchParams.get('error') && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl flex items-center">
          <span className="mr-2">❌</span> Failed to connect account: {searchParams.get('error')}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--color-text-main)' }}>Marketing & Ads Command Center</h1>
          <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>Meta Ads + Google Ads + CRM attribution in one owner dashboard</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <a href="/api/oauth/meta/login" className="btn-outline flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Connect Meta
          </a>
          <a href="/api/oauth/google/login" className="btn-outline flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
            Connect Google
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 relative z-10">
        <div className="card-glass p-4 sm:p-6 hover:shadow-ocean/10 transition-shadow">
          <div className="text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>Ad Spend</div>
          <div className="text-xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-main)' }}>{loading ? '...' : data?.stats?.spend}</div>
        </div>
        <div className="card-glass p-4 sm:p-6 hover:shadow-ocean/10 transition-shadow">
          <div className="text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>Leads</div>
          <div className="text-xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-main)' }}>{loading ? '...' : data?.stats?.leads}</div>
        </div>
        <div className="card-glass p-4 sm:p-6 hover:shadow-ocean/10 transition-shadow">
          <div className="text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>Bookings</div>
          <div className="text-xl sm:text-3xl font-bold" style={{ color: 'var(--color-text-main)' }}>{loading ? '...' : data?.stats?.bookings}</div>
        </div>
        <div className="card-glass p-4 sm:p-6 hover:shadow-ocean/10 transition-shadow">
          <div className="text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>Revenue</div>
          <div className="text-xl sm:text-3xl font-bold text-green-500">{loading ? '...' : data?.stats?.revenue}</div>
        </div>
        <div className="card-glass p-4 sm:p-6 hover:shadow-ocean/10 transition-shadow border-t-4 border-t-ocean col-span-2 sm:col-span-1">
          <div className="text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>ROAS</div>
          <div className="text-xl sm:text-3xl font-bold text-ocean">{loading ? '...' : `${data?.stats?.roas}x`}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
        <div className="lg:col-span-2 card-glass p-4 sm:p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl" style={{ color: 'var(--color-text-main)' }}>Active Campaigns</h3>
            <button 
              className="btn-outline flex items-center gap-2 text-xs py-1.5 px-3"
              onClick={handleExportAll}
              title="Download Full Campaigns Snapshot (JSON)"
            >
              <Download size={14} /> Export Campaigns
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="table-glass-header">
                <tr>
                  <th className="p-4 w-[42%] min-w-[220px]">Campaign</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Spend</th>
                  <th className="p-4 whitespace-nowrap text-center">Bookings</th>
                  <th className="p-4 whitespace-nowrap">ROAS</th>
                  <th className="p-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {loading ? (
                  <tr><td colSpan="6" className="py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Loading campaigns...</td></tr>
                ) : (
                  data?.campaigns?.map(camp => (
                    <tr key={camp.id} className="table-glass-row group">
                      <td className="p-4 font-semibold">
                        <div className="flex items-center gap-3">
                          {camp.ai_creative?.image_url && (
                            <img src={camp.ai_creative.image_url} alt="Campaign Creative" className="w-10 h-10 rounded-lg object-cover border border-ocean/30 shadow-sm shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold bg-ocean/10 text-ocean px-2 py-0.5 rounded uppercase tracking-wider shrink-0">{camp.platform}</span>
                              <span className="font-semibold text-sm truncate max-w-[280px]" style={{ color: 'var(--color-text-main)' }} title={camp.name}>
                                {camp.name}
                              </span>
                            </div>
                            {camp.ai_creative?.headline && camp.ai_creative.headline !== camp.name && (
                              <div className="text-xs font-normal truncate max-w-[280px]" style={{ color: 'var(--color-text-muted)' }} title={camp.ai_creative.headline}>
                                {camp.ai_creative.headline}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${camp.status === 'Active' || camp.status === 'Simulated' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                            {camp.status}
                          </span>
                          {(camp.status === 'Draft' || camp.status === 'Simulated') && typeof camp.id === 'string' && (
                             <button onClick={() => handleSimulateConversion(camp.id)} className="text-[10px] bg-ocean/10 border border-ocean/30 text-ocean hover:bg-ocean hover:text-white px-2 py-0.5 rounded transition-colors whitespace-nowrap">
                               + Simulate
                             </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap font-medium text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {camp.spend?.toString().startsWith('AED') ? camp.spend : `AED ${Number(camp.spend || 0).toLocaleString()}`}
                      </td>
                      <td className="p-4 whitespace-nowrap font-semibold text-center text-sm" style={{ color: 'var(--color-text-main)' }}>
                        {camp.bookings || 0}
                      </td>
                      <td className="p-4 whitespace-nowrap font-extrabold text-ocean text-sm">
                        {camp.roas ? (camp.roas.toString().endsWith('x') ? camp.roas : `${camp.roas}x`) : '-'}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openDeleteModal(camp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Delete Campaign"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="col-span-1 card-glass p-4 sm:p-6 flex flex-col h-full bg-gradient-to-br from-[var(--color-card-bg)] to-ocean/5">
          <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text-main)' }}>AI Campaign Studio</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Generate high-converting ad copy instantly using OceanGate AI.</p>
          
          {generatedDraft ? (
            <div className="flex-1 animate-fade-in space-y-4 overflow-y-auto pr-2 pb-4">
              {generatedDraft.image_url && (
                <div className="w-full h-48 rounded-xl overflow-hidden mb-4 relative shadow-lg shadow-ocean/20 border border-ocean/30">
                  <img src={generatedDraft.image_url} alt="AI Generated Ad Creative" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] uppercase font-bold px-2 py-1 rounded">AI Render</div>
                </div>
              )}
              
              <div className="p-4 rounded-xl border border-ocean/30 bg-ocean/10">
                <div className="text-xs font-bold text-ocean mb-1 uppercase">Generated Headline</div>
                <div className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>{generatedDraft.headline}</div>
              </div>
              
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase" style={{ color: 'var(--color-text-muted)' }}>Caption Variants</div>
                {generatedDraft.variants.map((v, i) => (
                  <div key={i} className="p-3 rounded-lg text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" style={{ color: 'var(--color-text-main)' }}>
                    {v}
                  </div>
                ))}
              </div>
              
              <div className="text-sm font-semibold text-ocean pt-2">{generatedDraft.hashtags.join(' ')}</div>
              
              <div className="pt-4 space-y-2">
                <button 
                  onClick={handleSaveToCrm} 
                  disabled={saveStatus !== 'idle' || pushStatus !== 'idle'}
                  className={`btn-primary w-full flex justify-center items-center gap-2 transition-all ${
                    saveStatus === 'saved' ? 'bg-green-600 border-green-600 shadow-green-600/30 text-white' : ''
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Saving to Database...</>
                  ) : saveStatus === 'saved' ? (
                    '✅ Saved to Campaigns!'
                  ) : (
                    '💾 Save Campaign to CRM'
                  )}
                </button>

                <button 
                  onClick={handlePushToAds} 
                  disabled={pushStatus !== 'idle' || saveStatus !== 'idle'}
                  className={`btn-outline w-full flex justify-center items-center gap-2 transition-all ${
                    pushStatus === 'success' ? 'border-green-500 text-green-500 bg-green-500/10' : ''
                  }`}
                >
                  {pushStatus === 'pushing' ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-ocean border-t-transparent rounded-full"></div> Pushing to Ads Manager...</>
                  ) : pushStatus === 'success' ? (
                    `✅ Synced with ${campaignPrompt.platform}`
                  ) : (
                    `🚀 Push to ${campaignPrompt.platform} Ads`
                  )}
                </button>

                <button onClick={() => setGeneratedDraft(null)} className="text-xs text-center w-full py-2 hover:underline" style={{ color: 'var(--color-text-muted)' }}>
                  Discard & Generate Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDraftCampaign} className="flex flex-col gap-4 flex-1">
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Platform</label>
                <select 
                  className="input-glass"
                  value={campaignPrompt.platform}
                  onChange={e => setCampaignPrompt({...campaignPrompt, platform: e.target.value})}
                >
                  <option value="Meta">Meta (Facebook & Instagram)</option>
                  <option value="Google">Google Ads</option>
                  <option value="TikTok">TikTok</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Campaign Objective / Service</label>
                <input 
                  type="text" 
                  required
                  placeholder="E.g. Summer Yacht Rental 50% Off" 
                  className="input-glass"
                  value={campaignPrompt.objective}
                  onChange={e => setCampaignPrompt({...campaignPrompt, objective: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Target Audience</label>
                <input 
                  type="text" 
                  placeholder="E.g. Tourists in Dubai, Families" 
                  className="input-glass"
                  value={campaignPrompt.targetAudience}
                  onChange={e => setCampaignPrompt({...campaignPrompt, targetAudience: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Campaign Budget (AED)</label>
                <input 
                  type="number" 
                  min="100"
                  step="100"
                  placeholder="1000" 
                  className="input-glass"
                  value={campaignPrompt.budget}
                  onChange={e => setCampaignPrompt({...campaignPrompt, budget: e.target.value})}
                />
              </div>
              
              <div className="mt-auto pt-6">
                <button 
                  type="submit" 
                  disabled={isDrafting}
                  className="btn-primary w-full flex justify-center items-center gap-2"
                >
                  {isDrafting ? (
                    <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Generating with AI...</>
                  ) : (
                    '✨ Generate Ad Copy'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal with Backup Option */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign"
        itemName={campaignToDelete ? `${campaignToDelete.name} (${campaignToDelete.platform})` : ''}
        itemType="campaign"
        itemData={campaignToDelete}
        isDeleting={isDeleting}
      />
    </Layout>
  );
};

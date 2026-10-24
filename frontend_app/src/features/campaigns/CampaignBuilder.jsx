import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export const CampaignBuilder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    objective: 'Drive Tour Bookings',
    offerTitle: '',
    targetOrigin: '',
    targetDestination: 'Dubai, UAE',
    travelStartDate: '',
    travelEndDate: '',
    totalBudget: 1000,
    channels: ['Meta'],
    aiCreative: null
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleChannelToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel) 
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleGenerateCreative = async () => {
    if (!formData.name || !formData.offerTitle) {
      alert("Please fill in the Campaign Name and Offer Title first.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const promptData = {
        objective: formData.objective + " - " + formData.offerTitle,
        targetAudience: formData.targetOrigin,
        platform: formData.channels[0] || 'Meta'
      };
      
      const res = await api.post('/ai/generate-copy', promptData);
      if (res.success && res.data) {
        setFormData(prev => ({ ...prev, aiCreative: res.data }));
      } else {
        alert('Failed to generate ad copy.');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Error generating ad copy.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/campaigns', formData);
      alert('Campaign saved successfully!');
      navigate('/marketing');
    } catch (error) {
      alert("Failed to save campaign.");
    } finally {
      setLoading(false);
    }
  };

  // Simple ROAS/Reach estimator based on budget
  const estimatedClicks = Math.floor(formData.totalBudget * 0.45); // AED 2.2 per click approx
  const estimatedLeads = Math.floor(estimatedClicks * 0.12); // 12% conversion rate

  return (
    <Layout>
      <div className="mb-6 sm:mb-8 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: 'var(--color-text-main)' }}>Master Campaign Builder</h1>
          <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Create one master campaign and distribute it across all connected platforms.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 relative z-10">
        
        {/* SECTION 1: CORE */}
        <div className="card-glass p-4 sm:p-6 border-l-4 border-ocean">
          <h3 className="font-bold text-lg sm:text-xl mb-4" style={{ color: 'var(--color-text-main)' }}>1. Campaign Core</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Campaign Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="input-glass" type="text" placeholder="e.g. Winter Safari 2026" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Travel Objective</label>
              <select name="objective" value={formData.objective} onChange={handleChange} className="input-glass">
                <option value="Drive Tour Bookings">Drive Tour Bookings</option>
                <option value="Yacht Charters">Yacht Charters</option>
                <option value="Visa & Hotel Packages">Visa & Hotel Packages</option>
                <option value="Corporate Retreats">Corporate Retreats</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Offer Title</label>
              <input required name="offerTitle" value={formData.offerTitle} onChange={handleChange} className="input-glass" type="text" placeholder="e.g. Get 20% off Desert Safaris this weekend" />
            </div>
          </div>
        </div>

        {/* SECTION 2: TARGETING & SEASONALITY */}
        <div className="card-glass p-4 sm:p-6 border-l-4 border-purple-500">
          <h3 className="font-bold text-lg sm:text-xl mb-4" style={{ color: 'var(--color-text-main)' }}>2. Targeting & Seasonality</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Target Origin (Where are they?)</label>
              <input required name="targetOrigin" value={formData.targetOrigin} onChange={handleChange} className="input-glass" type="text" placeholder="e.g. UK, Germany, GCC" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Destination Focus (Where to?)</label>
              <input required name="targetDestination" value={formData.targetDestination} onChange={handleChange} className="input-glass" type="text" placeholder="e.g. Dubai, Abu Dhabi" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Valid for Travel From</label>
              <input name="travelStartDate" value={formData.travelStartDate} onChange={handleChange} className="input-glass" type="date" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Valid for Travel To</label>
              <input name="travelEndDate" value={formData.travelEndDate} onChange={handleChange} className="input-glass" type="date" />
            </div>
          </div>
        </div>

        {/* SECTION 3: BUDGET & CHANNELS */}
        <div className="card-glass p-4 sm:p-6 border-l-4 border-green-500 flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-4" style={{ color: 'var(--color-text-main)' }}>3. Budget & Channels</h3>
            
            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Total Lifetime Budget (AED)</label>
            <input required name="totalBudget" value={formData.totalBudget} onChange={handleChange} className="input-glass mb-6" type="number" />
            
            <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Channels</label>
            <div className="flex gap-4">
              {['Meta', 'Google', 'TikTok'].map(channel => (
                <div 
                  key={channel}
                  onClick={() => handleChannelToggle(channel)}
                  className={`cursor-pointer px-6 py-3 rounded-xl border transition-all ${formData.channels.includes(channel) ? 'bg-ocean/20 border-ocean text-ocean font-bold shadow-[0_0_15px_rgba(0,174,239,0.2)]' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'} `}
                  style={{ color: formData.channels.includes(channel) ? '' : 'var(--color-text-muted)' }}
                >
                  {channel} {formData.channels.includes(channel) && '✓'}
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-1/3 bg-black/5 dark:bg-white/5 p-6 rounded-xl border border-black/10 dark:border-white/10 flex flex-col justify-center items-center text-center">
            <div className="text-sm font-bold uppercase mb-2" style={{ color: 'var(--color-text-muted)' }}>Estimated Reach</div>
            <div className="text-4xl font-extrabold text-green-500 mb-1">~{estimatedClicks}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>Clicks to Landing Page</div>
            <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 w-full">
              <div className="text-xl font-bold text-ocean">~{estimatedLeads} Leads</div>
            </div>
          </div>
        </div>

        {/* SECTION 4: AI CREATIVE STUDIO */}
        <div className="card-glass p-6 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl" style={{ color: 'var(--color-text-main)' }}>4. AI Creative Studio</h3>
            {!formData.aiCreative && (
              <button 
                type="button" 
                onClick={handleGenerateCreative} 
                disabled={isGenerating}
                className="btn-primary flex items-center gap-2"
              >
                {isGenerating ? 'Generating...' : '✨ Auto-Generate Creative'}
              </button>
            )}
          </div>
          
          {!formData.aiCreative ? (
            <div className="text-center py-8 border-2 border-dashed rounded-xl border-black/10 dark:border-white/10" style={{ color: 'var(--color-text-muted)' }}>
              Click the button above to automatically generate high-converting ad copy and an image using OceanGate AI, perfectly tailored to your Campaign Core settings.
            </div>
          ) : (
            <div className="flex gap-6 animate-fade-in">
              <div className="w-1/3 h-64 rounded-xl overflow-hidden relative shadow-lg">
                <img src={formData.aiCreative.image_url} alt="AI Generated" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-1 rounded">AI Render</div>
                <button type="button" onClick={() => setFormData(prev => ({...prev, aiCreative: null}))} className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow hover:bg-red-600 transition-colors">Replace</button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="p-4 rounded-xl bg-ocean/10 border border-ocean/20">
                  <div className="text-xs font-bold text-ocean mb-1 uppercase">Headline</div>
                  <div className="font-bold text-xl" style={{ color: 'var(--color-text-main)' }}>{formData.aiCreative.headline}</div>
                </div>
                <div>
                  <div className="text-xs font-bold mb-2 uppercase" style={{ color: 'var(--color-text-muted)' }}>Top Caption Variant</div>
                  <div className="p-3 rounded-lg text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" style={{ color: 'var(--color-text-main)' }}>
                    {formData.aiCreative.variants[0]}
                  </div>
                </div>
                <div className="text-sm font-semibold text-ocean">{formData.aiCreative.hashtags.join(' ')}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-4">
          <button className="btn-outline" type="button" onClick={() => navigate('/marketing')}>CANCEL</button>
          <button className="btn-primary px-8 py-3 text-lg shadow-lg shadow-ocean/30" type="submit">
            {loading ? 'SAVING...' : 'SAVE MASTER CAMPAIGN'}
          </button>
        </div>
      </form>
    </Layout>
  );
};

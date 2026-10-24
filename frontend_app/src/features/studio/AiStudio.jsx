import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export const AiStudio = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    objective: '', 
    targetAudience: '', 
    platform: 'Meta',
    tone: 'Luxury & Exclusive'
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      const res = await api.post('/ai/generate-copy', formData);
      setResults(res.data);
    } catch (error) {
      alert("Failed to generate AI copy. Check console.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCampaign = async () => {
    setSaving(true);
    try {
      const payload = {
        name: `AI Draft: ${formData.objective.substring(0, 20)}...`,
        objective: formData.objective,
        offerTitle: results.headline,
        targetOrigin: formData.targetAudience, // Reusing field for simplicity
        targetDestination: 'Dubai, UAE',
        totalBudget: 0,
        channels: [formData.platform],
        status: 'Draft',
        aiCreative: results
      };
      
      const campRes = await api.post('/campaigns', payload);

      // Save the AI image to the Media Library
      if (results.image_url) {
        await api.post('/assets', {
          fileUrl: results.image_url,
          type: 'image',
          category: 'AI Generated',
          source: 'AI',
          tags: ['ai', formData.platform.toLowerCase(), 'campaign_' + campRes.data.id],
          dimensions: '1024x1024',
          owner: 'System'
        });
      }

      alert('Campaign and Media saved successfully!');
      navigate('/marketing');
    } catch (error) {
      console.error(error);
      alert("Failed to save campaign.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8 relative z-10 flex justify-between items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: 'var(--color-text-main)' }}>AI Content Studio</h1>
          <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Generate high-converting copy variants and imagery tailored to your platform and audience.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: CONTEXT FORM */}
        <div className="lg:col-span-2 card-glass p-4 sm:p-6 relative z-10 border-l-4 border-ocean flex flex-col min-h-[480px] lg:h-[calc(100vh-200px)]">
          <h3 className="font-bold text-xl mb-6" style={{ color: 'var(--color-text-main)' }}>Campaign Context</h3>
          <form onSubmit={handleGenerate} className="space-y-5 flex-1 flex flex-col">
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Platform</label>
              <select name="platform" value={formData.platform} onChange={handleChange} className="input-glass">
                <option value="Meta">Facebook / Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Google">Google Ads</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Tone of Voice</label>
              <select name="tone" value={formData.tone} onChange={handleChange} className="input-glass">
                <option value="Luxury & Exclusive">💎 Luxury & Exclusive</option>
                <option value="Family Friendly">👨‍👩‍👧‍👦 Family Friendly & Fun</option>
                <option value="Adventurous & High-Energy">🔥 Adventurous & High-Energy</option>
                <option value="Urgent & Discount-Focused">⏳ Urgent & Discount-Focused</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Campaign Objective / Offer</label>
              <textarea required name="objective" value={formData.objective} onChange={handleChange} rows="3" placeholder="e.g., Promote 20% off Desert Safari for families..." className="input-glass" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Target Audience</label>
              <input required name="targetAudience" value={formData.targetAudience} onChange={handleChange} placeholder="e.g., Tourists in Dubai, ages 25-45" className="input-glass" type="text" />
            </div>

            <div className="mt-auto pt-6">
              <button className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-ocean/30 flex justify-center items-center gap-2 transition-all hover:scale-[1.02]" type="submit" disabled={loading}>
                {loading ? (
                  <><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> Crafting magic...</>
                ) : (
                  '✨ GENERATE CREATIVE'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: OUTPUT */}
        <div className="lg:col-span-3 card-glass p-0 relative z-10 border-l-4 border-yellow-500 overflow-hidden flex flex-col min-h-[480px] lg:h-[calc(100vh-200px)]">
          
          {loading && (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="animate-spin h-12 w-12 border-4 border-ocean border-t-transparent rounded-full mb-4"></div>
              <div className="text-lg font-bold animate-pulse" style={{ color: 'var(--color-text-main)' }}>Consulting the AI Creative Director...</div>
              <div className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>Rendering ultra-realistic 4K image and writing copy</div>
            </div>
          )}
          
          {!loading && !results && (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-12">
              <div className="text-6xl mb-6">🪄</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Ready to Create</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>Fill in the context on the left and click generate. The AI will instantly produce a highly-optimized ad image, headline, and caption variants tailored to your exact tone of voice.</p>
            </div>
          )}
          
          {results && (
            <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
              
              {/* IMAGE SECTION */}
              {results.image_url && (
                <div className="w-full h-64 md:h-80 relative bg-black shrink-0 shadow-lg">
                  <img src={results.image_url} alt="AI Generated Campaign Creative" className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs uppercase font-extrabold px-3 py-1.5 rounded-full border border-white/20 shadow-xl">
                    ✨ AI Rendered
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                      <div className="text-xs font-bold text-yellow-400 mb-1 uppercase tracking-widest drop-shadow-md">Generated Headline</div>
                      <h2 className="text-3xl font-extrabold text-white drop-shadow-lg leading-tight">{results.headline}</h2>
                    </div>
                  </div>
                </div>
              )}

              {/* COPY SECTION */}
              <div className="p-6 flex-1 overflow-y-auto bg-black/5 dark:bg-white/5">
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Caption Variants</div>
                    <div className="space-y-3">
                      {results.variants?.map((v, i) => (
                        <div key={i} className="p-4 rounded-xl text-sm leading-relaxed shadow-sm hover:shadow-md transition-shadow relative card-glass" style={{ color: 'var(--color-text-main)' }}>
                          <div className="absolute -left-2 -top-2 bg-ocean text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">v{i+1}</div>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Hashtags</div>
                    <div className="flex flex-wrap gap-2">
                      {results.hashtags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-semibold">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION BAR */}
              <div className="p-4 border-t border-black/10 dark:border-white/10 bg-[var(--color-card-bg)] flex justify-end gap-4 shrink-0">
                <button onClick={() => setResults(null)} className="btn-outline">Discard</button>
                <button 
                  onClick={handleSaveCampaign} 
                  disabled={saving}
                  className="btn-primary px-8 flex items-center gap-2"
                >
                  {saving ? 'Saving...' : '🚀 Save as Draft Campaign'}
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

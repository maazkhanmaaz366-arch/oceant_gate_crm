import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Sparkles, Check, ArrowRight, UserPlus } from 'lucide-react';

export const BookingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  
  // Voice recognition & AI parser state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    service_type: 'Airport Transfer',
    service_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    pickup_location: '',
    dropoff_location: '',
    customer_price: 1500,
    adults: 2,
    children: 0,
    hotel_name: '',
    room_type: 'Standard',
    status: 'confirmed'
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        setCustomers(res.data || []);
        if (res.data && res.data.length > 0) {
          setFormData(prev => ({ ...prev, customer_id: prev.customer_id || res.data[0].id }));
        }
      } catch (error) {
        console.error("Failed to load customers", error);
      }
    };
    fetchCustomers();

    // Initialize Web Speech API if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        parseVoiceBooking(text);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(recognition);
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleVoiceRecording = () => {
    if (isListening) {
      recognitionInstance?.stop();
      setIsListening(false);
    } else {
      if (recognitionInstance) {
        try {
          recognitionInstance.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback for browsers without Web Speech API
        const demoSpeech = prompt("Speech API unavailable. Enter or paste voice note transcript:", "Book Sunset Yacht Charter for 4 adults from Dubai Marina to Burj Al Arab at 4500 AED tomorrow");
        if (demoSpeech) {
          setTranscript(demoSpeech);
          parseVoiceBooking(demoSpeech);
        }
      }
    }
  };

  const parseVoiceBooking = (text) => {
    setAiParsing(true);
    setTimeout(() => {
      const lower = text.toLowerCase();
      const updates = {};

      // Detect Service
      if (lower.includes('yacht')) updates.service_type = 'Yacht Charter';
      else if (lower.includes('safari') || lower.includes('desert')) updates.service_type = 'Desert Safari';
      else if (lower.includes('airport') || lower.includes('transfer')) updates.service_type = 'Airport Transfer';
      else if (lower.includes('city tour') || lower.includes('tour')) updates.service_type = 'City Tour';

      // Detect Adults / Pax
      const adultMatch = lower.match(/(\d+)\s*(adult|people|pax|guest|person)/);
      if (adultMatch) updates.adults = parseInt(adultMatch[1]);

      // Detect Children
      const childMatch = lower.match(/(\d+)\s*(child|kid|children)/);
      if (childMatch) updates.children = parseInt(childMatch[1]);

      // Detect Locations
      if (lower.includes('dubai marina')) updates.pickup_location = 'Dubai Marina Yacht Club';
      else if (lower.includes('airport') || lower.includes('dxb')) updates.pickup_location = 'Dubai International Airport (DXB)';
      else if (lower.includes('downtown')) updates.pickup_location = 'Downtown Dubai';

      if (lower.includes('burj al arab')) updates.dropoff_location = 'Burj Al Arab';
      else if (lower.includes('atlantis') || lower.includes('palm')) updates.dropoff_location = 'Atlantis The Palm';
      else if (lower.includes('burj khalifa')) updates.dropoff_location = 'Burj Khalifa';

      // Detect Price
      const priceMatch = lower.match(/(\d+)\s*(aed|usd|dollars|dirham)/) || lower.match(/(at|for)\s*(\d+)/);
      if (priceMatch) {
        const foundNumber = priceMatch[1] || priceMatch[2];
        if (Number(foundNumber) > 100) updates.customer_price = Number(foundNumber);
      }

      setFormData(prev => ({ ...prev, ...updates }));
      setAiParsing(false);
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        customer_id: formData.customer_id,
        service_type: formData.service_type,
        service_date: formData.service_date,
        pickup_location: formData.pickup_location,
        dropoff_location: formData.dropoff_location,
        hotel_name: formData.hotel_name,
        room_type: formData.room_type,
        customer_price: Number(formData.customer_price),
        status: formData.status,
        passengers: { adults: Number(formData.adults), children: Number(formData.children) }
      };

      await api.post('/bookings', payload);
      navigate('/bookings');
    } catch (error) {
      alert('Failed to save booking. Ensure all required fields are set.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="New Booking">
      <div className="mb-6 relative z-10 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--color-text-main)' }}>
            Create New Itinerary Booking
          </h1>
          <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Manually enter trip logistics or dictate using the AI Voice Booking Extractor.
          </p>
        </div>
      </div>

      {/* AI VOICE NOTE EXTRACTOR BANNER */}
      <div className="card-glass p-6 mb-8 border border-ocean/30 rounded-3xl relative overflow-hidden bg-gradient-to-r from-ocean/10 via-purple-500/10 to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-ocean text-white shadow-md shadow-ocean/30">
                <Sparkles size={18} />
              </span>
              <h3 className="font-extrabold text-base" style={{ color: 'var(--color-text-main)' }}>
                AI Voice Booking Extractor
              </h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Click speak and dictate: <span className="font-mono text-ocean italic">"Book Sunset Yacht for 4 adults from Dubai Marina at 4500 AED"</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg w-full sm:w-auto ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/30' 
                  : 'bg-ocean hover:bg-ocean-dark text-white shadow-ocean/30'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={16} /> Listening... Speak Now
                </>
              ) : (
                <>
                  <Mic size={16} /> 🎙️ Speak Booking Details
                </>
              )}
            </button>
          </div>
        </div>

        {transcript && (
          <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4 text-xs font-semibold">
            <div className="truncate" style={{ color: 'var(--color-text-main)' }}>
              <span className="text-ocean font-bold">Transcript: </span>"{transcript}"
            </div>
            {aiParsing && (
              <span className="text-xs font-bold text-ocean flex items-center gap-1 shrink-0">
                <span className="animate-spin h-3.5 w-3.5 border-2 border-ocean border-t-transparent rounded-full"></span>
                AI Populating Form...
              </span>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10 max-w-4xl">
        
        {/* 1. Customer Section */}
        <div className="card-glass p-6 rounded-2xl" style={{ backgroundColor: 'var(--color-card-bg)' }}>
          <h3 className="font-extrabold text-base mb-4 flex items-center" style={{ color: 'var(--color-text-main)' }}>
            <span className="bg-ocean/20 text-ocean w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 font-bold">1</span> 
            Guest Profile
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Select Existing Guest</label>
              <select required name="customer_id" value={formData.customer_id} onChange={handleChange} className="input-glass text-sm">
                <option value="">-- Choose Guest --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.phone || c.email || 'VIP Guest'})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Service Section */}
        <div className="card-glass p-6 rounded-2xl" style={{ backgroundColor: 'var(--color-card-bg)' }}>
          <h3 className="font-extrabold text-base mb-4 flex items-center" style={{ color: 'var(--color-text-main)' }}>
            <span className="bg-ocean/20 text-ocean w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 font-bold">2</span> 
            Service Logistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Service Type</label>
              <select required name="service_type" value={formData.service_type} onChange={handleChange} className="input-glass text-sm">
                <option value="Airport Transfer">Airport Transfer</option>
                <option value="Desert Safari">VIP Red Dune Desert Safari</option>
                <option value="Yacht Charter">Luxury Yacht Charter</option>
                <option value="City Tour">Private Dubai City Tour</option>
                <option value="Helicopter Aerial Tour">Helicopter Aerial Tour</option>
                <option value="5-Star Hotel Stay">5-Star Hotel & Villa Stay</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Date & Time</label>
              <input required name="service_date" value={formData.service_date} onChange={handleChange} className="input-glass text-sm" type="datetime-local" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Pickup Location</label>
              <input required name="pickup_location" value={formData.pickup_location} onChange={handleChange} className="input-glass text-sm" type="text" placeholder="e.g. Dubai Marina Yacht Club" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Dropoff Location</label>
              <input required name="dropoff_location" value={formData.dropoff_location} onChange={handleChange} className="input-glass text-sm" type="text" placeholder="e.g. Atlantis The Palm" />
            </div>
          </div>
        </div>

        {/* 3. Pricing & Passengers */}
        <div className="card-glass p-6 rounded-2xl" style={{ backgroundColor: 'var(--color-card-bg)' }}>
          <h3 className="font-extrabold text-base mb-4 flex items-center" style={{ color: 'var(--color-text-main)' }}>
            <span className="bg-ocean/20 text-ocean w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 font-bold">3</span> 
            Pricing & Passengers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Adults</label>
              <input required name="adults" value={formData.adults} onChange={handleChange} className="input-glass text-sm" type="number" min="1" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Children</label>
              <input required name="children" value={formData.children} onChange={handleChange} className="input-glass text-sm" type="number" min="0" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Customer Price (AED)</label>
              <input required name="customer_price" value={formData.customer_price} onChange={handleChange} className="input-glass text-sm font-bold text-ocean" type="number" min="0" />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-4">
          <button className="btn-outline text-sm font-bold w-full sm:w-auto" type="button" onClick={() => navigate('/bookings')}>
            Cancel
          </button>
          <button className="btn-primary text-sm font-extrabold px-8 shadow-lg shadow-ocean/25 w-full sm:w-auto" type="submit" disabled={loading}>
            {loading ? 'Confirming Booking...' : '✓ Confirm & Save Itinerary'}
          </button>
        </div>
      </form>
    </Layout>
  );
};

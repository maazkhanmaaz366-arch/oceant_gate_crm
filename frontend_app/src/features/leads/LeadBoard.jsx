import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { 
  ChevronRight, 
  ChevronLeft, 
  UserPlus, 
  Circle, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Download, 
  Sparkles, 
  Copy, 
  Check, 
  MessageSquare, 
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { downloadJsonBackup } from '../../utils/backupUtils';

const STAGES = [
  { id: 'new', label: 'New Enquiry', color: 'bg-blue-500 text-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500 text-yellow-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-purple-500 text-purple-500' },
  { id: 'quotation_sent', label: 'Quotation Sent', color: 'bg-indigo-500 text-indigo-500' },
  { id: 'follow_up', label: 'Follow Up', color: 'bg-orange-500 text-orange-500' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-green-500 text-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500 text-red-500' },
];

export function LeadBoard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AI WhatsApp Proposal Modal State
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [selectedLeadForAi, setSelectedLeadForAi] = useState(null);
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [proposalTab, setProposalTab] = useState('whatsapp');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newLead, setNewLead] = useState({
    customerName: '',
    email: '',
    phone: '',
    serviceInterest: 'Flight Booking',
    source: 'manual'
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      const leadsList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setLeads(leadsList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const moveLead = async (lead, direction) => {
    const leadId = lead.id || lead._id;
    if (!leadId) return;

    const currentIndex = STAGES.findIndex(s => s.id === lead.status);
    const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < STAGES.length) {
      const nextStage = STAGES[nextIndex].id;
      // Optimistic update
      setLeads(prevLeads => prevLeads.map(l => 
        ((l.id && l.id === leadId) || (l._id && l._id === leadId) ? { ...l, status: nextStage } : l)
      ));

      try {
        await api.put(`/leads/${leadId}`, { status: nextStage });
      } catch (error) {
        console.error("Failed to move lead", error);
        fetchLeads();
      }
    }
  };

  const changeLeadStage = async (lead, newStageId) => {
    const leadId = lead.id || lead._id;
    if (!leadId || lead.status === newStageId) return;

    // Optimistic update
    setLeads(prevLeads => prevLeads.map(l => 
      ((l.id && l.id === leadId) || (l._id && l._id === leadId) ? { ...l, status: newStageId } : l)
    ));

    try {
      await api.put(`/leads/${leadId}`, { status: newStageId });
    } catch (error) {
      console.error("Failed to update lead stage", error);
      fetchLeads();
    }
  };

  const convertLead = async (lead) => {
    try {
      const leadId = lead.id || lead._id;
      const res = await api.post(`/leads/${leadId}/convert`, {
        service_type: lead.service_interest || 'General Package',
        customer_price: 1500,
        pickup_location: 'Dubai Marina',
        dropoff_location: 'Burj Khalifa',
        customer: {
          name: getLeadName(lead),
          email: lead.source_details?.email,
          phone: lead.source_details?.phone
        }
      });
      const bookingNumber = res?.data?.booking?.booking_number || res?.booking?.booking_number || res?.data?.data?.booking?.booking_number || '';
      alert(`🎉 Lead Converted Successfully!\n\nGuest Profile and Booking ${bookingNumber ? '#' + bookingNumber : ''} have been created.`);
      fetchLeads();
    } catch (error) {
      console.error("Failed to convert lead", error);
      alert("Failed to convert lead to Booking: " + (error?.message || error?.error || 'Unknown error'));
    }
  };

  const openDeleteModal = (lead) => {
    setLeadToDelete(lead);
    setDeleteModalOpen(true);
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      const leadId = leadToDelete.id || leadToDelete._id;
      await api.delete(`/leads/${leadId}`);
      setDeleteModalOpen(false);
      setLeadToDelete(null);
      fetchLeads();
    } catch (error) {
      console.error("Failed to delete lead", error);
      alert("Failed to delete lead.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportAll = () => {
    downloadJsonBackup(leads, 'oceangate_all_leads_backup');
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads', {
        source: newLead.source,
        service_interest: newLead.serviceInterest,
        pax: { adults: 1, children: 0, infants: 0 },
        travel_dates: { start_date: new Date().toISOString().slice(0, 10), end_date: '' },
        source_details: {
          name: newLead.customerName,
          email: newLead.email,
          phone: newLead.phone
        }
      });
      setIsModalOpen(false);
      setNewLead({ customerName: '', email: '', phone: '', serviceInterest: 'Flight Booking', source: 'manual' });
      fetchLeads();
    } catch (error) {
      console.error(error);
    }
  };

  // Open AI WhatsApp Proposal Modal
  const openAiProposal = async (lead) => {
    setSelectedLeadForAi(lead);
    setProposalModalOpen(true);
    setGeneratingProposal(true);
    setProposalData(null);
    setCopied(false);

    try {
      const res = await api.post('/ai/lead-proposal', {
        leadName: getLeadName(lead),
        phone: lead.source_details?.phone || '',
        serviceInterest: lead.service_interest || 'Dubai Luxury Experience',
        pax: lead.pax,
        travelDates: lead.travel_dates,
        notes: lead.notes
      });

      if (res.data?.data) {
        setProposalData(res.data.data);
      } else if (res.data) {
        setProposalData(res.data);
      }
    } catch (err) {
      console.error('Failed to generate AI proposal:', err);
    } finally {
      setGeneratingProposal(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getLeadName = (lead) => {
    if (lead.customer_id && typeof lead.customer_id === 'object' && lead.customer_id.first_name) {
      return `${lead.customer_id.first_name} ${lead.customer_id.last_name}`;
    }
    if (lead.source_details?.name) return lead.source_details.name;
    return 'Valued Guest';
  };

  const getSourceColor = (source) => {
    if (!source) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    const s = source.toLowerCase();
    if (s.includes('meta') || s.includes('facebook') || s.includes('instagram')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50';
    if (s.includes('google')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/50';
    if (s.includes('tiktok')) return 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700';
    if (s.includes('manual') || s.includes('direct')) return 'bg-ocean/10 text-ocean border border-ocean/20';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  };

  const [mobileStageFilter, setMobileStageFilter] = useState('all');

  return (
    <Layout title="Lead Pipeline">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6 animate-fade-in relative z-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--color-text-main)' }}>Lead Pipeline</h1>
          <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>Track, qualify, and convert incoming client enquiries with AI assistance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            className="btn-outline flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3"
            onClick={handleExportAll}
            title="Download Full Leads Snapshot (JSON)"
          >
            <Download size={15} /> Export Leads
          </button>
          <button className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3" onClick={() => setIsModalOpen(true)}>
            <Plus size={15} /> Add Lead
          </button>
        </div>
      </div>

      {/* MOBILE STAGE FILTER BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 custom-scrollbar lg:hidden -mx-2 px-2">
        <button
          onClick={() => setMobileStageFilter('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
            mobileStageFilter === 'all'
              ? 'bg-ocean text-white shadow-sm'
              : 'bg-black/5 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          All Stages ({leads.length})
        </button>
        {STAGES.map(s => {
          const count = leads.filter(l => l.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setMobileStageFilter(s.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                mobileStageFilter === s.id
                  ? 'bg-ocean text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Circle size={8} className={s.color.split(' ')[1]} fill="currentColor" />
              <span>{s.label}</span>
              <span className="opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 custom-scrollbar animate-fade-in relative z-10 h-full snap-x snap-mandatory sm:snap-none -mx-2 px-2 sm:mx-0 sm:px-0">
        {STAGES.filter(stage => mobileStageFilter === 'all' || stage.id === mobileStageFilter).map((stage, stageIndex) => {
          const stageLeads = leads.filter(l => l.status === stage.id);
          const isFirstStage = stageIndex === 0;
          const isLastStage = stageIndex === STAGES.length - 1;

          return (
            <div key={stage.id} className="flex-shrink-0 w-[84vw] sm:w-80 flex flex-col h-full min-h-[500px] snap-center">

              {/* Column Header */}
              <div className="flex justify-between items-center mb-3 sm:mb-4 px-1">
                <div className="flex items-center gap-2">
                  <Circle size={13} className={stage.color.split(' ')[1]} fill="currentColor" />
                  <h3 className="font-bold text-xs sm:text-sm tracking-wide uppercase" style={{ color: 'var(--color-text-main)' }}>
                    {stage.label}
                  </h3>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10" style={{ color: 'var(--color-text-main)' }}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Column Body */}
              <div
                className="card-glass flex-1 p-3 flex flex-col gap-3 rounded-2xl sm:rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedId = e.dataTransfer.getData('text/plain');
                  const draggedLead = leads.find(l => (l.id && l.id === droppedId) || (l._id && l._id === droppedId));
                  if (draggedLead && draggedLead.status !== stage.id) {
                    changeLeadStage(draggedLead, stage.id);
                  }
                }}
              >
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ocean"></div>
                  </div>
                ) : stageLeads.length === 0 ? (
                  <div className="h-24 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center">
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Drop lead here</p>
                  </div>
                ) : (
                  stageLeads.map(lead => (
                    <div
                      key={lead.id || lead._id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', lead.id || lead._id);
                      }}
                      className="card-glass p-4 rounded-2xl border-transparent hover:border-ocean/30 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden flex flex-col cursor-grab active:cursor-grabbing"
                      style={{ backgroundColor: 'var(--color-card-bg)' }}
                    >

                      {/* Left color accent strip based on stage */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stage.color.split(' ')[0]}`}></div>

                      {/* Tags & Actions */}
                      <div className="flex justify-between items-start mb-3 pl-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getSourceColor(lead.source)}`}>
                          {lead.source}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10" style={{ color: 'var(--color-text-muted)' }}>
                            {new Date(lead.createdAt || lead.created_at || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); openDeleteModal(lead); }}
                            className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Delete Lead"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Name & Service */}
                      <h4 className="font-bold text-base leading-tight mb-1 pl-1" style={{ color: 'var(--color-text-main)' }}>{getLeadName(lead)}</h4>
                      <p className="text-xs font-semibold text-ocean mb-3 flex items-center gap-1 pl-1">
                        <span>✨</span> {lead.service_interest || 'General Enquiry'}
                      </p>

                      {/* Contact Info */}
                      <div className="space-y-1.5 mb-3 pl-1">
                        {lead.source_details?.phone && (
                          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            <div className="p-1 rounded-md bg-black/5 dark:bg-white/5"><Phone size={12} /></div>
                            {lead.source_details.phone}
                          </div>
                        )}
                        {lead.source_details?.email && (
                          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            <div className="p-1 rounded-md bg-black/5 dark:bg-white/5"><Mail size={12} /></div>
                            <span className="truncate">{lead.source_details.email}</span>
                          </div>
                        )}
                      </div>

                      {/* AI WhatsApp Quote Generator Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openAiProposal(lead); }}
                        className="w-full mb-3 py-1.5 px-3 rounded-xl bg-gradient-to-r from-ocean/10 via-purple-500/10 to-ocean/10 hover:from-ocean hover:to-ocean-dark text-ocean hover:text-white border border-ocean/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm group/btn"
                      >
                        <Sparkles size={13} className="group-hover/btn:animate-spin text-ocean group-hover/btn:text-white" />
                        <span>AI WhatsApp Quote</span>
                      </button>

                      {/* Stage Action Bar */}
                      <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-2 mt-auto">
                        {stage.id === 'confirmed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); convertLead(lead); }}
                            className="w-full btn-secondary py-2 text-xs font-extrabold flex items-center justify-center gap-2 mb-1.5 shadow-sm"
                          >
                            <UserPlus size={15} /> CONVERT TO BOOKING
                          </button>
                        )}

                        <div className="flex items-center justify-between gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveLead(lead, 'backward'); }}
                            disabled={isFirstStage}
                            title={isFirstStage ? 'Already at first stage' : `Move back to ${STAGES[stageIndex - 1]?.label}`}
                            className={`p-1.5 rounded-lg transition-all ${
                              isFirstStage 
                                ? 'opacity-25 cursor-not-allowed text-slate-400' 
                                : 'bg-black/5 dark:bg-white/5 hover:bg-ocean hover:text-white text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {/* Quick Stage Select */}
                          <select
                            value={lead.status || stage.id}
                            onChange={(e) => { e.stopPropagation(); changeLeadStage(lead, e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-bold py-1 px-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-ocean/40 transition-colors cursor-pointer text-center outline-none"
                            style={{ color: 'var(--color-text-main)' }}
                          >
                            {STAGES.map(s => (
                              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                                {s.label}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={(e) => { e.stopPropagation(); moveLead(lead, 'forward'); }}
                            disabled={isLastStage}
                            title={isLastStage ? 'Already at last stage' : `Move forward to ${STAGES[stageIndex + 1]?.label}`}
                            className={`p-1.5 rounded-lg transition-all ${
                              isLastStage 
                                ? 'opacity-25 cursor-not-allowed text-slate-400' 
                                : 'bg-ocean/10 text-ocean hover:bg-ocean hover:text-white'
                            }`}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI WHATSAPP PROPOSAL & QUOTE MODAL */}
      {proposalModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setProposalModalOpen(false)}></div>

          <div className="card-glass w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden relative z-10 shadow-2xl border border-ocean/30" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-ocean-dark via-ocean to-purple-700 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                  <Sparkles size={22} className="text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold flex items-center gap-2">
                    AI Client Proposal & WhatsApp
                  </h3>
                  <p className="text-blue-100 text-xs mt-0.5">
                    Personalized luxury itinerary quote for {getLeadName(selectedLeadForAi)}
                  </p>
                </div>
              </div>
              <button onClick={() => setProposalModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
              {generatingProposal ? (
                <div className="py-16 text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-ocean border-t-transparent mx-auto"></div>
                  <p className="font-extrabold text-sm" style={{ color: 'var(--color-text-main)' }}>Consulting AI Luxury Concierge...</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Calculating pricing, route highlights, and luxury WhatsApp copy.</p>
                </div>
              ) : proposalData ? (
                <>
                  {/* Proposal Tab Switcher */}
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    <button
                      onClick={() => setProposalTab('whatsapp')}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        proposalTab === 'whatsapp' ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      <MessageSquare size={15} /> WhatsApp Proposal
                    </button>
                    <button
                      onClick={() => setProposalTab('email')}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        proposalTab === 'email' ? 'bg-ocean text-white shadow-md' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      <Mail size={15} /> Email Proposal
                    </button>
                  </div>

                  {/* Highlights Bar */}
                  {proposalData.itinerary_highlights && (
                    <div className="p-4 rounded-2xl bg-ocean/5 border border-ocean/20 space-y-2">
                      <div className="text-xs font-extrabold text-ocean uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} /> Recommended Itinerary Highlights
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold" style={{ color: 'var(--color-text-main)' }}>
                        {proposalData.itinerary_highlights.map((h, i) => (
                          <div key={i} className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-1.5">
                            <span>💎</span> <span className="truncate">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Content Box */}
                  {proposalTab === 'whatsapp' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-extrabold uppercase" style={{ color: 'var(--color-text-muted)' }}>
                          WhatsApp Message Preview
                        </label>
                        <span className="text-[11px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                          ● Ready to Send
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text" style={{ color: 'var(--color-text-main)' }}>
                        {proposalData.whatsapp_message}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-extrabold uppercase mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                          Subject Line
                        </label>
                        <input
                          type="text"
                          readOnly
                          className="input-glass text-xs font-bold"
                          value={proposalData.email_subject}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-extrabold uppercase mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                          Email Body
                        </label>
                        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text" style={{ color: 'var(--color-text-main)' }}>
                          {proposalData.email_body}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p>Failed to load proposal data.</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            {proposalData && (
              <div className="p-5 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
                <button
                  onClick={() => openAiProposal(selectedLeadForAi)}
                  disabled={generatingProposal}
                  className="btn-outline text-xs flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Regenerate
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyToClipboard(proposalTab === 'whatsapp' ? proposalData.whatsapp_message : proposalData.email_body)}
                    className="btn-outline text-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Text'}
                  </button>

                  {selectedLeadForAi?.source_details?.phone && proposalTab === 'whatsapp' && (
                    <a
                      href={`https://wa.me/${selectedLeadForAi.source_details.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(proposalData.whatsapp_message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs flex items-center gap-1.5 bg-green-600 hover:bg-green-700 border-green-600 shadow-lg shadow-green-600/20 text-white"
                    >
                      <ExternalLink size={14} /> Open WhatsApp Web
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        itemName={leadToDelete ? `${getLeadName(leadToDelete)} (${leadToDelete.service_interest || 'Enquiry'})` : ''}
        itemType="lead"
        itemData={leadToDelete}
        isDeleting={isDeleting}
      />

      {/* Manual Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="card-glass w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl overflow-hidden relative z-10" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            <div className="bg-gradient-to-r from-ocean-dark to-ocean p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold">Add Manual Lead</h2>
                <p className="text-blue-100 text-xs mt-0.5">Enter a walk-in or phone enquiry.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLead} className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Customer Full Name</label>
                <input
                  type="text"
                  required
                  className="input-glass text-sm"
                  value={newLead.customerName}
                  onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Email (Optional)</label>
                  <input
                    type="email"
                    className="input-glass text-sm"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Phone Number</label>
                  <input
                    type="text"
                    required
                    className="input-glass text-sm"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+971 50..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Service Interest</label>
                <select
                  className="input-glass text-sm"
                  value={newLead.serviceInterest}
                  onChange={(e) => setNewLead({ ...newLead, serviceInterest: e.target.value })}
                >
                  <option value="Flight Booking">Flight Booking</option>
                  <option value="Hotel Reservation">Hotel Reservation</option>
                  <option value="Desert Safari">VIP Desert Safari</option>
                  <option value="Yacht Charter">Luxury Yacht Charter</option>
                  <option value="Visa Service">Visa Assistance</option>
                  <option value="Complete Package">Complete VIP Package</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline text-sm">Cancel</button>
                <button type="submit" className="btn-primary text-sm">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { Truck, MapPin, Users, Edit2, Trash2, Download, Printer, Plus } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { downloadJsonBackup } from '../../utils/backupUtils';

export function Operations() {
  const [jobs, setJobs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [printingJob, setPrintingJob] = useState(null);
  const [newJob, setNewJob] = useState({ booking_id: '', driver_id: '', operational_notes: '' });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, driversRes, bookingsRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/drivers'),
        api.get('/bookings')
      ]);
      setJobs(Array.isArray(jobsRes?.data) ? jobsRes.data : (Array.isArray(jobsRes) ? jobsRes : []));
      setDrivers(Array.isArray(driversRes?.data) ? driversRes.data : (Array.isArray(driversRes) ? driversRes : []));
      setBookings(Array.isArray(bookingsRes?.data) ? bookingsRes.data : (Array.isArray(bookingsRes) ? bookingsRes : []));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', newJob);
      setIsCreateModalOpen(false);
      setNewJob({ booking_id: '', driver_id: '', operational_notes: '' });
      fetchData();
    } catch (error) {
      console.error("Failed to create job", error);
      alert("Failed to generate job card.");
    }
  };

  const openDeleteModal = (job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      const jobId = jobToDelete.id || jobToDelete._id;
      await api.delete(`/jobs/${jobId}`);
      setDeleteModalOpen(false);
      setJobToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete job card", error);
      alert("Failed to delete job card.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportAll = () => {
    downloadJsonBackup(jobs, 'oceangate_all_jobs_backup');
  };

  const openEditModal = (job) => {
    setEditingJob({
      id: job.id,
      status: job.status,
      driver_id: job.Driver?.id || job.driver_id?.id || job.driver_id || ''
    });
    setIsEditModalOpen(true);
  };

  const handlePrintJob = (job) => {
    setPrintingJob(job);
    setTimeout(() => {
      window.print();
      setPrintingJob(null);
    }, 100);
  };

  const handleUpdateJob = async () => {
    try {
      await api.put(`/jobs/${editingJob.id}`, { 
        status: editingJob.status,
        driver_id: editingJob.driver_id || null
      });
      setIsEditModalOpen(false);
      setEditingJob(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update job status", error);
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30';
      case 'assigned': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'en_route': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'arrived': return 'bg-ocean/10 text-ocean border-ocean/30';
      case 'passenger_onboard': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  const availableBookings = bookings.filter(b => !jobs.some(j => (j.Booking || j.booking_id)?.id === b.id));

  return (
    <Layout title="Operations">
      <div className="card-glass overflow-hidden relative print:hidden">
        <div className="p-4 sm:p-6 border-b border-black/5 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
              Active Job Cards
            </h2>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Dispatch and track active bookings, routes, and drivers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              className="btn-outline flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3" 
              onClick={handleExportAll}
              title="Download Full Jobs Snapshot (JSON)"
            >
              <Download size={15} /> Export Job Cards
            </button>
            <button className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={15} /> + Generate Job Card
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="table-glass-header">
              <tr>
                <th className="p-4 font-bold">Service Info</th>
                <th className="p-4 font-bold">Guest Details</th>
                <th className="p-4 font-bold">Driver Assigned</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No active jobs. Dispatch a booking to create one.</td></tr>
              ) : (
                jobs.map(j => (
                  <tr key={j.id} className="table-glass-row group">
                    <td className="p-4">
                      <div className="font-bold text-base" style={{ color: 'var(--color-text-main)' }}>
                        {(j.Booking || j.booking_id)?.service_type || 'Unknown Service'}
                      </div>
                      <div className="flex items-center text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        <MapPin size={12} className="mr-1 text-ocean shrink-0" />
                        <span className="truncate max-w-[200px]">{(j.Booking || j.booking_id)?.pickup_location} &rarr; {(j.Booking || j.booking_id)?.dropoff_location}</span>
                      </div>
                    </td>
                    <td className="p-4" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="flex items-center font-semibold" style={{ color: 'var(--color-text-main)' }}>
                        <Users size={14} className="mr-1.5 text-ocean" />
                        {((j.Booking || j.booking_id)?.Customer || (j.Booking || j.booking_id)?.customer_id) ? 
                          `${((j.Booking || j.booking_id)?.Customer || (j.Booking || j.booking_id)?.customer_id)?.first_name} ${((j.Booking || j.booking_id)?.Customer || (j.Booking || j.booking_id)?.customer_id)?.last_name}` 
                          : 'Unknown Guest'}
                      </div>
                      <div className="text-xs mt-0.5 ml-5">{((j.Booking || j.booking_id)?.Customer || (j.Booking || j.booking_id)?.customer_id)?.phone}</div>
                    </td>
                    <td className="p-4" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="flex items-center font-semibold" style={{ color: 'var(--color-text-main)' }}>
                        <Truck size={14} className="mr-1.5 text-yellow" />
                        {(j.Driver || j.driver_id)?.name || 'Unassigned'}
                      </div>
                      <div className="text-xs mt-0.5 ml-5">{(j.Driver || j.driver_id)?.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold border ${getStatusColor(j.status)}`}>
                        {j.status ? j.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handlePrintJob(j)}
                          className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                          style={{ color: 'var(--color-text-main)' }}
                          title="Print Job Card"
                        >
                          <Printer size={15} />
                        </button>
                        <button 
                          onClick={() => openEditModal(j)}
                          className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                          style={{ color: 'var(--color-text-main)' }}
                          title="Update Status"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(j)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete Job Card"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal with Backup Option */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteJob}
        title="Delete Job Card"
        itemName={jobToDelete ? `${(jobToDelete.Booking || jobToDelete.booking_id)?.service_type || 'Job Card'} (${(jobToDelete.Driver || jobToDelete.driver_id)?.name || 'Unassigned'})` : ''}
        itemType="job"
        itemData={jobToDelete}
        isDeleting={isDeleting}
      />

      {/* Generate Job Card Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)}></div>
          
          <div className="card-glass w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl overflow-hidden relative z-10" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            <div className="bg-gradient-to-r from-ocean-dark to-ocean p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center">
                  + Generate Job Card
                </h3>
                <p className="text-blue-100 text-xs mt-0.5">Dispatch a driver to a confirmed booking.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Select Booking to Dispatch</label>
                <select 
                  required 
                  className="input-glass text-sm"
                  value={newJob.booking_id}
                  onChange={(e) => setNewJob({...newJob, booking_id: e.target.value})}
                >
                  <option value="">-- Choose Booking --</option>
                  {availableBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.booking_number} - {b.service_type} ({(b.Customer || b.customer_id)?.first_name} {(b.Customer || b.customer_id)?.last_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Assign Driver</label>
                <select 
                  required 
                  className="input-glass text-sm"
                  value={newJob.driver_id}
                  onChange={(e) => setNewJob({...newJob, driver_id: e.target.value})}
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Operational Notes (Optional)</label>
                <textarea 
                  className="input-glass text-sm resize-none h-20"
                  placeholder="E.g. Call guest 15 mins before arrival, VIP guest."
                  value={newJob.operational_notes}
                  onChange={(e) => setNewJob({...newJob, operational_notes: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-outline text-sm">Cancel</button>
                <button type="submit" className="btn-primary text-sm">Dispatch Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="card-glass w-full max-w-sm max-h-[88vh] flex flex-col rounded-2xl overflow-hidden relative z-10" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            <div className="bg-gradient-to-r from-ocean-dark to-ocean p-5 text-white flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold flex items-center">Update Dispatch Status</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Live Status</label>
                <select 
                  className="input-glass text-sm w-full"
                  value={editingJob?.status}
                  onChange={(e) => setEditingJob({...editingJob, status: e.target.value})}
                >
                  <option value="assigned">Assigned</option>
                  <option value="accepted">Accepted by Driver</option>
                  <option value="en_route">En Route to Pickup</option>
                  <option value="arrived">Arrived at Location</option>
                  <option value="passenger_onboard">Passenger Onboard</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Assign Driver</label>
                <select 
                  className="input-glass text-sm w-full"
                  value={editingJob?.driver_id?.id || editingJob?.driver_id || ''}
                  onChange={(e) => setEditingJob({...editingJob, driver_id: e.target.value})}
                >
                  <option value="">-- Unassigned --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button onClick={() => setIsEditModalOpen(false)} className="btn-outline text-sm">Cancel</button>
                <button onClick={handleUpdateJob} className="btn-primary text-sm">Save Status</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE JOB CARD */}
      {printingJob && (
        <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:bg-white print:text-black p-8">
          <div className="border-b-4 border-[#0E3F5D] pb-6 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold text-[#0E3F5D] tracking-tight">OCEAN GATE</h1>
              <p className="text-lg text-slate-500 font-medium">Operations & Dispatch</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-widest">JOB CARD</h2>
              <p className="text-slate-500 font-mono mt-1">Booking Ref: {(printingJob.Booking || printingJob.booking_id)?.booking_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Passenger Details</h3>
              <p className="text-xl font-bold text-slate-800">{((printingJob.Booking || printingJob.booking_id)?.Customer || (printingJob.Booking || printingJob.booking_id)?.customer_id)?.first_name} {((printingJob.Booking || printingJob.booking_id)?.Customer || (printingJob.Booking || printingJob.booking_id)?.customer_id)?.last_name}</p>
              <p className="text-slate-600 mt-1">📞 {((printingJob.Booking || printingJob.booking_id)?.Customer || (printingJob.Booking || printingJob.booking_id)?.customer_id)?.phone || 'N/A'}</p>
              <p className="text-slate-600 mt-3 font-bold text-[#0E3F5D]">
                Pax: {(printingJob.Booking || printingJob.booking_id)?.passengers?.adults || 1} Adult(s), {(printingJob.Booking || printingJob.booking_id)?.passengers?.children || 0} Child(ren)
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Assignment Details</h3>
              <p className="text-xl font-bold text-[#00AEEF]">{(printingJob.Booking || printingJob.booking_id)?.service_type}</p>
              <p className="text-slate-600 mt-1 font-bold">Driver: {(printingJob.Driver || printingJob.driver_id)?.name || 'Pending'}</p>
              <p className="text-slate-600">Driver Phone: {(printingJob.Driver || printingJob.driver_id)?.phone || 'Pending'}</p>
              <p className="text-slate-600 mt-3">📅 Date: {new Date((printingJob.Booking || printingJob.booking_id)?.service_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Logistics Route</h3>
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-slate-500 font-medium w-1/3">Pickup Location</th>
                  <td className="py-3 font-bold text-slate-800 text-lg">{(printingJob.Booking || printingJob.booking_id)?.pickup_location || 'TBD'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-slate-500 font-medium w-1/3">Drop-off Location</th>
                  <td className="py-3 font-bold text-slate-800 text-lg">{(printingJob.Booking || printingJob.booking_id)?.dropoff_location || 'TBD'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-slate-500 font-medium w-1/3">Hotel details</th>
                  <td className="py-3 font-bold text-slate-800">
                    {(printingJob.Booking || printingJob.booking_id)?.hotel_name ? `${(printingJob.Booking || printingJob.booking_id).hotel_name} (Room: ${(printingJob.Booking || printingJob.booking_id).room_type || 'Ask Reception'})` : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#F7CF32]/10 p-6 rounded-2xl border border-[#F7CF32]/30 mb-8">
            <h3 className="text-sm font-bold text-[#b59518] uppercase tracking-wider mb-2">Operational Notes & Instructions</h3>
            <p className="text-slate-800 whitespace-pre-wrap font-medium">
              {printingJob.operational_notes || 'No special instructions. Please ensure professional service and arrive 15 minutes early.'}
            </p>
          </div>

          <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-200">
            <p className="font-bold text-red-500 mb-2">DO NOT DISCUSS PRICING WITH THE GUEST.</p>
            <p>For operations support, contact Dispatch: +971 50 000 0000</p>
          </div>
        </div>
      )}

    </Layout>
  );
}

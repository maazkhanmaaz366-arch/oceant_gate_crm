import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { Edit2, Trash2, Download, X, AlertCircle, HeartPulse, Utensils, Calendar, UserPlus } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { downloadJsonBackup } from '../../utils/backupUtils';

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ first_name: '', last_name: '', phone: '', email: '' });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      const customersList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setCustomers(customersList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer({
      ...customer,
      date_of_birth: customer.date_of_birth ? customer.date_of_birth.split('T')[0] : '',
      dietary_requirements: customer.dietary_requirements || '',
      medical_conditions: customer.medical_conditions || '',
      emergency_contact: customer.emergency_contact || { name: '', phone: '', relationship: '' }
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCustomer = async () => {
    try {
      const customerId = editingCustomer.id || editingCustomer._id;
      await api.put(`/customers/${customerId}`, editingCustomer);
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update customer", error);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', newCustomer);
      setIsCreateModalOpen(false);
      setNewCustomer({ first_name: '', last_name: '', phone: '', email: '' });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to create customer", error);
      alert("Failed to create guest. Check required fields.");
    }
  };

  const openDeleteModal = (customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      const customerId = customerToDelete.id || customerToDelete._id;
      await api.delete(`/customers/${customerId}`);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer", error);
      alert("Failed to delete customer profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportAll = () => {
    downloadJsonBackup(customers, 'oceangate_all_guests_backup');
  };

  return (
    <Layout title="Customers">
      <div className="card-glass overflow-hidden relative">
        <div className="p-4 sm:p-6 border-b border-black/5 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
              Operations Database
            </h2>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Manage guest logistics, dietary needs, and safety profiles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              className="btn-outline flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3"
              onClick={handleExportAll}
              title="Download Full Database Snapshot (JSON)"
            >
              <Download size={15} /> Export Guests
            </button>
            <button className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3" onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus size={15} /> + New Guest
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="table-glass-header">
              <tr>
                <th className="p-5">Guest Profile</th>
                <th className="p-5">Contact Details</th>
                <th className="p-5"><Calendar className="w-4 h-4 inline mr-1 text-ocean" /> DOB / Nat.</th>
                <th className="p-5"><Utensils className="w-4 h-4 inline mr-1 text-yellow" /> Dietary</th>
                <th className="p-5"><HeartPulse className="w-4 h-4 inline mr-1 text-red-400" /> Medical</th>
                <th className="p-5"><AlertCircle className="w-4 h-4 inline mr-1 text-orange-400" /> Emergency</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400 animate-pulse">Loading guest data...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No customers found. Convert a lead to create one!</td></tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id || c._id} className="table-glass-row group">
                    <td className="p-5">
                      <div className="font-bold text-base" style={{ color: 'var(--color-text-main)' }}>
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Joined {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-5" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="text-ocean hover:text-ocean-dark font-medium transition-colors cursor-pointer">{c.email || 'No Email'}</div>
                      <div className="mt-1" style={{ color: 'var(--color-text-main)' }}>{c.phone}</div>
                    </td>
                    <td className="p-5" style={{ color: 'var(--color-text-muted)' }}>
                      <div style={{ color: 'var(--color-text-main)' }}>{c.date_of_birth ? new Date(c.date_of_birth).toLocaleDateString() : <span className="text-slate-400 italic">Not set</span>}</div>
                      <div className="text-xs mt-1">{c.nationality || 'Unknown'}</div>
                    </td>
                    <td className="p-5">
                      {c.dietary_requirements && c.dietary_requirements.toLowerCase() !== 'none' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow/10 text-yellow-dark dark:text-yellow border border-yellow/20">
                          {c.dietary_requirements}
                        </span>
                      ) : <span className="text-slate-400">None</span>}
                    </td>
                    <td className="p-5">
                      {c.medical_conditions && c.medical_conditions.toLowerCase() !== 'none' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                          {c.medical_conditions}
                        </span>
                      ) : <span className="text-slate-400">None</span>}
                    </td>
                    <td className="p-5">
                      {c.emergency_contact?.name ? (
                        <>
                          <div className="font-semibold" style={{ color: 'var(--color-text-main)' }}>{c.emergency_contact.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            {c.emergency_contact.phone} <span>({c.emergency_contact.relationship || 'N/A'})</span>
                          </div>
                        </>
                      ) : <span className="text-slate-400 italic">Not provided</span>}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                          style={{ color: 'var(--color-text-main)' }}
                          title="Edit Customer Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(c)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete Customer Profile"
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
        onConfirm={handleDeleteCustomer}
        title="Delete Guest Profile"
        itemName={customerToDelete ? `${customerToDelete.first_name} ${customerToDelete.last_name}` : ''}
        itemType="customer"
        itemData={customerToDelete}
        isDeleting={isDeleting}
      />

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>

          <div className="card-glass rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl relative z-10" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            <div className="p-5 border-b border-black/10 dark:border-white/10 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold flex items-center" style={{ color: 'var(--color-text-main)' }}>
                <Edit2 className="mr-2 text-ocean" size={20} /> Edit Guest Profile
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
              {/* Basic Info */}
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <h4 className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Guest</h4>
                <div className="font-bold text-base" style={{ color: 'var(--color-text-main)' }}>{editingCustomer?.first_name} {editingCustomer?.last_name}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{editingCustomer?.email} • {editingCustomer?.phone}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Date of Birth</label>
                  <input
                    type="date"
                    className="input-glass text-sm"
                    value={editingCustomer?.date_of_birth || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Nationality</label>
                  <input
                    type="text"
                    className="input-glass text-sm"
                    value={editingCustomer?.nationality || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, nationality: e.target.value })}
                    placeholder="e.g. British, UAE"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                  <Utensils size={14} className="mr-1.5 text-yellow" /> Dietary Requirements
                </label>
                <input
                  type="text"
                  className="input-glass text-sm"
                  value={editingCustomer?.dietary_requirements || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, dietary_requirements: e.target.value })}
                  placeholder="e.g. Vegetarian, Halal, No Nuts (or 'None')"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                  <HeartPulse size={14} className="mr-1.5 text-red-400" /> Medical Conditions
                </label>
                <input
                  type="text"
                  className="input-glass text-sm"
                  value={editingCustomer?.medical_conditions || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, medical_conditions: e.target.value })}
                  placeholder="e.g. Asthma, Wheelchair required (or 'None')"
                />
              </div>

              <div className="border-t border-black/10 dark:border-white/10 pt-4">
                <label className="block text-xs font-bold uppercase mb-3 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                  <AlertCircle size={14} className="mr-1.5 text-orange-400" /> Emergency Contact
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    className="input-glass text-sm"
                    value={editingCustomer?.emergency_contact?.name || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, emergency_contact: { ...editingCustomer.emergency_contact, name: e.target.value } })}
                    placeholder="Contact Name"
                  />
                  <input
                    type="text"
                    className="input-glass text-sm"
                    value={editingCustomer?.emergency_contact?.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, emergency_contact: { ...editingCustomer.emergency_contact, phone: e.target.value } })}
                    placeholder="Contact Phone"
                  />
                  <input
                    type="text"
                    className="input-glass text-sm"
                    value={editingCustomer?.emergency_contact?.relationship || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, emergency_contact: { ...editingCustomer.emergency_contact, relationship: e.target.value } })}
                    placeholder="Relationship"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-black/10 dark:border-white/10 flex justify-end gap-3 shrink-0" style={{ backgroundColor: 'var(--color-card-bg)' }}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCustomer}
                className="btn-primary text-sm"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)}></div>

          <div className="card-glass w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl overflow-hidden relative z-10" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            <div className="bg-gradient-to-r from-ocean-dark to-ocean p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center">
                  + Add New Guest
                </h3>
                <p className="text-blue-100 text-xs mt-0.5">Manually enter a walk-in guest.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>First Name</label>
                  <input
                    required
                    type="text"
                    className="input-glass text-sm"
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Last Name</label>
                  <input
                    required
                    type="text"
                    className="input-glass text-sm"
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Phone Number</label>
                <input
                  required
                  type="tel"
                  className="input-glass text-sm"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Email Address (Optional)</label>
                <input
                  type="email"
                  className="input-glass text-sm"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm"
                >
                  Create Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

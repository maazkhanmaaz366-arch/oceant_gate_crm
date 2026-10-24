import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../lib/api';
import { Edit2, Trash2, Download, X, DollarSign, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { downloadJsonBackup } from '../../utils/backupUtils';

export function Payments() {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [newPayment, setNewPayment] = useState({ 
    type: 'receivable',
    amount: '',
    currency: 'USD',
    method: 'cash',
    booking_id: '', 
    customer_id: '',
    supplier_id: '',
    reference: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, bookingsRes, customersRes, driversRes] = await Promise.all([
        api.get('/payments'),
        api.get('/bookings'),
        api.get('/customers'),
        api.get('/drivers')
      ]);
      setPayments(Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []));
      setBookings(Array.isArray(bookingsRes?.data) ? bookingsRes.data : (Array.isArray(bookingsRes) ? bookingsRes : []));
      setCustomers(Array.isArray(customersRes?.data) ? customersRes.data : (Array.isArray(customersRes) ? customersRes : []));
      setDrivers(Array.isArray(driversRes?.data) ? driversRes.data : (Array.isArray(driversRes) ? driversRes : []));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newPayment, amount: Number(newPayment.amount) };
      if (!payload.booking_id) delete payload.booking_id;
      if (!payload.customer_id) delete payload.customer_id;
      if (!payload.supplier_id) delete payload.supplier_id;

      await api.post('/payments', payload);
      setIsCreateModalOpen(false);
      setNewPayment({ 
        type: 'receivable', amount: '', currency: 'USD', method: 'cash', 
        booking_id: '', customer_id: '', supplier_id: '', reference: '', description: '' 
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create payment", error);
      alert("Failed to record payment. Check required fields.");
    }
  };

  const openEditModal = (payment) => {
    setEditingPayment({ ...payment });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (payment) => {
    setPaymentToDelete(payment);
    setDeleteModalOpen(true);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      const paymentId = paymentToDelete.id || paymentToDelete._id;
      await api.delete(`/payments/${paymentId}`);
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete payment", error);
      alert("Failed to delete payment record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportAll = () => {
    downloadJsonBackup(payments, 'oceangate_all_payments_backup');
  };

  const handleUpdatePayment = async () => {
    try {
      await api.put(`/payments/${editingPayment.id}`, { status: editingPayment.status });
      setIsEditModalOpen(false);
      setEditingPayment(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update payment status", error);
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow/10 text-yellow-dark dark:text-yellow border-yellow/30';
      case 'refunded': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'failed': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  // Calculate Totals safely
  const totalReceivables = payments
    .filter(p => (p.type || 'receivable').toLowerCase() === 'receivable' && (p.status || 'completed').toLowerCase() === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalPayables = payments
    .filter(p => (p.type || '').toLowerCase() === 'payable' && (p.status || 'completed').toLowerCase() === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <Layout title="Payments Ledger">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="card-glass p-4 sm:p-6 flex items-center relative overflow-hidden">
          <div className="bg-green-500/10 text-green-500 p-3 sm:p-4 rounded-2xl mr-3 sm:mr-4 border border-green-500/20 shrink-0">
            <ArrowUpRight size={28} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Total Receivables</h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-green-500">${totalReceivables.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div className="card-glass p-4 sm:p-6 flex items-center relative overflow-hidden">
          <div className="bg-red-500/10 text-red-500 p-3 sm:p-4 rounded-2xl mr-3 sm:mr-4 border border-red-500/20 shrink-0">
            <ArrowDownRight size={28} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Total Payables</h3>
            <p className="text-2xl sm:text-3xl font-extrabold text-red-500">${totalPayables.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="card-glass overflow-hidden relative">
        <div className="p-4 sm:p-6 border-b border-black/5 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-main)' }}>Ledger</h2>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Track all inflows, outflows, and invoices.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              className="btn-outline flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3" 
              onClick={handleExportAll}
              title="Download Full Payments Snapshot (JSON)"
            >
              <Download size={15} /> Export Payments
            </button>
            <button className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={15} /> + Record Payment
            </button>
          </div>
        </div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="table-glass-header">
              <tr>
                <th className="p-4 font-bold">Reference</th>
                <th className="p-4 font-bold">Related To</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Method</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No payment logs found.</td></tr>
              ) : (
                payments.map(p => {
                  const pType = (p.type || 'receivable').toLowerCase();
                  return (
                    <tr key={p.id} className="table-glass-row group">
                      <td className="p-4">
                        <div className="font-bold" style={{ color: 'var(--color-text-main)' }}>{p.reference || `PAY-${(p.id || '').slice(0, 8).toUpperCase()}`}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{new Date(p.createdAt || p.processed_at || Date.now()).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4" style={{ color: 'var(--color-text-muted)' }}>
                        <div style={{ color: 'var(--color-text-main)' }}>
                          {p.Booking ? `Booking: ${p.Booking.booking_number || p.Booking.id}` : p.Customer ? `Customer: ${p.Customer.first_name} ${p.Customer.last_name}` : p.description || 'General Ledger'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs uppercase tracking-wide font-bold ${pType === 'receivable' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                          {pType}
                        </span>
                      </td>
                      <td className="p-4 capitalize" style={{ color: 'var(--color-text-main)' }}>{p.method?.replace('_', ' ') || 'Cash'}</td>
                      <td className="p-4 font-bold text-base text-ocean">
                        {p.currency} {p.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-bold border ${getStatusColor(p.status)}`}>
                          {p.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(p)}
                            className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                            style={{ color: 'var(--color-text-main)' }}
                            title="Update Payment Status"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(p)}
                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                            title="Delete Payment Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeletePayment}
        title="Delete Payment Record"
        itemName={paymentToDelete ? `${paymentToDelete.reference || 'Transaction'} (${paymentToDelete.currency} ${paymentToDelete.amount})` : ''}
        itemType="payment"
        itemData={paymentToDelete}
        isDeleting={isDeleting}
      />

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)}></div>
          
          <div className="card-glass w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden relative z-10" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            <div className="bg-gradient-to-r from-ocean-dark to-ocean p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center">
                  <DollarSign size={22} className="mr-1.5" />
                  Log Transaction
                </h3>
                <p className="text-blue-100 text-xs mt-0.5">Record an incoming payment or expense.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreatePayment} className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Transaction Type</label>
                  <select required className="input-glass text-sm" value={newPayment.type} onChange={(e) => setNewPayment({...newPayment, type: e.target.value})}>
                    <option value="receivable">Receivable (Income)</option>
                    <option value="payable">Payable (Expense)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Payment Method</label>
                  <select required className="input-glass text-sm" value={newPayment.method} onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}>
                    <option value="cash">Cash</option>
                    <option value="card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="payment_link">Payment Link</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Amount</label>
                  <input required type="number" step="0.01" min="0" className="input-glass text-sm" value={newPayment.amount} onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Currency</label>
                  <select required className="input-glass text-sm" value={newPayment.currency} onChange={(e) => setNewPayment({...newPayment, currency: e.target.value})}>
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (AED)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <hr className="border-black/10 dark:border-white/10" />

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Related Booking (Optional)</label>
                <select className="input-glass text-sm" value={newPayment.booking_id} onChange={(e) => setNewPayment({...newPayment, booking_id: e.target.value})}>
                  <option value="">-- None --</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.id}>{b.booking_number} - {b.service_type}</option>
                  ))}
                </select>
              </div>

              {newPayment.type === 'receivable' ? (
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Customer (Optional)</label>
                  <select className="input-glass text-sm" value={newPayment.customer_id} onChange={(e) => setNewPayment({...newPayment, customer_id: e.target.value, supplier_id: ''})}>
                    <option value="">-- None --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Supplier / Driver (Optional)</label>
                  <select className="input-glass text-sm" value={newPayment.supplier_id} onChange={(e) => setNewPayment({...newPayment, supplier_id: e.target.value, customer_id: ''})}>
                    <option value="">-- None --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Reference ID / Memo</label>
                <input type="text" className="input-glass text-sm" placeholder="e.g. Inv-1024 or Notes" value={newPayment.reference} onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})} />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-outline text-sm">Cancel</button>
                <button type="submit" className="btn-primary text-sm">Record Transaction</button>
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
              <h3 className="text-xl font-bold flex items-center">Update Payment Status</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                <select 
                  className="input-glass text-sm"
                  value={editingPayment?.status}
                  onChange={(e) => setEditingPayment({...editingPayment, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button onClick={() => setIsEditModalOpen(false)} className="btn-outline text-sm">Cancel</button>
                <button onClick={handleUpdatePayment} className="btn-primary text-sm">Save Status</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

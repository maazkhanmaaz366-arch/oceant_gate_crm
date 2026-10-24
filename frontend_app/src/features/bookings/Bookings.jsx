import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Edit2, Trash2, Download, Printer, Plus, Globe, Check } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal';
import { downloadJsonBackup } from '../../utils/backupUtils';

export function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  
  // Print & Translation State
  const [printingBooking, setPrintingBooking] = useState(null);
  const [ticketLanguage, setTicketLanguage] = useState('en'); // 'en' | 'ar' | 'ru'

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      const bookingsList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setBookings(bookingsList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (booking) => {
    setBookingToDelete(booking);
    setDeleteModalOpen(true);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    setIsDeleting(true);
    try {
      const bookingId = bookingToDelete.id || bookingToDelete._id;
      await api.delete(`/bookings/${bookingId}`);
      setDeleteModalOpen(false);
      setBookingToDelete(null);
      fetchBookings();
    } catch (error) {
      console.error("Failed to delete booking", error);
      alert("Failed to delete booking.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportAll = () => {
    downloadJsonBackup(bookings, 'oceangate_all_bookings_backup');
  };

  const handlePrintBooking = (booking, lang = 'en') => {
    setTicketLanguage(lang);
    setPrintingBooking(booking);
    setTimeout(() => {
      window.print();
      setPrintingBooking(null);
    }, 400);
  };

  const openEditModal = (booking) => {
    setEditingBooking({
      id: booking.id || booking._id,
      status: booking.status,
      customer_price: booking.financials?.customer_price || booking.customer_price || 0,
      pickup_location: booking.logistics?.pickup_location || booking.pickup_location || '',
      dropoff_location: booking.logistics?.dropoff_location || booking.dropoff_location || '',
      hotel_name: booking.logistics?.hotel_name || booking.hotel_name || '',
      room_type: booking.logistics?.room_type || booking.room_type || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateBooking = async () => {
    try {
      await api.put(`/bookings/${editingBooking.id}`, {
        status: editingBooking.status,
        customer_price: editingBooking.customer_price,
        pickup_location: editingBooking.pickup_location,
        dropoff_location: editingBooking.dropoff_location,
        hotel_name: editingBooking.hotel_name,
        room_type: editingBooking.room_type
      });
      setIsEditModalOpen(false);
      setEditingBooking(null);
      fetchBookings();
    } catch (error) {
      console.error("Failed to update booking", error);
      alert("Failed to update booking.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'draft': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default: return 'bg-yellow/10 text-yellow-dark dark:text-yellow border-yellow/20';
    }
  };

  // Translations dictionary for printable itinerary ticket
  const T = {
    en: {
      agency: 'OCEAN GATE',
      sub: 'Travel & Tours Dubai',
      confirmation: 'Booking Confirmation',
      ref: 'Ref',
      status: 'CONFIRMED',
      custDetails: 'Customer Details',
      phone: 'Phone',
      email: 'Email',
      serviceOverview: 'Service Overview',
      date: 'Date',
      pax: 'Passengers',
      adults: 'Adult(s)',
      children: 'Child(ren)',
      logistics: 'Logistics & Locations',
      pickup: 'Pickup Location',
      dropoff: 'Drop-off Location',
      hotel: 'Hotel Details',
      totalPrice: 'Total Price Paid',
      thanks: 'Thank you for choosing OceanGate Travel & Tours.',
      support: 'For 24/7 VIP concierge, contact us at concierge@oceangate.ae or +971 50 123 4567.',
      dir: 'ltr'
    },
    ar: {
      agency: 'أوشن جيت',
      sub: 'للسياحة والسفر دبي',
      confirmation: 'تأكيد الحجز الرسمي',
      ref: 'رقم المرجع',
      status: 'مؤكد',
      custDetails: 'بيانات العميل',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      serviceOverview: 'تفاصيل الخدمة والرحلة',
      date: 'تاريخ الخدمة',
      pax: 'عدد الركاب',
      adults: 'بالغ',
      children: 'أطفال',
      logistics: 'الخدمات اللوجستية والمواقع',
      pickup: 'موقع الاستلام والتحرك',
      dropoff: 'موقع الوصول والتوصيل',
      hotel: 'تفاصيل الفندق والغرفة',
      totalPrice: 'إجمالي المبلغ المدفوع',
      thanks: 'شكراً لاختياركم أوشن جيت للسياحة والرحلات الفاخرة.',
      support: 'لخدمة كونسيرج كبار الشخصيات على مدار الساعة: concierge@oceangate.ae أو 4567 123 50 971+',
      dir: 'rtl'
    },
    ru: {
      agency: 'OCEAN GATE',
      sub: 'Туры и Путешествия Дубай',
      confirmation: 'Подтверждение Бронирования',
      ref: 'Номер брони',
      status: 'ПОДТВЕРЖДЕНО',
      custDetails: 'Данные Клиента',
      phone: 'Телефон',
      email: 'Эл. почта',
      serviceOverview: 'Информация об Услуге',
      date: 'Дата',
      pax: 'Пассажиры',
      adults: 'Взрослых',
      children: 'Детей',
      logistics: 'Маршрут и Логистика',
      pickup: 'Место встречи / Посадки',
      dropoff: 'Место высадки',
      hotel: 'Отель и Номер',
      totalPrice: 'Итого Оплачено',
      thanks: 'Благодарим вас за выбор OceanGate Travel & Tours.',
      support: 'Круглосуточная VIP поддержка: concierge@oceangate.ae или +971 50 123 4567.',
      dir: 'ltr'
    }
  };

  const currT = T[ticketLanguage] || T.en;

  return (
    <Layout title="Bookings">
      <div className="card-glass overflow-hidden relative print:hidden">
        <div className="p-4 sm:p-6 border-b border-black/5 dark:border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text-main)' }}>
              All Bookings & Itineraries
            </h2>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Monitor and edit scheduled itineraries, passenger logistics, and multi-lingual client vouchers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              className="btn-outline flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs sm:text-sm py-2 px-3"
              onClick={handleExportAll}
              title="Download Full Bookings Snapshot (JSON)"
            >
              <Download size={15} /> Export Bookings
            </button>
            <button className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3" onClick={() => navigate('/bookings/new')}>
              <Plus size={15} /> + New Booking
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="table-glass-header">
              <tr>
                <th className="p-4 font-bold">Booking #</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Service</th>
                <th className="p-4 font-bold">Logistics</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">No bookings yet.</td></tr>
              ) : (
                bookings.map(b => (
                  <tr key={b.id} className="table-glass-row group">
                    <td className="p-4 font-bold" style={{ color: 'var(--color-text-main)' }}>
                      {b.booking_number}
                    </td>
                    <td className="p-4" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="font-semibold" style={{ color: 'var(--color-text-main)' }}>
                        {(b.Customer || b.customer_id)?.first_name} {(b.Customer || b.customer_id)?.last_name}
                      </div>
                      <div className="text-xs mt-0.5">{(b.Customer || b.customer_id)?.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="font-semibold text-ocean">{b.service_type}</div>
                      <div className="text-xs mt-0.5">
                        {b.passengers?.adults || 1} Adult(s), {b.passengers?.children || 0} Child(ren)
                      </div>
                    </td>
                    <td className="p-4" style={{ color: 'var(--color-text-muted)' }}>
                      <div className="text-xs truncate max-w-[200px]" style={{ color: 'var(--color-text-main)' }}>
                        {b.pickup_location} &rarr; {b.dropoff_location}
                      </div>
                      <div className="text-xs truncate max-w-[200px] mt-0.5">
                        {b.hotel_name ? `${b.hotel_name} (${b.room_type || 'Standard'})` : 'No Hotel'}
                      </div>
                    </td>
                    <td className="p-4" style={{ color: 'var(--color-text-main)' }}>
                      {new Date(b.service_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-ocean">
                      ${b.customer_price}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold border ${getStatusColor(b.status)}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        
                        {/* Multi-Lingual Print Dropdown Menu */}
                        <div className="relative group/lang">
                          <button
                            className="p-2 bg-black/5 dark:bg-white/5 hover:bg-ocean hover:text-white rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                            style={{ color: 'var(--color-text-main)' }}
                            title="Print Voucher PDF"
                          >
                            <Printer size={15} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 hidden group-hover/lang:flex flex-col bg-white dark:bg-slate-900 shadow-xl border border-black/10 dark:border-white/10 rounded-xl p-1 z-30 min-w-[120px]">
                            <button
                              onClick={() => handlePrintBooking(b, 'en')}
                              className="px-3 py-1.5 text-xs text-left font-bold hover:bg-ocean hover:text-white rounded-lg transition-colors flex items-center justify-between"
                            >
                              <span>🇬🇧 English</span>
                            </button>
                            <button
                              onClick={() => handlePrintBooking(b, 'ar')}
                              className="px-3 py-1.5 text-xs text-left font-bold hover:bg-ocean hover:text-white rounded-lg transition-colors flex items-center justify-between"
                            >
                              <span>🇦🇪 العربية</span>
                            </button>
                            <button
                              onClick={() => handlePrintBooking(b, 'ru')}
                              className="px-3 py-1.5 text-xs text-left font-bold hover:bg-ocean hover:text-white rounded-lg transition-colors flex items-center justify-between"
                            >
                              <span>🇷🇺 Русский</span>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => openEditModal(b)}
                          className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                          style={{ color: 'var(--color-text-main)' }}
                          title="Edit Booking"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(b)}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete Booking"
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteBooking}
        title="Delete Booking"
        itemName={bookingToDelete ? `${bookingToDelete.booking_number || 'Booking'} (${bookingToDelete.service_type})` : ''}
        itemType="booking"
        itemData={bookingToDelete}
        isDeleting={isDeleting}
      />

      {/* Edit Status Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>

          <div className="card-glass w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl overflow-hidden relative z-10" style={{ backgroundColor: 'var(--color-card-bg)' }}>
            <div className="bg-gradient-to-r from-ocean-dark to-ocean p-5 text-white flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold flex items-center">
                Edit Booking
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Booking Status</label>
                <select
                  className="input-glass text-sm w-full"
                  value={editingBooking?.status}
                  onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="pending_confirmation">Pending Confirmation</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Customer Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-glass text-sm w-full"
                  value={editingBooking?.customer_price || 0}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customer_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Pickup Location</label>
                  <input
                    type="text"
                    className="input-glass text-sm w-full"
                    placeholder="E.g. Dubai Marina"
                    value={editingBooking?.pickup_location || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, pickup_location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Dropoff Location</label>
                  <input
                    type="text"
                    className="input-glass text-sm w-full"
                    placeholder="E.g. Burj Khalifa"
                    value={editingBooking?.dropoff_location || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, dropoff_location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Hotel Name</label>
                  <input
                    type="text"
                    className="input-glass text-sm w-full"
                    placeholder="E.g. Atlantis The Palm"
                    value={editingBooking?.hotel_name || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, hotel_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-muted)' }}>Room Type</label>
                  <input
                    type="text"
                    className="input-glass text-sm w-full"
                    placeholder="E.g. King Suite"
                    value={editingBooking?.room_type || ''}
                    onChange={(e) => setEditingBooking({ ...editingBooking, room_type: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBooking}
                  className="btn-primary text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-LINGUAL PRINTABLE CONFIRMATION TICKET */}
      {printingBooking && (
        <div 
          dir={currT.dir}
          className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:bg-white print:text-black p-8"
        >
          <div className="border-b-4 border-[#0E3F5D] pb-6 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold text-[#0E3F5D] tracking-tight">{currT.agency}</h1>
              <p className="text-lg text-slate-500 font-medium">{currT.sub}</p>
            </div>
            <div className={currT.dir === 'rtl' ? 'text-left' : 'text-right'}>
              <h2 className="text-2xl font-bold text-slate-800">{currT.confirmation}</h2>
              <p className="text-slate-500 font-mono mt-1">{currT.ref}: {printingBooking.booking_number}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full border border-green-200">
                {currT.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{currT.custDetails}</h3>
              <p className="text-xl font-bold text-slate-800">{(printingBooking.Customer || printingBooking.customer_id)?.first_name} {(printingBooking.Customer || printingBooking.customer_id)?.last_name}</p>
              <p className="text-slate-600 mt-1">📞 {(printingBooking.Customer || printingBooking.customer_id)?.phone || 'N/A'}</p>
              <p className="text-slate-600">✉️ {(printingBooking.Customer || printingBooking.customer_id)?.email || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{currT.serviceOverview}</h3>
              <p className="text-xl font-bold text-[#00AEEF]">{printingBooking.service_type}</p>
              <p className="text-slate-600 mt-1">📅 {new Date(printingBooking.service_date).toLocaleDateString()}</p>
              <p className="text-slate-600">👥 {printingBooking.passengers?.adults || 1} {currT.adults}, {printingBooking.passengers?.children || 0} {currT.children}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">{currT.logistics}</h3>
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-slate-500 font-medium w-1/3">{currT.pickup}</th>
                  <td className="py-3 font-bold text-slate-800">{printingBooking.pickup_location || 'TBD'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-slate-500 font-medium w-1/3">{currT.dropoff}</th>
                  <td className="py-3 font-bold text-slate-800">{printingBooking.dropoff_location || 'TBD'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-slate-500 font-medium w-1/3">{currT.hotel}</th>
                  <td className="py-3 font-bold text-slate-800">
                    {printingBooking.hotel_name ? `${printingBooking.hotel_name} (Room: ${printingBooking.room_type || 'Standard'})` : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#F4F9FC] p-6 rounded-2xl border border-[#00AEEF]/20 flex justify-between items-center mb-12">
            <h3 className="text-xl font-bold text-[#0E3F5D]">{currT.totalPrice}</h3>
            <p className="text-3xl font-black text-[#00AEEF]">${printingBooking.customer_price?.toLocaleString() || 0}</p>
          </div>

          <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-200">
            <p>{currT.thanks}</p>
            <p>{currT.support}</p>
          </div>
        </div>
      )}

    </Layout>
  );
}

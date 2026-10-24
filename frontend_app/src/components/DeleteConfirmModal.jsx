import React, { useState } from 'react';
import { AlertTriangle, Download, Trash2, X, ShieldAlert } from 'lucide-react';
import { downloadJsonBackup } from '../utils/backupUtils';

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  itemName = "",
  itemType = "record",
  itemData = null,
  isDeleting = false
}) {
  const [autoBackup, setAutoBackup] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (autoBackup && itemData) {
      downloadJsonBackup(itemData, `backup_${itemType}_${itemName.replace(/[^a-zA-Z0-9_-]/g, '_')}`);
    }
    await onConfirm();
  };

  const handleManualDownload = () => {
    if (itemData) {
      downloadJsonBackup(itemData, `backup_${itemType}_${itemName.replace(/[^a-zA-Z0-9_-]/g, '_')}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="card-glass border border-red-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-slide-up" style={{ backgroundColor: 'var(--color-card-bg)' }}>

        {/* Header */}
        <div className="bg-red-500/10 border-b border-red-500/20 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-500 rounded-xl border border-red-500/30">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-main)' }}>{title}</h3>
              <p className="text-xs text-red-500 font-semibold">Irreversible Action</p>
            </div>
          </div>
          {!isDeleting && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Are you sure you want to permanently delete{' '}
            <span className="font-bold px-2 py-0.5 rounded border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5" style={{ color: 'var(--color-text-main)' }}>
              {itemName || `this ${itemType}`}
            </span>?
          </p>

          <div className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span className="font-bold" style={{ color: 'var(--color-text-main)' }}>Data Safety Notice:</span> Once deleted, all associated records and history will be unlinked.
              </div>
            </div>

            {/* Optional Backup Options */}
            <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none" style={{ color: 'var(--color-text-main)' }}>
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-400 dark:border-slate-600 text-ocean focus:ring-ocean accent-ocean"
                />
                <span>Download JSON backup before deleting (Recommended)</span>
              </label>

              {itemData && (
                <button
                  type="button"
                  onClick={handleManualDownload}
                  className="text-xs text-ocean hover:text-ocean-dark flex items-center gap-1.5 self-start font-bold py-1 px-2.5 rounded-lg bg-ocean/10 hover:bg-ocean/20 transition-colors border border-ocean/20"
                >
                  <Download size={13} />
                  <span>Download Backup Snapshot Now</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-black/10 dark:border-white/10 flex justify-end gap-3" style={{ backgroundColor: 'var(--color-card-bg)' }}>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="btn-outline text-xs py-2 px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Confirm & Delete</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

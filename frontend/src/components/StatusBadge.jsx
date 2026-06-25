import React from 'react';

export default function StatusBadge({ status }) {
  let label = 'Menunggu';
  let className = 'badge-pending';

  switch (status) {
    case 'pending':
      label = 'Menunggu Verifikasi';
      className = 'badge-pending';
      break;
    case 'approved':
      label = 'Disetujui & Terjadwal';
      className = 'badge-approved';
      break;
    case 'distributing':
      label = 'Dalam Pengiriman';
      className = 'badge-distributing';
      break;
    case 'completed':
      label = 'Selesai Didistribusikan';
      className = 'badge-completed';
      break;
    case 'rejected':
      label = 'Ditolak';
      className = 'badge-rejected';
      break;
    default:
      label = status;
      className = 'badge-pending';
  }

  return <span className={`badge ${className}`}>{label}</span>;
}

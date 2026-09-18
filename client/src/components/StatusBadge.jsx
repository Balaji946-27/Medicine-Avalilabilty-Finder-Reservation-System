// StatusBadge maps a status string to the appropriate CSS class and label.
// Status values: available | low | unavailable | pending | confirmed | cancelled | verified

const STATUS_CONFIG = {
  available:   { label: 'Available',    className: 'badge badge-available',   dot: 'green' },
  low:         { label: 'Low Stock',    className: 'badge badge-low',          dot: 'amber' },
  unavailable: { label: 'Unavailable',  className: 'badge badge-unavailable',  dot: 'red'   },
  pending:     { label: 'Pending',      className: 'badge badge-pending',      dot: 'amber' },
  confirmed:   { label: 'Confirmed',    className: 'badge badge-confirmed',    dot: 'green' },
  cancelled:   { label: 'Cancelled',    className: 'badge badge-cancelled',    dot: 'red'   },
  verified:    { label: 'Verified',     className: 'badge badge-verified',     dot: 'green' },
};

const StatusBadge = ({ status = 'unavailable' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unavailable;

  return (
    <span className={config.className}>
      <span className={`status-dot ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;

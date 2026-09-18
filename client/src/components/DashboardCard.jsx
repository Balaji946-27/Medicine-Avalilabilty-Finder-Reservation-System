const DashboardCard = ({
  title,
  value,
  icon = '📊',
  colorClass = 'teal',
  subtitle,
  trend,
}) => {
  return (
    <div className="dashboard-card">
      <div className={`dashboard-card-icon ${colorClass}`}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p className="dashboard-card-label">{title}</p>
        <p className="dashboard-card-value">{value ?? '—'}</p>
        {subtitle && (
          <p className="dashboard-card-sub">{subtitle}</p>
        )}
        {trend && (
          <p
            className="dashboard-card-sub"
            style={{
              color: trend > 0 ? 'var(--success)' : 'var(--danger)',
              fontWeight: 600,
            }}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;

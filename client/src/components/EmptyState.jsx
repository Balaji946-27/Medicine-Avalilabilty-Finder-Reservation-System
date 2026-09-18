const EmptyState = ({
  icon = '📭',
  title = 'No results found',
  description = 'There is nothing to display here yet.',
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{description}</p>
      {action && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;

const ErrorMessage = ({ message = 'Something went wrong. Please try again.', onRetry }) => {
  return (
    <div className="error-message">
      <span className="error-icon">⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-ghost"
          style={{ marginLeft: 'auto', flexShrink: 0 }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p className="text-muted text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
      <p className="text-muted text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Chart A: Daily Reservation Trends (Last 7 Days)
export const DailyReservationTrendsChart = ({ data = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = data.map((d) => d.label || d.date);
    const counts = data.map((d) => d.count || 0);
    const total7Days = counts.reduce((acc, c) => acc + c, 0);

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Reservations',
            data: counts,
            backgroundColor: 'rgba(0, 168, 132, 0.75)',
            hoverBackgroundColor: '#008f6f',
            borderColor: '#00a884',
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => ` ${context.parsed.y} reservation${context.parsed.y === 1 ? '' : 's'}`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 11,
                weight: '500',
              },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#64748b',
              font: {
                size: 11,
              },
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.6)',
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data]);

  const total = data.reduce((acc, d) => acc + (d.count || 0), 0);

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            📊 Daily Reservation Trends
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '2px 0 0' }}>
            Daily reservation volume over the past 7 days
          </p>
        </div>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-50)',
            color: 'var(--primary-700)',
          }}
        >
          {total} Total (7d)
        </span>
      </div>

      <div style={{ position: 'relative', height: '240px', width: '100%', flex: 1 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

// Chart B: Reservation Status Distribution
export const ReservationStatusChart = ({ data = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Status mapping matching Reservation model enum:
  // ['pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'expired']
  const STATUS_META = {
    pending:   { label: 'Pending',   color: '#f59e0b' },
    confirmed: { label: 'Confirmed', color: '#0ea5e9' },
    completed: { label: 'Completed', color: '#10b981' },
    cancelled: { label: 'Cancelled', color: '#ef4444' },
    rejected:  { label: 'Rejected',  color: '#e11d48' },
    expired:   { label: 'Expired',   color: '#94a3b8' },
  };

  const totalReservations = data.reduce((acc, d) => acc + (d.count || 0), 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = data.map((d) => STATUS_META[d.status]?.label || d.status);
    const counts = data.map((d) => d.count || 0);
    const colors = data.map((d) => STATUS_META[d.status]?.color || '#94a3b8');

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: totalReservations === 0 ? [1] : counts,
            backgroundColor: totalReservations === 0 ? ['#e2e8f0'] : colors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: totalReservations === 0 ? 0 : 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 12,
              color: '#334155',
              font: {
                size: 11,
                weight: '500',
              },
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                return chart.data.labels.map((lbl, i) => {
                  const val = counts[i] || 0;
                  return {
                    text: `${lbl} (${val})`,
                    fillStyle: colors[i],
                    strokeStyle: colors[i],
                    lineWidth: 0,
                    hidden: false,
                    index: i,
                  };
                });
              },
            },
          },
          tooltip: {
            enabled: totalReservations > 0,
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const count = counts[context.dataIndex] || 0;
                const pct = totalReservations > 0 ? Math.round((count / totalReservations) * 100) : 0;
                return ` ${context.label}: ${count} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, totalReservations]);

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            📋 Reservation Status Distribution
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '2px 0 0' }}>
            Lifecycle breakdown of all-time platform reservations
          </p>
        </div>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--secondary-50)',
            color: 'var(--secondary-700)',
          }}
        >
          {totalReservations} All-Time
        </span>
      </div>

      <div style={{ position: 'relative', height: '240px', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} />
        {totalReservations === 0 && (
          <div
            style={{
              position: 'absolute',
              textAlign: 'center',
              pointerEvents: 'none',
              color: 'var(--muted)',
              fontSize: '0.82rem',
            }}
          >
            No reservations yet
          </div>
        )}
      </div>
    </div>
  );
};

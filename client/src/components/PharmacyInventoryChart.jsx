import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const PharmacyInventoryChart = ({ inventory = [], loading = false }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Accounting rule matching existing MediFind logic:
  // availableQty = item.totalQuantity - (item.reservedQuantity || 0)
  // Available: > 10 units
  // Low Stock: 1 to 10 units
  // Out of Stock: <= 0 units
  const availableItems = inventory.filter((item) => {
    const avail = item.totalQuantity - (item.reservedQuantity || 0);
    return avail > 10;
  });

  const lowStockItems = inventory.filter((item) => {
    const avail = item.totalQuantity - (item.reservedQuantity || 0);
    return avail > 0 && avail <= 10;
  });

  const outOfStockItems = inventory.filter((item) => {
    const avail = item.totalQuantity - (item.reservedQuantity || 0);
    return avail <= 0;
  });

  const totalSKUs = inventory.length;
  const counts = [availableItems.length, lowStockItems.length, outOfStockItems.length];
  const labels = ['Adequate Stock (>10 units)', 'Low Stock (1-10 units)', 'Out of Stock (0 units)'];
  const colors = ['#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    if (!canvasRef.current || loading || totalSKUs === 0) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 14,
              padding: 14,
              color: '#334155',
              font: {
                size: 12,
                weight: '500',
              },
              generateLabels: () => {
                return labels.map((lbl, i) => {
                  const val = counts[i];
                  const pct = totalSKUs > 0 ? Math.round((val / totalSKUs) * 100) : 0;
                  return {
                    text: `${lbl}: ${val} (${pct}%)`,
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
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const count = counts[context.dataIndex];
                const pct = totalSKUs > 0 ? Math.round((count / totalSKUs) * 100) : 0;
                return ` ${context.label}: ${count} items (${pct}%)`;
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
  }, [inventory, loading, totalSKUs]);

  if (loading) {
    return (
      <div className="card mb-8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
        <span className="spinner" /> Loading inventory health analytics...
      </div>
    );
  }

  return (
    <div className="card mb-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            📊 Inventory Stock Health
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '4px 0 0' }}>
            Real-time stock availability breakdown accounting for active patient holds
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
            }}
          >
            ● {availableItems.length} Adequate
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
            }}
          >
            ▲ {lowStockItems.length} Low Stock
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#dc2626',
            }}
          >
            ✕ {outOfStockItems.length} Out of Stock
          </span>
        </div>
      </div>

      {totalSKUs === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
          📦 No inventory items found. Add items to your inventory to visualize stock health.
        </div>
      ) : (
        <div style={{ position: 'relative', height: '220px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
};

export default PharmacyInventoryChart;

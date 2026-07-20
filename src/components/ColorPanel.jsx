import { getColorAttributes } from '../utils/ValidationEngine';
import { Eye, EyeOff, CheckCircle2, AlertTriangle, Info, Grid } from 'lucide-react';

function ColorPanel({
  uniqueColors = [],
  activeColors = [],
  links = [],
  validationStatus = {},
  matrixStatus = {},
  onToggleColor,
  onShowAll,
  onHideAll
}) {
  const activeSet = new Set(activeColors.map(c => Number(c)));

  const getEdgeCountForColor = (colorCode) => {
    return links.filter(l => Number(l.color) === Number(colorCode)).length;
  };

  return (
    <div
      style={{
        width: '300px',
        backgroundColor: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none'
      }}
    >
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          Color Classes ({uniqueColors.length})
        </h2>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn-secondary" onClick={onShowAll} style={{ flex: 1, padding: '5px', fontSize: '11px', justifyContent: 'center' }}>
            <Eye size={12} /> Show All
          </button>
          <button className="btn-secondary" onClick={onHideAll} style={{ flex: 1, padding: '5px', fontSize: '11px', justifyContent: 'center' }}>
            <EyeOff size={12} /> Hide All
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {validationStatus.type === 'success' && <CheckCircle2 size={16} color="var(--accent-success)" />}
          {validationStatus.type === 'danger' && <AlertTriangle size={16} color="var(--accent-danger)" />}
          {validationStatus.type === 'info' && <Info size={16} color="var(--accent-cyan)" />}
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Verification Status
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {validationStatus.statusMessage || 'Select color classes to evaluate graph invariant.'}
        </p>

        {matrixStatus && matrixStatus.totalPairs > 0 && (
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Grid size={11} /> Global ({matrixStatus.validCount}/{matrixStatus.totalPairs} pairs)
              </span>
              <span className={`badge ${matrixStatus.isValid ? 'badge-success' : 'badge-warning'}`}>
                {matrixStatus.percentage}% Valid
              </span>
            </div>
            {matrixStatus.failedPairs && matrixStatus.failedPairs.length > 0 && (
              <div style={{ fontSize: '10px', color: 'var(--accent-danger)', marginTop: '2px' }}>
                Failed pairs: {matrixStatus.failedPairs.slice(0, 4).map(p => `(${p[0]},${p[1]})`).join(', ')}
                {matrixStatus.failedPairs.length > 4 && '...'}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {uniqueColors.map(colorCode => {
            const codeNum = Number(colorCode);
            const { color, style } = getColorAttributes(codeNum);
            const isChecked = activeSet.has(codeNum);
            const edgeCount = getEdgeCountForColor(codeNum);

            return (
              <div
                key={colorCode}
                onClick={() => onToggleColor(codeNum)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  background: isChecked ? 'var(--bg-hover)' : 'transparent',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
                  />
                  <div
                    style={{
                      width: '20px',
                      height: '8px',
                      backgroundColor: color,
                      borderRadius: '2px',
                      border: style === 'dashed' ? '1px dashed #fff' : style === 'dotted' ? '1px dotted #fff' : '1px solid rgba(0,0,0,0.5)'
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: isChecked ? '#FFF' : 'var(--text-muted)' }}>
                    Color {colorCode}
                  </span>
                </div>

                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {edgeCount} edges
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ColorPanel;

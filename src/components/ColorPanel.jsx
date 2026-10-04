import { AlertCircle, CheckCircle2, Eye, EyeOff, Grid3X3, Info } from 'lucide-react';
import { getColorAttributes } from '../utils/ValidationEngine';

function ColorPanel({ uniqueColors = [], activeColors = [], links = [], validationStatus = {}, matrixStatus = {}, onToggleColor, onShowAll, onHideAll }) {
  const activeSet = new Set(activeColors.map(color => Number(color)));
  const getEdgeCount = colorCode => links.filter(link => Number(link.color) === Number(colorCode)).length;
  const StatusIcon = validationStatus.type === 'success' ? CheckCircle2 : validationStatus.type === 'danger' ? AlertCircle : Info;

  return (
    <aside className="color-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-heading">
          <h2>Color classes</h2>
          <span className="count">{uniqueColors.length}</span>
        </div>
        <div className="color-actions">
          <button className="btn" onClick={onShowAll}><Eye size={12} /> All</button>
          <button className="btn" onClick={onHideAll}><EyeOff size={12} /> None</button>
        </div>
      </div>

      <section className="verification">
        <div className="verification-top">
          <StatusIcon size={14} color={validationStatus.type === 'danger' ? 'var(--red)' : validationStatus.type === 'success' ? 'var(--green)' : 'var(--faint)'} />
          <strong>Selection check</strong>
        </div>
        <p className={`verification-message ${validationStatus.type || ''}`}>{validationStatus.statusMessage || 'Select classes to evaluate the invariant.'}</p>
        {matrixStatus.totalPairs > 0 && (
          <div className="pair-summary">
            <span><Grid3X3 size={10} /> {matrixStatus.validCount}/{matrixStatus.totalPairs} pairs</span>
            <strong>{matrixStatus.percentage}%</strong>
          </div>
        )}
      </section>

      <div className="color-list">
        {uniqueColors.map(colorCode => {
          const code = Number(colorCode);
          const { color } = getColorAttributes(code);
          const isActive = activeSet.has(code);
          return (
            <button className={`color-row ${isActive ? 'active' : ''}`} key={colorCode} onClick={() => onToggleColor(code)}>
              <input type="checkbox" checked={isActive} readOnly aria-label={`Toggle color ${code}`} />
              <span className="color-swatch" style={{ backgroundColor: color }} />
              <span className="color-name">class {code}</span>
              <span className="color-edges">{getEdgeCount(code)}e</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default ColorPanel;

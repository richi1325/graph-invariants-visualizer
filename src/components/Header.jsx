import { Activity, ShieldCheck, ShieldAlert } from 'lucide-react';

function Header({ categoryTitle, configName, numNodes = 0, numEdges = 0, numColors = 0, isValidGlobal = true }) {
  return (
    <header
      style={{
        height: '56px',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        userSelect: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Activity size={16} color="#FFF" />
        </div>
        <div>
          <h1 style={{ fontSize: '14px', fontWeight: '700', color: '#FFF', letterSpacing: '-0.2px' }}>
            Graph Coloring Studio
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {categoryTitle} &bull; {configName}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Vertices (n)</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{numNodes}</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Edges (m)</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-purple)' }}>{numEdges}</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>Colors (k)</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-blue)' }}>{numColors}</span>
          </div>
        </div>

        <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-color)' }} />

        <div
          className={`badge ${isValidGlobal ? 'badge-success' : 'badge-danger'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', fontSize: '11px' }}
        >
          {isValidGlobal ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          <span>{isValidGlobal ? 'Global Invariant Valid' : 'Pairwise Failure'}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;

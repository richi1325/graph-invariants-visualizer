import { Play, Pause, SkipBack, SkipForward, Download, Save, Sliders } from 'lucide-react';

function Controls({
  isPlaying = false,
  animSpeed = 1,
  animMode = 'pairs',
  layoutName = 'circle',
  onTogglePlay,
  onStepPrev,
  onStepNext,
  onChangeSpeed,
  onChangeMode,
  onChangeLayout,
  onExportImage,
  onExportJson
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '10px 16px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn-secondary"
          onClick={onStepPrev}
          title="Previous Step"
          style={{ padding: '6px' }}
        >
          <SkipBack size={15} />
        </button>

        <button
          className="btn-primary"
          onClick={onTogglePlay}
          style={{ padding: '6px 14px', fontSize: '12px' }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          className="btn-secondary"
          onClick={onStepNext}
          title="Next Step"
          style={{ padding: '6px' }}
        >
          <SkipForward size={15} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Speed:</span>
          <select
            value={animSpeed}
            onChange={e => onChangeSpeed(Number(e.target.value))}
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '5px',
              padding: '3px 6px',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x</option>
            <option value={2}>2.0x</option>
            <option value={4}>4.0x</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mode:</span>
          <select
            value={animMode}
            onChange={e => onChangeMode(e.target.value)}
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '5px',
              padding: '3px 6px',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="single">Single (1 Color)</option>
            <option value="pairs">Pairs (2 Colors)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={13} color="var(--text-muted)" />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Layout:</span>
          <select
            value={layoutName}
            onChange={e => onChangeLayout(e.target.value)}
            style={{
              background: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '5px',
              padding: '3px 6px',
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="circle">Circular</option>
            <option value="concentric">Concentric</option>
            <option value="cose">Force (CoSE)</option>
            <option value="grid">Grid</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="btn-secondary" onClick={onExportImage} style={{ fontSize: '11px', padding: '5px 10px' }}>
          <Download size={14} /> Export Frame
        </button>
        <button className="btn-secondary" onClick={onExportJson} style={{ fontSize: '11px', padding: '5px 10px' }}>
          <Save size={14} /> Export JSON
        </button>
      </div>
    </div>
  );
}

export default Controls;

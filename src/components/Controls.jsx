import { Download, Pause, Play, Save, SkipBack, SkipForward } from 'lucide-react';

function Controls({ isPlaying = false, animSpeed = 1, animMode = 'pairs', layoutName = 'circle', onTogglePlay, onStepPrev, onStepNext, onChangeSpeed, onChangeMode, onChangeLayout, onExportImage, onExportGraphML }) {
  return (
    <div className="controls-bar">
      <div className="control-group">
        <button className="btn btn-quiet" onClick={onStepPrev} title="Previous step"><SkipBack size={14} /></button>
        <button className="btn btn-primary" onClick={onTogglePlay}><>{isPlaying ? <Pause size={13} /> : <Play size={13} />}{isPlaying ? 'Pause' : 'Play'}</></button>
        <button className="btn btn-quiet" onClick={onStepNext} title="Next step"><SkipForward size={14} /></button>
        <span className="control-separator" />
        <label className="control-label" htmlFor="speed">Speed</label>
        <select id="speed" className="select-control" value={animSpeed} onChange={event => onChangeSpeed(Number(event.target.value))}>
          <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={2}>2x</option><option value={4}>4x</option>
        </select>
      </div>

      <div className="control-group">
        <label className="control-label" htmlFor="mode">Show</label>
        <select id="mode" className="select-control" value={animMode} onChange={event => onChangeMode(event.target.value)}>
          <option value="single">Single class</option><option value="pairs">Color pairs</option>
        </select>
        <label className="control-label" htmlFor="layout">Layout</label>
        <select id="layout" className="select-control" value={layoutName} onChange={event => onChangeLayout(event.target.value)}>
          <option value="circle">Circular</option><option value="concentric">Concentric</option><option value="cose">Force</option><option value="grid">Grid</option>
        </select>
      </div>

      <div className="control-group">
        <button className="btn" onClick={onExportImage}><Download size={12} /> PNG</button>
        <button className="btn" onClick={onExportGraphML}><Save size={12} /> GraphML</button>
      </div>
    </div>
  );
}

export default Controls;

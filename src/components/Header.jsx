import { Activity, CircleCheck, CircleX } from 'lucide-react';

function Header({ categoryTitle, configName, numNodes = 0, numEdges = 0, numColors = 0, isValidGlobal = true }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark"><Activity size={15} strokeWidth={2.5} /></div>
        <div>
          <h1>Graph coloring</h1>
          <p>{categoryTitle} / <span className="mono">{configName}</span></p>
        </div>
      </div>

      <div className="header-metrics">
        <div className="metric"><strong>{numNodes}</strong><span>vertices</span></div>
        <div className="metric"><strong>{numEdges}</strong><span>edges</span></div>
        <div className="metric"><strong>{numColors}</strong><span>colors</span></div>
        <div className={`status-pill ${isValidGlobal ? '' : 'invalid'}`}>
          {isValidGlobal ? <CircleCheck size={13} /> : <CircleX size={13} />}
          <span>{isValidGlobal ? 'all pairs valid' : 'pairwise failures'}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;

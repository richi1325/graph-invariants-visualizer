import { useState, useMemo } from 'react';
import { Layers, Network, GitBranch, Share2, ChevronRight, FileText, Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'achromatic', label: 'Achromatic Index', icon: Network },
  { id: 'achromatic_arboricity', label: 'Achromatic Arboricity', icon: GitBranch },
  { id: 'connected_pseudoachromatic', label: 'Connected Pseudoachromatic', icon: Share2 },
  { id: 'pseudoachromatic', label: 'Pseudoachromatic Index', icon: Layers }
];

const jsonGlob = import.meta.glob('../../data/**/*.json', { eager: true });
const txtGlob = import.meta.glob('../../data/**/*.txt', { query: '?raw', eager: true });

function ConfigMenu({ activeCategory, activeConfigId, onSelectCategory, onSelectConfig }) {
  const [expandedCategory, setExpandedCategory] = useState(activeCategory || 'achromatic');
  const [searchQuery, setSearchQuery] = useState('');

  const configsByCategory = useMemo(() => {
    const map = {
      achromatic: {},
      achromatic_arboricity: {},
      connected_pseudoachromatic: {},
      pseudoachromatic: {}
    };

    const processPath = (path, isJson) => {
      const normalizedPath = path.replace(/\\/g, '/');
      const parts = normalizedPath.split('/');
      if (parts.length >= 4) {
        const cat = parts[parts.length - 2];
        const rawFilename = parts[parts.length - 1];
        const filename = rawFilename.replace(/\.json$/i, '').replace(/\.txt$/i, '');

        if (map[cat]) {
          const match = filename.match(/n_(\d+)_k_(\d+)/i);
          const n = match ? parseInt(match[1], 10) : 0;
          const k = match ? parseInt(match[2], 10) : 0;
          const isTabu = filename.toLowerCase().includes('tabu');
          const displayName = `n=${n}, k=${k}${isTabu ? ' (Tabu)' : ''}`;

          if (!map[cat][filename] || isJson) {
            map[cat][filename] = {
              id: filename,
              rawFilename,
              name: displayName,
              n,
              k,
              isTabu,
              isJson
            };
          }
        }
      }
    };

    Object.keys(txtGlob).forEach(path => processPath(path, false));
    Object.keys(jsonGlob).forEach(path => processPath(path, true));

    const result = {};
    Object.keys(map).forEach(cat => {
      result[cat] = Object.values(map[cat]).sort((a, b) => a.n - b.n || a.k - b.k);
    });

    return result;
  }, []);

  const handleCategoryClick = (catId) => {
    setExpandedCategory(catId);
    onSelectCategory(catId);
    const list = configsByCategory[catId] || [];
    if (list.length > 0) {
      onSelectConfig(list[0].id);
    }
  };

  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none'
      }}
    >
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          Configurations
        </h2>

        <div style={{ position: 'relative' }}>
          <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Filter n=..., k=..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 28px',
              borderRadius: '6px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '11px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;
          let configs = configsByCategory[category.id] || [];

          if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            configs = configs.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
          }

          return (
            <div key={category.id} style={{ marginBottom: '6px' }}>
              <button
                onClick={() => handleCategoryClick(category.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: isExpanded ? 'var(--bg-hover)' : 'transparent',
                  border: 'none',
                  color: isExpanded ? '#FFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={14} color={isExpanded ? 'var(--accent-blue)' : 'var(--text-muted)'} />
                  <span>{category.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-info" style={{ fontSize: '10px', padding: '1px 5px' }}>
                    {configs.length}
                  </span>
                  <ChevronRight
                    size={13}
                    style={{
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      color: 'var(--text-muted)'
                    }}
                  />
                </div>
              </button>

              {isExpanded && (
                <div style={{ marginTop: '3px', paddingLeft: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {configs.length === 0 ? (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px' }}>
                      No matching configurations.
                    </div>
                  ) : (
                    configs.map(cfg => {
                      const isSelected = activeCategory === category.id && activeConfigId === cfg.id;
                      return (
                        <button
                          key={cfg.id}
                          onClick={() => onSelectConfig(cfg.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: '5px',
                            background: isSelected ? 'var(--bg-accent)' : 'transparent',
                            border: isSelected ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                            color: isSelected ? '#FFF' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            <FileText size={11} color={isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                            <span>{cfg.name}</span>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            k={cfg.k}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default ConfigMenu;

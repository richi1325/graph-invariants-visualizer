import { useState, useMemo } from 'react';
import { ChevronRight, FileText, GitBranch, Layers, Network, Search, Share2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'achromatic', label: 'Achromatic index', icon: Network },
  { id: 'achromatic_arboricity', label: 'Achromatic arboricity', icon: GitBranch },
  { id: 'connected_pseudoachromatic', label: 'Connected pseudoachromatic', icon: Share2 },
  { id: 'pseudoachromatic', label: 'Pseudoachromatic index', icon: Layers }
];

const graphmlGlob = import.meta.glob('../../data/**/*.graphml', { query: '?raw', eager: true });

function ConfigMenu({ activeCategory, activeConfigId, onSelectCategory, onSelectConfig }) {
  const [expandedCategory, setExpandedCategory] = useState(activeCategory || 'achromatic');
  const [searchQuery, setSearchQuery] = useState('');

  const configsByCategory = useMemo(() => {
    const map = Object.fromEntries(CATEGORIES.map(category => [category.id, []]));

    const processPath = path => {
      const parts = path.replace(/\\/g, '/').split('/');
      if (parts.length < 4) return;
      const category = parts[parts.length - 2];
      const rawFilename = parts[parts.length - 1];
      const filename = rawFilename.replace(/\.graphml$/i, '');
      if (!map[category]) return;

      const match = filename.match(/n_(\d+)_k_(\d+)/i);
      const n = match ? parseInt(match[1], 10) : 0;
      const k = match ? parseInt(match[2], 10) : 0;
      map[category].push({
        id: filename,
        name: `n=${n}, k=${k}${filename.toLowerCase().includes('tabu') ? ' (tabu)' : ''}`,
        n,
        k
      });
    };

    Object.keys(graphmlGlob).forEach(path => processPath(path));

    Object.values(map).forEach(configs => configs.sort((a, b) => a.n - b.n || a.k - b.k));
    return map;
  }, []);

  const handleCategoryClick = categoryId => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryId);
    onSelectCategory(categoryId);
    const firstConfig = configsByCategory[categoryId]?.[0];
    if (firstConfig) onSelectConfig(firstConfig.id);
  };

  return (
    <aside className="config-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-heading">
          <h2>Configurations</h2>
          <span className="count">{Object.values(configsByCategory).flat().length}</span>
        </div>
        <p className="sidebar-note">Curated maximum k for each n.</p>
        <div className="search-box">
          <Search size={13} />
          <input
            type="search"
            placeholder="Search n or k"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="sidebar-scroll">
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;
          const query = searchQuery.trim().toLowerCase();
          const configs = (configsByCategory[category.id] || []).filter(config =>
            !query || config.name.toLowerCase().includes(query) || config.id.toLowerCase().includes(query)
          );

          return (
            <div className="category-block" key={category.id}>
              <button className={`category-button ${isExpanded ? 'expanded' : ''}`} onClick={() => handleCategoryClick(category.id)}>
                <span className="category-label"><Icon size={14} /><span>{category.label}</span></span>
                <span className="category-meta"><span className="category-count">{configs.length}</span><ChevronRight size={13} /></span>
              </button>

              {isExpanded && (
                <div className="config-list">
                  {configs.length === 0 ? <p className="empty-sidebar">No configurations found.</p> : configs.map(config => (
                    <button
                      className={`config-item ${activeCategory === category.id && activeConfigId === config.id ? 'selected' : ''}`}
                      key={config.id}
                      onClick={() => onSelectConfig(config.id)}
                    >
                      <span><FileText size={10} /> {config.name}</span>
                      <span>k={config.k}</span>
                    </button>
                  ))}
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

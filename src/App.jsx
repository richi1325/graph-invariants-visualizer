import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import ConfigMenu from './components/ConfigMenu';
import ColorPanel from './components/ColorPanel';
import GraphVisualizer from './components/GraphVisualizer';
import Controls from './components/Controls';
import { validateProperty, validateAllPairs } from './utils/ValidationEngine';
import { parseGraphML } from './utils/DataParser';
import { exportCanvasFrame, exportGraphML } from './utils/GifExporter';

const CATEGORY_NAMES = {
  achromatic: 'Achromatic index',
  achromatic_arboricity: 'Achromatic arboricity',
  connected_pseudoachromatic: 'Connected pseudoachromatic',
  pseudoachromatic: 'Pseudoachromatic index'
};

const graphmlModules = import.meta.glob('../data/**/*.graphml', { query: '?raw', eager: true });

function loadGraph(category, configId) {
  const findModule = modules => {
    const categoryKeys = Object.keys(modules).filter(path => path.toLowerCase().includes(`/${category.toLowerCase()}/`));
    if (configId) {
      const exactMatch = categoryKeys.find(path => path.replace(/\\/g, '/').endsWith(`/${configId}.graphml`));
      if (exactMatch) return modules[exactMatch];
    }
    return categoryKeys.length > 0 ? modules[categoryKeys[0]] : null;
  };

  const graphmlModule = findModule(graphmlModules);
  if (!graphmlModule) return { nodes: [], links: [] };
  const rawGraphML = typeof graphmlModule === 'string' ? graphmlModule : graphmlModule.default || '';
  return parseGraphML(rawGraphML);
}

function generatePairsList(colors) {
  const pairs = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) pairs.push([colors[i], colors[j]]);
  }
  return pairs;
}

function App() {
  const [activeCategory, setActiveCategory] = useState('achromatic');
  const [activeConfigId, setActiveConfigId] = useState('n_2_k_1');
  const [layoutName, setLayoutName] = useState('circle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [animMode, setAnimMode] = useState('pairs');
  const [editedGraph, setEditedGraph] = useState(null);
  const [colorSelection, setColorSelection] = useState({ key: '', colors: [] });
  const cyRef = useRef(null);
  const animIndexRef = useRef(0);

  const graphKey = `${activeCategory}:${activeConfigId}`;
  const sourceGraph = useMemo(() => loadGraph(activeCategory, activeConfigId), [activeCategory, activeConfigId]);
  const graph = editedGraph?.key === graphKey ? editedGraph : { ...sourceGraph, key: graphKey };
  const { nodes, links } = graph;

  const uniqueColors = useMemo(() => (
    Array.from(new Set(links.map(link => Number(link.color)))).sort((a, b) => a - b)
  ), [links]);
  const activeColors = colorSelection.key === graphKey ? colorSelection.colors : uniqueColors;

  const validationStatus = useMemo(() => (
    validateProperty(activeCategory, activeColors, nodes, links)
  ), [activeCategory, activeColors, nodes, links]);
  const matrixStatus = useMemo(() => (
    validateAllPairs(activeCategory, uniqueColors, nodes, links)
  ), [activeCategory, uniqueColors, nodes, links]);

  const handleCyReady = useCallback(cy => {
    cyRef.current = cy;
  }, []);

  useEffect(() => {
    if (!isPlaying || uniqueColors.length === 0) return undefined;
    const timer = setInterval(() => {
      if (animMode === 'single') {
        const index = animIndexRef.current % uniqueColors.length;
        setColorSelection({ key: graphKey, colors: [uniqueColors[index]] });
        animIndexRef.current += 1;
        return;
      }

      const pairs = generatePairsList(uniqueColors);
      if (pairs.length > 0) {
        const index = animIndexRef.current % pairs.length;
        setColorSelection({ key: graphKey, colors: pairs[index] });
        animIndexRef.current += 1;
      }
    }, 1200 / animSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, animSpeed, animMode, uniqueColors, graphKey]);

  const handleToggleColor = colorCode => {
    setIsPlaying(false);
    setColorSelection(previous => {
      const current = previous.key === graphKey ? previous.colors : uniqueColors;
      const code = Number(colorCode);
      return { key: graphKey, colors: current.includes(code) ? current.filter(color => color !== code) : [...current, code] };
    });
  };

  const handleShowAll = () => {
    setIsPlaying(false);
    setColorSelection({ key: graphKey, colors: uniqueColors });
  };

  const handleHideAll = () => {
    setIsPlaying(false);
    setColorSelection({ key: graphKey, colors: [] });
  };

  const setAnimationStep = direction => {
    setIsPlaying(false);
    if (uniqueColors.length === 0) return;
    const sequence = animMode === 'single' ? uniqueColors.map(color => [color]) : generatePairsList(uniqueColors);
    if (sequence.length === 0) return;
    animIndexRef.current = (animIndexRef.current + direction + sequence.length) % sequence.length;
    setColorSelection({ key: graphKey, colors: sequence[animIndexRef.current] });
  };

  const handleEdgeColorChange = (source, target, newColorCode) => {
    const changedLink = links.find(link => (
      (String(link.source) === String(source) && String(link.target) === String(target)) ||
      (String(link.source) === String(target) && String(link.target) === String(source))
    ));
    const updatedLinks = links.map(link => {
      const sameDirection = String(link.source) === String(source) && String(link.target) === String(target);
      const reverseDirection = String(link.source) === String(target) && String(link.target) === String(source);
      return sameDirection || reverseDirection ? { ...link, color: newColorCode } : link;
    });
    setEditedGraph({ key: graphKey, nodes, links: updatedLinks });
    if (changedLink && activeColors.includes(Number(changedLink.color))) {
      setColorSelection({ key: graphKey, colors: Array.from(new Set([...activeColors, Number(newColorCode)])) });
    }
  };

  return (
    <div className="app-shell">
      <Header
        categoryTitle={CATEGORY_NAMES[activeCategory]}
        configName={activeConfigId || 'configuration'}
        numNodes={nodes.length}
        numEdges={links.length}
        numColors={uniqueColors.length}
        isValidGlobal={matrixStatus.isValid}
      />

      <div className="workspace">
        <ConfigMenu
          activeCategory={activeCategory}
          activeConfigId={activeConfigId}
          onSelectCategory={category => { setActiveCategory(category); setEditedGraph(null); }}
          onSelectConfig={config => { setActiveConfigId(config); setEditedGraph(null); }}
        />

        <main className="canvas-column">
          <div className="canvas-wrap">
            <GraphVisualizer
              nodes={nodes}
              links={links}
              activeColors={activeColors}
              highlightNodes={validationStatus.highlightNodes}
              highlightEdges={validationStatus.highlightEdges}
              layoutName={layoutName}
              onEdgeColorChange={handleEdgeColorChange}
              onCyReady={handleCyReady}
            />
          </div>
          <Controls
            isPlaying={isPlaying}
            animSpeed={animSpeed}
            animMode={animMode}
            layoutName={layoutName}
            onTogglePlay={() => setIsPlaying(previous => !previous)}
            onStepPrev={() => setAnimationStep(-1)}
            onStepNext={() => setAnimationStep(1)}
            onChangeSpeed={setAnimSpeed}
            onChangeMode={setAnimMode}
            onChangeLayout={setLayoutName}
            onExportImage={() => cyRef.current && exportCanvasFrame(cyRef.current, `${activeCategory}_${activeConfigId || 'graph'}.png`)}
            onExportGraphML={() => exportGraphML(activeConfigId || 'graph', nodes, links)}
          />
        </main>

        <ColorPanel
          uniqueColors={uniqueColors}
          activeColors={activeColors}
          links={links}
          validationStatus={validationStatus}
          matrixStatus={matrixStatus}
          onToggleColor={handleToggleColor}
          onShowAll={handleShowAll}
          onHideAll={handleHideAll}
        />
      </div>
    </div>
  );
}

export default App;

import { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import ConfigMenu from './components/ConfigMenu';
import ColorPanel from './components/ColorPanel';
import GraphVisualizer from './components/GraphVisualizer';
import Controls from './components/Controls';
import { validateProperty, validateAllPairs } from './utils/ValidationEngine';
import { parseTxtToGraph } from './utils/DataParser';
import { exportCanvasFrame, exportGraphJson } from './utils/GifExporter';

const CATEGORY_NAMES = {
  achromatic: 'Achromatic Index',
  achromatic_arboricity: 'Achromatic Arboricity',
  connected_pseudoachromatic: 'Connected Pseudoachromatic',
  pseudoachromatic: 'Pseudoachromatic Index'
};

const jsonModules = import.meta.glob('../data/**/*.json', { eager: true });
const txtModules = import.meta.glob('../data/**/*.txt', { query: '?raw', eager: true });

function App() {
  const [activeCategory, setActiveCategory] = useState('achromatic');
  const [activeConfigId, setActiveConfigId] = useState('');
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [activeColors, setActiveColors] = useState([]);
  const [layoutName, setLayoutName] = useState('circle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [animMode, setAnimMode] = useState('pairs');
  const cyRef = useRef(null);
  const animIndexRef = useRef(0);

  useEffect(() => {
    let parsedNodes = [];
    let parsedLinks = [];

    const findMatchingModule = (modules, extension) => {
      const keys = Object.keys(modules);
      const categoryKeys = keys.filter(k => k.toLowerCase().includes(`/${activeCategory.toLowerCase()}/`));
      if (categoryKeys.length === 0) return null;

      if (activeConfigId) {
        const exactMatch = categoryKeys.find(k => k.includes(activeConfigId));
        if (exactMatch) return modules[exactMatch];
      }

      return modules[categoryKeys[0]];
    };

    const jsonMod = findMatchingModule(jsonModules, 'json');
    if (jsonMod) {
      const data = jsonMod.default || jsonMod;
      parsedNodes = data.nodes || [];
      parsedLinks = data.links || [];
    } else {
      const txtMod = findMatchingModule(txtModules, 'txt');
      if (txtMod) {
        const rawText = typeof txtMod === 'string' ? txtMod : txtMod.default || '';
        const data = parseTxtToGraph(rawText);
        parsedNodes = data.nodes;
        parsedLinks = data.links;
      }
    }

    setNodes(parsedNodes);
    setLinks(parsedLinks);

    const colors = Array.from(new Set(parsedLinks.map(l => Number(l.color)))).sort((a, b) => a - b);
    setActiveColors(colors);
  }, [activeCategory, activeConfigId]);

  const uniqueColors = useMemo(() => {
    return Array.from(new Set(links.map(l => Number(l.color)))).sort((a, b) => a - b);
  }, [links]);

  const validationStatus = useMemo(() => {
    return validateProperty(activeCategory, activeColors, nodes, links);
  }, [activeCategory, activeColors, nodes, links]);

  const matrixStatus = useMemo(() => {
    return validateAllPairs(activeCategory, uniqueColors, nodes, links);
  }, [activeCategory, uniqueColors, nodes, links]);

  const generatePairsList = (colors) => {
    const pairs = [];
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        pairs.push([colors[i], colors[j]]);
      }
    }
    return pairs;
  };

  useEffect(() => {
    if (!isPlaying || uniqueColors.length === 0) return;

    const intervalMs = 1200 / animSpeed;

    const timer = setInterval(() => {
      if (animMode === 'single') {
        const idx = animIndexRef.current % uniqueColors.length;
        setActiveColors([uniqueColors[idx]]);
        animIndexRef.current++;
      } else {
        const pairs = generatePairsList(uniqueColors);
        if (pairs.length > 0) {
          const idx = animIndexRef.current % pairs.length;
          setActiveColors(pairs[idx]);
          animIndexRef.current++;
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, animSpeed, animMode, uniqueColors]);

  const handleToggleColor = (colorCode) => {
    setIsPlaying(false);
    const codeNum = Number(colorCode);
    setActiveColors(prev => {
      const exists = prev.some(c => Number(c) === codeNum);
      if (exists) {
        return prev.filter(c => Number(c) !== codeNum);
      } else {
        return [...prev, codeNum];
      }
    });
  };

  const handleShowAll = () => {
    setIsPlaying(false);
    setActiveColors(uniqueColors);
  };

  const handleHideAll = () => {
    setIsPlaying(false);
    setActiveColors([]);
  };

  const handleEdgeColorChange = (source, target, newColorCode) => {
    setLinks(prev => prev.map(link => {
      const u1 = String(link.source);
      const v1 = String(link.target);
      const u2 = String(source);
      const v2 = String(target);
      if ((u1 === u2 && v1 === v2) || (u1 === v2 && v1 === u2)) {
        return { ...link, color: newColorCode };
      }
      return link;
    }));
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    if (animMode === 'single') {
      animIndexRef.current = (animIndexRef.current - 1 + uniqueColors.length) % uniqueColors.length;
      setActiveColors([uniqueColors[animIndexRef.current]]);
    } else {
      const pairs = generatePairsList(uniqueColors);
      if (pairs.length > 0) {
        animIndexRef.current = (animIndexRef.current - 1 + pairs.length) % pairs.length;
        setActiveColors(pairs[animIndexRef.current]);
      }
    }
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    if (animMode === 'single') {
      animIndexRef.current = (animIndexRef.current + 1) % uniqueColors.length;
      setActiveColors([uniqueColors[animIndexRef.current]]);
    } else {
      const pairs = generatePairsList(uniqueColors);
      if (pairs.length > 0) {
        animIndexRef.current = (animIndexRef.current + 1) % pairs.length;
        setActiveColors(pairs[animIndexRef.current]);
      }
    }
  };

  const handleExportImage = () => {
    if (cyRef.current) {
      exportCanvasFrame(cyRef.current, `${activeCategory}_${activeConfigId || 'graph'}.png`);
    }
  };

  const handleExportJson = () => {
    exportGraphJson(activeConfigId || 'graph', nodes, links);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Header
        categoryTitle={CATEGORY_NAMES[activeCategory]}
        configName={activeConfigId || 'Configuration'}
        numNodes={nodes.length}
        numEdges={links.length}
        numColors={uniqueColors.length}
        isValidGlobal={matrixStatus.isValid}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ConfigMenu
          activeCategory={activeCategory}
          activeConfigId={activeConfigId}
          onSelectCategory={setActiveCategory}
          onSelectConfig={setActiveConfigId}
        />

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px', gap: '14px', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <GraphVisualizer
              nodes={nodes}
              links={links}
              activeColors={activeColors}
              highlightNodes={validationStatus.highlightNodes}
              highlightEdges={validationStatus.highlightEdges}
              layoutName={layoutName}
              onEdgeColorChange={handleEdgeColorChange}
              onCyReady={cy => { cyRef.current = cy; }}
            />
          </div>

          <Controls
            isPlaying={isPlaying}
            animSpeed={animSpeed}
            animMode={animMode}
            layoutName={layoutName}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onStepPrev={handleStepPrev}
            onStepNext={handleStepNext}
            onChangeSpeed={setAnimSpeed}
            onChangeMode={setAnimMode}
            onChangeLayout={setLayoutName}
            onExportImage={handleExportImage}
            onExportJson={handleExportJson}
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

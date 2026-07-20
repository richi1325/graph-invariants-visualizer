import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { getColorAttributes } from '../utils/ValidationEngine';
import { Edit3, Check, X } from 'lucide-react';

function GraphVisualizer({
  nodes = [],
  links = [],
  activeColors = [],
  highlightNodes = [],
  highlightEdges = [],
  layoutName = 'circle',
  onEdgeColorChange,
  onCyReady
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [newColorCode, setNewColorCode] = useState('');

  const activeColorSet = new Set(activeColors.map(c => Number(c)));

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [
      ...nodes.map(node => ({
        data: { id: String(node.id), label: String(node.id) }
      })),
      ...links.map(link => {
        const colorCode = Number(link.color);
        const { color, style } = getColorAttributes(colorCode);
        return {
          data: {
            id: `e_${link.source}_${link.target}`,
            source: String(link.source),
            target: String(link.target),
            color_code: colorCode,
            color_hex: color,
            line_style: style
          }
        };
      })
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      layout: { name: layoutName, padding: 40, animate: true, animationDuration: 400 },
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#FFFFFF',
            'font-family': 'Plus Jakarta Sans, sans-serif',
            'font-size': '12px',
            'font-weight': '600',
            'background-color': '#1E293B',
            'border-width': 2,
            'border-color': '#3B82F6',
            'width': 30,
            'height': 30,
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.2s'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3.5,
            'line-color': 'data(color_hex)',
            'line-style': 'data(line_style)',
            'curve-style': 'bezier',
            'opacity': 0.9,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': '0.2s'
          }
        },
        {
          selector: '.hidden',
          style: { 'display': 'none' }
        },
        {
          selector: '.highlight-success',
          style: {
            'background-color': '#10B981',
            'border-color': '#34D399',
            'border-width': 4,
            'width': 40,
            'height': 40,
            'font-weight': '700'
          }
        },
        {
          selector: '.highlight-danger',
          style: {
            'background-color': '#EF4444',
            'border-color': '#F87171',
            'border-width': 4,
            'width': 40,
            'height': 40,
            'font-weight': '700'
          }
        },
        {
          selector: '.highlight-edge',
          style: {
            'width': 6,
            'opacity': 1.0,
            'line-color': '#F59E0B'
          }
        }
      ]
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedEdge({
        id: edge.id(),
        source: edge.data('source'),
        target: edge.data('target'),
        colorCode: edge.data('color_code')
      });
      setNewColorCode(String(edge.data('color_code')));
    });

    cyRef.current = cy;
    if (onCyReady) onCyReady(cy);

    return () => {
      cy.destroy();
    };
  }, [nodes, links]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.edges().forEach(edge => {
      const colorCode = Number(edge.data('color_code'));
      if (activeColorSet.has(colorCode)) {
        edge.removeClass('hidden');
      } else {
        edge.addClass('hidden');
      }
    });

    cy.nodes().removeClass('highlight-success highlight-danger');
    highlightNodes.forEach(nodeId => {
      const el = cy.getElementById(String(nodeId));
      if (el) {
        el.addClass('highlight-success');
      }
    });

    cy.edges().removeClass('highlight-edge');
    highlightEdges.forEach(edgeId => {
      const el = cy.getElementById(String(edgeId));
      if (el) {
        el.addClass('highlight-edge');
      }
    });
  }, [activeColors, highlightNodes, highlightEdges]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    const layout = cy.layout({ name: layoutName, padding: 40, animate: true, animationDuration: 400 });
    layout.run();
  }, [layoutName]);

  const handleApplyColorChange = () => {
    if (!selectedEdge || newColorCode === '') return;
    const parsed = parseInt(newColorCode, 10);
    if (!isNaN(parsed) && onEdgeColorChange) {
      onEdgeColorChange(selectedEdge.source, selectedEdge.target, parsed);
    }
    setSelectedEdge(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#0B0F17',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}
      />

      {selectedEdge && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '14px',
            borderRadius: '10px',
            zIndex: 20,
            width: '240px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Edit3 size={14} color="var(--accent-cyan)" /> Edit Edge ({selectedEdge.source} &rarr; {selectedEdge.target})
            </span>
            <button
              onClick={() => setSelectedEdge(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Color Code
            </label>
            <input
              type="number"
              value={newColorCode}
              onChange={e => setNewColorCode(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '5px',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn-primary"
              onClick={handleApplyColorChange}
              style={{ flex: 1, justifyContent: 'center', padding: '5px', fontSize: '11px' }}
            >
              <Check size={13} /> Apply
            </button>
            <button
              className="btn-secondary"
              onClick={() => setSelectedEdge(null)}
              style={{ flex: 1, justifyContent: 'center', padding: '5px', fontSize: '11px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraphVisualizer;

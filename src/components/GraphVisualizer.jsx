import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { Check, Pencil, X } from 'lucide-react';
import { getColorAttributes } from '../utils/ValidationEngine';

function GraphVisualizer({ nodes = [], links = [], activeColors = [], highlightNodes = [], highlightEdges = [], layoutName = 'circle', onEdgeColorChange, onCyReady }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [newColorCode, setNewColorCode] = useState('');
  useEffect(() => {
    if (!containerRef.current) return undefined;

    const elements = [
      ...nodes.map(node => ({ data: { id: String(node.id), label: String(node.id) } })),
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
      layout: { name: 'circle', padding: 55, animate: true, animationDuration: 350 },
      style: [
        { selector: 'node', style: { label: 'data(label)', 'text-valign': 'center', 'text-halign': 'center', color: '#18212b', 'font-family': 'Inter, sans-serif', 'font-size': '11px', 'font-weight': '600', 'background-color': '#ffffff', 'border-width': 1.5, 'border-color': '#18212b', width: 28, height: 28 } },
        { selector: 'edge', style: { width: 2, 'line-color': 'data(color_hex)', 'line-style': 'data(line_style)', 'curve-style': 'bezier', opacity: 0.82 } },
        { selector: '.hidden', style: { display: 'none' } },
        { selector: '.highlight-success', style: { 'background-color': '#e8f5ee', 'border-color': '#177245', 'border-width': 3, width: 36, height: 36 } },
        { selector: '.highlight-danger', style: { 'background-color': '#fef0ee', 'border-color': '#b42318', 'border-width': 3, width: 36, height: 36 } },
        { selector: '.highlight-edge', style: { width: 4, opacity: 1, 'line-color': '#18212b' } }
      ]
    });

    cy.on('tap', 'edge', event => {
      const edge = event.target;
      setSelectedEdge({ source: edge.data('source'), target: edge.data('target'), colorCode: edge.data('color_code') });
      setNewColorCode(String(edge.data('color_code')));
    });

    cyRef.current = cy;
    if (onCyReady) onCyReady(cy);
    return () => cy.destroy();
  }, [nodes, links, onCyReady]);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    const activeColorSet = new Set(activeColors.map(color => Number(color)));
    cy.edges().forEach(edge => {
      if (activeColorSet.has(Number(edge.data('color_code')))) edge.removeClass('hidden');
      else edge.addClass('hidden');
    });
    cy.nodes().removeClass('highlight-success highlight-danger');
    highlightNodes.forEach(nodeId => cy.getElementById(String(nodeId)).addClass('highlight-success'));
    cy.edges().removeClass('highlight-edge');
    highlightEdges.forEach(edgeId => cy.getElementById(String(edgeId)).addClass('highlight-edge'));
  }, [activeColors, highlightNodes, highlightEdges]);

  useEffect(() => {
    if (!cyRef.current) return;
    cyRef.current.layout({ name: layoutName, padding: 55, animate: true, animationDuration: 350 }).run();
  }, [layoutName]);

  const handleApplyColorChange = () => {
    const parsed = parseInt(newColorCode, 10);
    if (selectedEdge && Number.isInteger(parsed) && onEdgeColorChange) {
      onEdgeColorChange(selectedEdge.source, selectedEdge.target, parsed);
    }
    setSelectedEdge(null);
  };

  return (
    <div className="graph-card">
      <div className="graph-caption">
        <strong>Graph canvas</strong>
        <span>Click an edge to edit its class</span>
      </div>
      <div className="graph-canvas" ref={containerRef} />

      {selectedEdge && (
        <div className="edge-editor">
          <div className="editor-title">
            <span><Pencil size={12} /> Edit edge</span>
            <button onClick={() => setSelectedEdge(null)} aria-label="Close editor"><X size={13} /></button>
          </div>
          <label className="field-label" htmlFor="edge-color">Color class</label>
          <input id="edge-color" type="number" min="0" value={newColorCode} onChange={event => setNewColorCode(event.target.value)} />
          <div className="editor-actions">
            <button className="btn btn-primary" onClick={handleApplyColorChange}><Check size={12} /> Apply</button>
            <button className="btn" onClick={() => setSelectedEdge(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraphVisualizer;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function exportCanvasFrame(cyInstance, fileName = 'graph_frame.png') {
  if (!cyInstance) return;
  const pngDataUrl = cyInstance.png({
    full: true,
    bg: '#FFFFFF',
    scale: 2
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = pngDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportGraphML(configName, nodes, links) {
  const nodeXml = nodes.map(node => `    <node id="${escapeXml(node.id)}"/>`).join('\n');
  const edgeXml = links.map((link, index) => [
    `    <edge id="${escapeXml(link.id || `e${index}`)}" source="${escapeXml(link.source)}" target="${escapeXml(link.target)}">`,
    `      <data key="d0">${Number(link.color) || 0}</data>`,
    '    </edge>'
  ].join('\n')).join('\n');
  const graphml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"',
    '         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns',
    '                             http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
    '  <key id="d0" for="edge" attr.name="color" attr.type="int"/>',
    '  <graph id="G" edgedefault="undirected">',
    nodeXml,
    edgeXml,
    '  </graph>',
    '</graphml>'
  ].join('\n');
  const blob = new Blob([graphml], { type: 'application/graphml+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${configName || 'graph_coloring'}_edited.graphml`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function recordAnimationFrames(cyInstance, frameCount = 10, delayMs = 300, onProgress) {
  if (!cyInstance) return [];
  const frames = [];

  for (let i = 0; i < frameCount; i++) {
    if (onProgress) onProgress(i + 1, frameCount);
    const dataUrl = cyInstance.png({ full: true, bg: '#FFFFFF', scale: 1.5 });
    frames.push(dataUrl);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return frames;
}

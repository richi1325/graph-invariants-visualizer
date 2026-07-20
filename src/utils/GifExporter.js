export async function exportCanvasFrame(cyInstance, fileName = 'graph_frame.png') {
  if (!cyInstance) return;
  const pngDataUrl = cyInstance.png({
    full: true,
    bg: '#0B0F17',
    scale: 2
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = pngDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportGraphJson(configName, nodes, links) {
  const data = {
    directed: false,
    multigraph: false,
    graph: {},
    nodes: nodes,
    links: links
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${configName || 'graph_coloring'}_edited.json`;
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
    const dataUrl = cyInstance.png({ full: true, bg: '#0B0F17', scale: 1.5 });
    frames.push(dataUrl);
    await new Promise(r => setTimeout(r, delayMs));
  }

  return frames;
}

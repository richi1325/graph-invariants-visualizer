function getElementsByName(document, name) {
  return Array.from(document.getElementsByTagNameNS('*', name));
}

export function parseGraphML(content) {
  if (!content) return { nodes: [], links: [] };

  const document = new DOMParser().parseFromString(content, 'application/xml');
  if (document.getElementsByTagName('parsererror').length > 0) return { nodes: [], links: [] };

  const keys = getElementsByName(document, 'key');
  const colorKey = keys.find(key => key.getAttribute('for') === 'edge' && key.getAttribute('attr.name') === 'color');
  const colorKeyId = colorKey?.getAttribute('id');
  const nodeElements = getElementsByName(document, 'node');
  const edgeElements = getElementsByName(document, 'edge');

  const nodes = nodeElements.map(node => ({ id: node.getAttribute('id') || '' }));
  const links = edgeElements.map((edge, index) => {
    const dataElements = getElementsByName(edge, 'data');
    const colorData = dataElements.find(data => data.getAttribute('key') === colorKeyId) || dataElements[0];
    const parsedColor = Number(colorData?.textContent?.trim());

    return {
      id: edge.getAttribute('id') || `e${index}`,
      source: edge.getAttribute('source') || '',
      target: edge.getAttribute('target') || '',
      color: Number.isFinite(parsedColor) ? parsedColor : 0
    };
  });

  return { nodes, links };
}

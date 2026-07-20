export function parseTxtToGraph(content) {
  if (!content) return { nodes: [], links: [] };

  const nMatch = content.match(/(?:Nodos|Nodes)\s*\(n\):\s*(\d+)/i);
  const numNodes = nMatch ? parseInt(nMatch[1], 10) : 0;

  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({ id: i });
  }

  const links = [];
  const lines = content.split('\n');
  lines.forEach(line => {
    const colorMatch = line.match(/^\s*Color\s+(\d+):\s*\[(.*)\]\s*$/i);
    if (colorMatch) {
      const colorCode = parseInt(colorMatch[1], 10);
      const edgesStr = colorMatch[2];
      const pairMatches = edgesStr.matchAll(/\((\d+),\s*(\d+)\)/g);
      for (const m of pairMatches) {
        links.push({
          source: parseInt(m[1], 10),
          target: parseInt(m[2], 10),
          color: colorCode
        });
      }
    }
  });

  return { nodes, links };
}

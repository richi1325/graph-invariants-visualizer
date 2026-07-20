export const DEFAULT_COLOR_PALETTE = [
  '#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', '#911EB4',
  '#46F0F0', '#F032E6', '#BCF60C', '#FABEBE', '#008080', '#E6BEFF',
  '#9A6324', '#FFFAC8', '#800000', '#AAFFC3', '#808000', '#FFD8B1',
  '#000075', '#808080', '#00E676', '#FF3D00', '#651FFF', '#00E5FF'
];

export const LINE_STYLES = ['solid', 'dashed', 'dotted'];

export function getColorAttributes(colorCode) {
  const color = DEFAULT_COLOR_PALETTE[Math.abs(colorCode) % DEFAULT_COLOR_PALETTE.length];
  const style = LINE_STYLES[Math.abs(colorCode) % LINE_STYLES.length];
  return { color, style };
}

export function detectCyclesInSubgraph(nodes, edges) {
  const adj = {};
  const degree = {};

  nodes.forEach(nodeId => {
    adj[nodeId] = new Set();
    degree[nodeId] = 0;
  });

  edges.forEach(edge => {
    const u = String(edge.source);
    const v = String(edge.target);
    if (adj[u] && adj[v]) {
      adj[u].add(v);
      adj[v].add(u);
      degree[u]++;
      degree[v]++;
    }
  });

  const leaves = [];
  Object.keys(degree).forEach(nodeId => {
    if (degree[nodeId] <= 1) {
      leaves.push(nodeId);
    }
  });

  while (leaves.length > 0) {
    const leaf = leaves.pop();
    if (adj[leaf]) {
      adj[leaf].forEach(neighbor => {
        adj[neighbor].delete(leaf);
        degree[neighbor]--;
        if (degree[neighbor] === 1) {
          leaves.push(neighbor);
        }
      });
    }
    degree[leaf] = 0;
  }

  const cycleNodes = new Set();
  Object.keys(degree).forEach(nodeId => {
    if (degree[nodeId] >= 2) {
      cycleNodes.add(nodeId);
    }
  });

  const cycleEdges = [];
  edges.forEach(edge => {
    const u = String(edge.source);
    const v = String(edge.target);
    if (cycleNodes.has(u) && cycleNodes.has(v)) {
      cycleEdges.push(edge);
    }
  });

  return {
    hasCycle: cycleNodes.size > 0,
    cycleNodes: Array.from(cycleNodes),
    cycleEdges
  };
}

export function checkAdjacentEdges(edgesColor1, edgesColor2) {
  const nodesColor1 = new Set();
  edgesColor1.forEach(e => {
    nodesColor1.add(String(e.source));
    nodesColor1.add(String(e.target));
  });

  const sharedVertices = new Set();
  edgesColor2.forEach(e => {
    const u = String(e.source);
    const v = String(e.target);
    if (nodesColor1.has(u)) sharedVertices.add(u);
    if (nodesColor1.has(v)) sharedVertices.add(v);
  });

  return {
    isAdjacent: sharedVertices.size > 0,
    sharedVertices: Array.from(sharedVertices)
  };
}

export function checkSubgraphConnectivity(nodes, edges) {
  const activeNodeIds = new Set();
  edges.forEach(e => {
    activeNodeIds.add(String(e.source));
    activeNodeIds.add(String(e.target));
  });

  if (activeNodeIds.size === 0) return true;

  const adj = {};
  activeNodeIds.forEach(id => { adj[id] = []; });

  edges.forEach(e => {
    const u = String(e.source);
    const v = String(e.target);
    adj[u].push(v);
    adj[v].push(u);
  });

  const startNode = Array.from(activeNodeIds)[0];
  const visited = new Set();
  const queue = [startNode];
  visited.add(startNode);

  while (queue.length > 0) {
    const curr = queue.shift();
    adj[curr].forEach(neighbor => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    });
  }

  return visited.size === activeNodeIds.size;
}

export function validateProperty(propertyType, activeColors, nodes, links) {
  const activeColorSet = new Set(activeColors.map(c => Number(c)));
  const filteredEdges = links.filter(link => activeColorSet.has(Number(link.color)));
  const nodeIds = nodes.map(n => String(n.id));

  if (activeColors.length === 0) {
    return {
      isValid: true,
      statusMessage: 'Select color classes to evaluate graph invariant.',
      highlightNodes: [],
      highlightEdges: [],
      type: 'info'
    };
  }

  if (propertyType === 'achromatic_arboricity') {
    if (activeColors.length === 1) {
      const color = activeColors[0];
      const colorEdges = links.filter(l => Number(l.color) === Number(color));
      const res = detectCyclesInSubgraph(nodeIds, colorEdges);
      if (res.hasCycle) {
        return {
          isValid: false,
          statusMessage: `Color ${color} is NOT a forest: Contains a cycle.`,
          highlightNodes: res.cycleNodes,
          highlightEdges: res.cycleEdges.map(e => `e_${e.source}_${e.target}`),
          type: 'danger'
        };
      }
      return {
        isValid: true,
        statusMessage: `Color ${color} is a valid forest (acyclic).`,
        highlightNodes: [],
        highlightEdges: [],
        type: 'success'
      };
    } else if (activeColors.length === 2) {
      const c1 = activeColors[0];
      const c2 = activeColors[1];
      const res = detectCyclesInSubgraph(nodeIds, filteredEdges);
      if (res.hasCycle) {
        return {
          isValid: true,
          statusMessage: `Valid Pair: Union of ${c1} and ${c2} forms a cycle.`,
          highlightNodes: res.cycleNodes,
          highlightEdges: res.cycleEdges.map(e => `e_${e.source}_${e.target}`),
          type: 'success'
        };
      }
      return {
        isValid: false,
        statusMessage: `Achromatic Failure: Union of ${c1} and ${c2} is acyclic (no cycle).`,
        highlightNodes: [],
        highlightEdges: [],
        type: 'danger'
      };
    }
  } else if (propertyType === 'achromatic' || propertyType === 'pseudoachromatic') {
    if (activeColors.length === 2) {
      const c1 = activeColors[0];
      const c2 = activeColors[1];
      const edges1 = links.filter(l => Number(l.color) === Number(c1));
      const edges2 = links.filter(l => Number(l.color) === Number(c2));
      const res = checkAdjacentEdges(edges1, edges2);

      if (res.isAdjacent) {
        return {
          isValid: true,
          statusMessage: `Valid Pair: Colors ${c1} and ${c2} are adjacent at vertex ${res.sharedVertices.join(', ')}.`,
          highlightNodes: res.sharedVertices,
          highlightEdges: [],
          type: 'success'
        };
      }
      return {
        isValid: false,
        statusMessage: `Failure: Colors ${c1} and ${c2} share no adjacent vertices.`,
        highlightNodes: [],
        highlightEdges: [],
        type: 'danger'
      };
    }
  } else if (propertyType === 'connected_pseudoachromatic') {
    if (activeColors.length === 2) {
      const c1 = activeColors[0];
      const c2 = activeColors[1];
      const edges1 = links.filter(l => Number(l.color) === Number(c1));
      const edges2 = links.filter(l => Number(l.color) === Number(c2));
      const adjRes = checkAdjacentEdges(edges1, edges2);
      const isConnected = checkSubgraphConnectivity(nodeIds, filteredEdges);

      if (adjRes.isAdjacent && isConnected) {
        return {
          isValid: true,
          statusMessage: `Valid Pair: Union of ${c1} and ${c2} is adjacent and connected.`,
          highlightNodes: adjRes.sharedVertices,
          highlightEdges: [],
          type: 'success'
        };
      }
      return {
        isValid: false,
        statusMessage: `Failure: Union of ${c1} and ${c2} violates ${!adjRes.isAdjacent ? 'adjacency' : 'connectivity'}.`,
        highlightNodes: adjRes.sharedVertices,
        highlightEdges: [],
        type: 'danger'
      };
    }
  }

  return {
    isValid: true,
    statusMessage: `Evaluating ${activeColors.length} active color classes.`,
    highlightNodes: [],
    highlightEdges: [],
    type: 'info'
  };
}

export function validateAllPairs(propertyType, uniqueColors, nodes, links) {
  const colors = uniqueColors.map(c => Number(c));
  const totalPairs = (colors.length * (colors.length - 1)) / 2;

  if (totalPairs <= 0) {
    return { isValid: true, validCount: 0, totalPairs: 0, percentage: 100, failedPairs: [] };
  }

  let validCount = 0;
  const failedPairs = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const c1 = colors[i];
      const c2 = colors[j];
      const res = validateProperty(propertyType, [c1, c2], nodes, links);
      if (res.isValid) {
        validCount++;
      } else {
        failedPairs.push([c1, c2]);
      }
    }
  }

  const percentage = Math.round((validCount / totalPairs) * 100);

  return {
    isValid: validCount === totalPairs,
    validCount,
    totalPairs,
    percentage,
    failedPairs
  };
}

import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'

const NODE_WIDTH = 200
const NODE_HEIGHT = 88

/**
 * Run Dagre layout on nodes/edges and return them with updated positions.
 * Direction: TB = top-to-bottom (ancestors above, descendants below)
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()

  g.setGraph({
    rankdir: direction,
    ranksep: 100,  // vertical gap between generations
    nodesep: 40,   // horizontal gap between siblings
    edgesep: 20,
    marginx: 40,
    marginy: 40,
  })

  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.measured?.width ?? NODE_WIDTH,
      height: node.measured?.height ?? NODE_HEIGHT,
    })
  })

  // Add edges
  edges.forEach((edge) => {
    // Only add parent-child edges to layout (not partner edges)
    if (!edge.id.startsWith('p-')) {
      g.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id)
    return {
      ...node,
      position: {
        x: dagreNode.x - (node.measured?.width ?? NODE_WIDTH) / 2,
        y: dagreNode.y - (node.measured?.height ?? NODE_HEIGHT) / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

import type { FamilyGraph } from '@/types/relationship'
import type { PersonNode, PersonEdge, LayoutResult } from './types'

/**
 * Calculate React Flow layout for a family tree
 * Positions nodes so ancestors are above descendants
 * Partners are positioned side-by-side at the same Y coordinate
 */
export function calculateLayout(graph: FamilyGraph): LayoutResult {
  if (graph.nodes.size === 0) {
    return { nodes: [], edges: [] }
  }

  // Assign generations (distance from root)
  const generations = assignGenerations(graph)

  // Calculate node positions
  const nodePositions = calculateNodePositions(graph, generations)

  // Create React Flow nodes
  const nodes: PersonNode[] = Array.from(graph.nodes.values()).map((person) => {
    const position = nodePositions.get(person.id) || { x: 0, y: 0 }
    return {
      id: person.id,
      data: {
        person,
        isDeceased: !person.isAlive,
      },
      position,
      type: 'personNode',
    }
  })

  // Create React Flow edges
  const edges: PersonEdge[] = []

  // Add parent-child edges
  graph.parentEdges.forEach((childIds, parentId) => {
    childIds.forEach((childId) => {
      edges.push({
        id: `${parentId}-${childId}`,
        source: parentId,
        target: childId,
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      })
    })
  })

  // Add partner edges
  graph.partnerEdges.forEach((partnerIds, personId) => {
    partnerIds.forEach((partnerId) => {
      // Only add edge once (from smaller id to larger id)
      if (personId < partnerId) {
        edges.push({
          id: `${personId}-${partnerId}-partner`,
          source: personId,
          target: partnerId,
          animated: false,
          style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' },
        })
      }
    })
  })

  return { nodes, edges }
}

/**
 * Assign each person to a generation level
 */
function assignGenerations(graph: FamilyGraph): Map<string, number> {
  const generations = new Map<string, number>()
  const visited = new Set<string>()

  // Find all roots (people with no parents)
  const roots: string[] = []
  graph.nodes.forEach((person) => {
    const parents = graph.childEdges.get(person.id) || []
    if (parents.length === 0) {
      roots.push(person.id)
      generations.set(person.id, 0)
      visited.add(person.id)
    }
  })

  // If no roots found, pick first person as root
  if (roots.length === 0) {
    const firstKey = graph.nodes.keys().next().value as string
    if (firstKey) {
      roots.push(firstKey)
      generations.set(firstKey, 0)
      visited.add(firstKey)
    }
  }

  // BFS to assign generations
  const queue = [...roots]

  while (queue.length > 0) {
    const personId = queue.shift()!
    const currentGen = generations.get(personId)!

    const children = graph.parentEdges.get(personId) || []
    children.forEach((childId) => {
      if (!visited.has(childId)) {
        visited.add(childId)
        generations.set(childId, currentGen + 1)
        queue.push(childId)
      }
    })

    // Partners stay in same generation
    const partners = graph.partnerEdges.get(personId) || []
    partners.forEach((partnerId) => {
      if (!visited.has(partnerId)) {
        visited.add(partnerId)
        generations.set(partnerId, currentGen)
        queue.push(partnerId)
      }
    })
  }

  return generations
}

/**
 * Calculate X,Y positions for all nodes
 */
function calculateNodePositions(
  graph: FamilyGraph,
  generations: Map<string, number>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>()

  // Group people by generation
  const genLevels = new Map<number, string[]>()
  generations.forEach((gen, personId) => {
    if (!genLevels.has(gen)) {
      genLevels.set(gen, [])
    }
    genLevels.get(gen)!.push(personId)
  })

  // Calculate positions
  const nodeWidth = 200
  const nodeHeight = 100
  const verticalGap = 200
  const horizontalGap = 50

  // For each generation, position people horizontally
  genLevels.forEach((peopleIds, generation) => {
    const y = generation * (nodeHeight + verticalGap)

    // Group people by family unit
    const familyGroups = groupByFamilyUnit(peopleIds, graph, generations)

    let xOffset = 0
    familyGroups.forEach((groupIds) => {
      const groupWidth = groupIds.length * (nodeWidth + horizontalGap)

      groupIds.forEach((personId, index) => {
        const x = xOffset + index * (nodeWidth + horizontalGap)
        positions.set(personId, { x, y })
      })

      xOffset += groupWidth + 100 // Extra space between family groups
    })
  })

  return positions
}

/**
 * Group people by family unit to keep families together horizontally
 */
function groupByFamilyUnit(
  peopleIds: string[],
  graph: FamilyGraph,
  _generations: Map<string, number>
): string[][] {
  const groups: string[][] = []
  const assigned = new Set<string>()

  peopleIds.forEach((personId) => {
    if (assigned.has(personId)) return

    const group = [personId]
    assigned.add(personId)

    // Add partners to group
    const partners = graph.partnerEdges.get(personId) || []
    partners.forEach((partnerId) => {
      if (peopleIds.includes(partnerId) && !assigned.has(partnerId)) {
        group.push(partnerId)
        assigned.add(partnerId)
      }
    })

    groups.push(group)
  })

  return groups
}

/**
 * Validate that tree layout respects ordering constraints
 */
export function validateLayoutConstraints(graph: FamilyGraph, layout: LayoutResult): boolean {
  const nodeMap = new Map(layout.nodes.map((n) => [n.id, n]))

  // Check: ancestors always have lower Y than descendants
  let isValid = true
  graph.parentEdges.forEach((childIds, parentId) => {
    const parentNode = nodeMap.get(parentId)
    childIds.forEach((childId) => {
      const childNode = nodeMap.get(childId)
      if (parentNode && childNode) {
        if (parentNode.position.y >= childNode.position.y) {
          isValid = false
        }
      }
    })
  })

  // Check: partners have same Y coordinate
  graph.partnerEdges.forEach((partnerIds, personId) => {
    const personNode = nodeMap.get(personId)
    partnerIds.forEach((partnerId) => {
      const partnerNode = nodeMap.get(partnerId)
      if (personNode && partnerNode) {
        const yDiff = Math.abs(personNode.position.y - partnerNode.position.y)
        if (yDiff > 10) {
          isValid = false
        }
      }
    })
  })

  return isValid
}

import type { Person, PersonSibling } from '@/types/person'
import type { FamilyGraph, RelationshipLabel, CousinRelationship } from '@/types/relationship'

/**
 * Build a family graph from people and relationships
 */
export function buildFamilyGraph(
  people: Person[],
  parentChildRelations: Array<{ parent_id: string; child_id: string }>,
  partnerships: Array<{ partner1_id: string; partner2_id: string }>
): FamilyGraph {
  const nodes = new Map<string, Person>()
  const parentEdges = new Map<string, string[]>()
  const childEdges = new Map<string, string[]>()
  const partnerEdges = new Map<string, string[]>()

  // Build nodes map
  people.forEach((person) => {
    nodes.set(person.id, person)
    parentEdges.set(person.id, [])
    childEdges.set(person.id, [])
    partnerEdges.set(person.id, [])
  })

  // Build parent-child edges
  parentChildRelations.forEach(({ parent_id, child_id }) => {
    if (nodes.has(parent_id) && nodes.has(child_id)) {
      parentEdges.get(parent_id)?.push(child_id)
      childEdges.get(child_id)?.push(parent_id)
    }
  })

  // Build partner edges (bidirectional)
  partnerships.forEach(({ partner1_id, partner2_id }) => {
    if (nodes.has(partner1_id) && nodes.has(partner2_id)) {
      partnerEdges.get(partner1_id)?.push(partner2_id)
      partnerEdges.get(partner2_id)?.push(partner1_id)
    }
  })

  return { nodes, parentEdges, childEdges, partnerEdges }
}

/**
 * Classify siblings and half-siblings
 */
export function classifySiblings(personId: string, graph: FamilyGraph): PersonSibling[] {
  const person = graph.nodes.get(personId)
  if (!person) return []

  const siblings: PersonSibling[] = []
  const personParents = graph.childEdges.get(personId) || []

  // Find all siblings through shared parents
  const siblingMap = new Map<string, Set<string>>()

  personParents.forEach((parentId) => {
    const parentChildren = graph.parentEdges.get(parentId) || []
    parentChildren.forEach((childId) => {
      if (childId !== personId) {
        if (!siblingMap.has(childId)) {
          siblingMap.set(childId, new Set())
        }
        siblingMap.get(childId)?.add(parentId)
      }
    })
  })

  siblingMap.forEach((sharedParents, siblingId) => {
    const sibling = graph.nodes.get(siblingId)
    if (sibling) {
      const isFullSibling = sharedParents.size === personParents.length && personParents.length > 0
      siblings.push({
        id: siblingId,
        fullName: sibling.fullName,
        type: isFullSibling ? 'full' : 'half',
        sharedParents: Array.from(sharedParents),
      })
    }
  })

  return siblings
}

/**
 * Compute relationship between two people using BFS
 * Returns the type and distance of the relationship
 */
export function computeRelationship(
  fromId: string,
  toId: string,
  graph: FamilyGraph
): RelationshipLabel {
  if (fromId === toId) {
    return { label: 'This is you', type: 'self', distance: 0 }
  }

  const path = findShortestPath(fromId, toId, graph)
  if (!path) {
    return { label: 'not related', type: 'not-related', distance: Infinity }
  }

  // Determine relationship type based on path
  const relationship = classifyRelationship(fromId, toId, graph)
  return relationship
}

/**
 * Find shortest path between two people in family graph using BFS
 */
function findShortestPath(
  fromId: string,
  toId: string,
  graph: FamilyGraph
): string[] | null {
  if (!graph.nodes.has(fromId) || !graph.nodes.has(toId)) {
    return null
  }

  const visited = new Set<string>()
  const queue: Array<{ id: string; path: string[] }> = [{ id: fromId, path: [fromId] }]
  visited.add(fromId)

  while (queue.length > 0) {
    const { id, path } = queue.shift()!

    if (id === toId) {
      return path
    }

    // Check parents
    const parents = graph.childEdges.get(id) || []
    parents.forEach((parentId) => {
      if (!visited.has(parentId)) {
        visited.add(parentId)
        queue.push({ id: parentId, path: [...path, parentId] })
      }
    })

    // Check children
    const children = graph.parentEdges.get(id) || []
    children.forEach((childId) => {
      if (!visited.has(childId)) {
        visited.add(childId)
        queue.push({ id: childId, path: [...path, childId] })
      }
    })

    // Check partners
    const partners = graph.partnerEdges.get(id) || []
    partners.forEach((partnerId) => {
      if (!visited.has(partnerId)) {
        visited.add(partnerId)
        queue.push({ id: partnerId, path: [...path, partnerId] })
      }
    })
  }

  return null
}

/**
 * Classify relationship based on path
 */
function classifyRelationship(
  fromId: string,
  toId: string,
  graph: FamilyGraph
): RelationshipLabel {
  const toGender = graph.nodes.get(toId)?.gender

  // Direct parent-child
  const distance = getRelationshipDistance(fromId, toId, graph)
  if (distance === 1) {
    const isParent = graph.childEdges.get(fromId)?.includes(toId)
    const isChild = graph.parentEdges.get(fromId)?.includes(toId)

    if (isParent) {
      return {
        label: toGender === 'Male' ? 'your father' : 'your mother',
        type: 'parent',
        distance: 1,
      }
    }
    if (isChild) {
      return {
        label: toGender === 'Male' ? 'your son' : 'your daughter',
        type: 'child',
        distance: 1,
      }
    }

    // Partner
    if (graph.partnerEdges.get(fromId)?.includes(toId)) {
      return {
        label: toGender === 'Male' ? 'your spouse' : 'your spouse',
        type: 'spouse-partner',
        distance: 1,
      }
    }
  }

  // Ancestors (up the tree)
  if (allAncestors(fromId, toId, graph)) {
    const greatCount = distance - 2
    let label = ''
    if (distance === 2) {
      label = toGender === 'Male' ? 'your grandfather' : 'your grandmother'
    } else {
      const greats = 'great-'.repeat(greatCount)
      label = toGender === 'Male' ? `your ${greats}grandfather` : `your ${greats}grandmother`
    }
    return { label, type: 'grandparent', distance }
  }

  // Descendants (down the tree)
  if (allDescendants(fromId, toId, graph)) {
    const greatCount = distance - 2
    let label = ''
    if (distance === 2) {
      label = toGender === 'Male' ? 'your grandson' : 'your granddaughter'
    } else {
      const greats = 'great-'.repeat(greatCount)
      label = toGender === 'Male' ? `your ${greats}grandson` : `your ${greats}granddaughter`
    }
    return { label, type: 'grandchild', distance }
  }

  // Siblings
  const siblings = classifySiblings(fromId, graph)
  if (siblings.some((s) => s.id === toId)) {
    const sibling = siblings.find((s) => s.id === toId)!
    const typeStr = sibling.type === 'full' ? 'your' : 'your half-'
    const label =
      sibling.type === 'full'
        ? toGender === 'Male'
          ? `${typeStr}brother`
          : `${typeStr}sister`
        : toGender === 'Male'
          ? `${typeStr}brother`
          : `${typeStr}sister`
    return {
      label,
      type: 'sibling',
      distance: 2,
    }
  }

  // Aunt/Uncle
  const aunt = findAuntUncle(fromId, toId, graph)
  if (aunt) {
    const label = toGender === 'Male' ? 'your uncle' : 'your aunt'
    return { label, type: 'aunt-uncle', distance: 3 }
  }

  // Niece/Nephew
  const niece = findNieceNephew(fromId, toId, graph)
  if (niece) {
    const label = toGender === 'Male' ? 'your nephew' : 'your niece'
    return { label, type: 'niece-nephew', distance: 3 }
  }

  // Cousins
  const cousin = findCousin(fromId, toId, graph)
  if (cousin) {
    const label = formatCousinLabel(cousin, toGender)
    return { label, type: 'cousin', distance: cousin.degree * 2 + 2 + cousin.removed }
  }

  return { label: 'not related', type: 'not-related', distance: Infinity }
}

/**
 * Check if toId is an ancestor of fromId
 */
function allAncestors(fromId: string, toId: string, graph: FamilyGraph): boolean {
  const visited = new Set<string>()

  function dfs(id: string): boolean {
    if (visited.has(id)) return false
    visited.add(id)

    if (id === toId) return true

    const parents = graph.childEdges.get(id) || []
    return parents.some((parentId) => dfs(parentId))
  }

  return dfs(fromId)
}

/**
 * Check if toId is a descendant of fromId
 */
function allDescendants(fromId: string, toId: string, graph: FamilyGraph): boolean {
  const visited = new Set<string>()

  function dfs(id: string): boolean {
    if (visited.has(id)) return false
    visited.add(id)

    if (id === toId) return true

    const children = graph.parentEdges.get(id) || []
    return children.some((childId) => dfs(childId))
  }

  return dfs(fromId)
}

/**
 * Find if toId is an aunt/uncle of fromId
 */
function findAuntUncle(fromId: string, toId: string, graph: FamilyGraph): boolean {
  const fromParents = graph.childEdges.get(fromId) || []

  return fromParents.some((parentId) => {
    const parentSiblings = classifySiblings(parentId, graph)
    return parentSiblings.some((s) => s.id === toId)
  })
}

/**
 * Find if toId is a niece/nephew of fromId
 */
function findNieceNephew(fromId: string, toId: string, graph: FamilyGraph): boolean {
  const fromSiblings = classifySiblings(fromId, graph)

  return fromSiblings.some((sibling) => {
    const siblingChildren = graph.parentEdges.get(sibling.id) || []
    return siblingChildren.includes(toId)
  })
}

/**
 * Find if toId is a cousin of fromId
 */
function findCousin(fromId: string, toId: string, graph: FamilyGraph): CousinRelationship | null {
  const fromGrandparents = getAncestorsAtGeneration(fromId, graph, 2)
  const toGrandparents = getAncestorsAtGeneration(toId, graph, 2)

  const commonAncestors = fromGrandparents.filter((id) => toGrandparents.includes(id))

  if (commonAncestors.length === 0) return null

  const fromDistance = distanceToCommonAncestor(fromId, commonAncestors[0], graph)
  const toDistance = distanceToCommonAncestor(toId, commonAncestors[0], graph)

  const degree = Math.min(fromDistance, toDistance) - 1
  const removed = Math.abs(fromDistance - toDistance)

  return { degree, removed }
}

/**
 * Get ancestors at a specific generation distance
 */
function getAncestorsAtGeneration(personId: string, graph: FamilyGraph, generation: number): string[] {
  let current = [personId]

  for (let i = 0; i < generation; i++) {
    const next: string[] = []
    current.forEach((id) => {
      const parents = graph.childEdges.get(id) || []
      next.push(...parents)
    })
    current = next
  }

  return current
}

/**
 * Calculate distance from person to ancestor
 */
function distanceToCommonAncestor(personId: string, ancestorId: string, graph: FamilyGraph): number {
  const visited = new Set<string>()

  function dfs(id: string, distance: number): number {
    if (visited.has(id)) return Infinity
    visited.add(id)

    if (id === ancestorId) return distance

    const parents = graph.childEdges.get(id) || []
    if (parents.length === 0) return Infinity

    let minDistance = Infinity
    parents.forEach((parentId) => {
      const d = dfs(parentId, distance + 1)
      minDistance = Math.min(minDistance, d)
    })
    return minDistance
  }

  return dfs(personId, 0)
}

/**
 * Get relationship distance
 */
function getRelationshipDistance(fromId: string, toId: string, graph: FamilyGraph): number {
  const visited = new Set<string>()
  const queue: Array<{ id: string; distance: number }> = [{ id: fromId, distance: 0 }]
  visited.add(fromId)

  while (queue.length > 0) {
    const { id, distance } = queue.shift()!

    if (id === toId) return distance

    const connections = [
      ...(graph.childEdges.get(id) || []),
      ...(graph.parentEdges.get(id) || []),
      ...(graph.partnerEdges.get(id) || []),
    ]

    connections.forEach((connectedId) => {
      if (!visited.has(connectedId)) {
        visited.add(connectedId)
        queue.push({ id: connectedId, distance: distance + 1 })
      }
    })
  }

  return Infinity
}

/**
 * Format cousin relationship label
 */
function formatCousinLabel(cousin: CousinRelationship, _gender: string | null | undefined): string {
  let label = ''

  if (cousin.degree === 1) {
    label = 'your first cousin'
  } else if (cousin.degree === 2) {
    label = 'your second cousin'
  } else {
    const nth = numberToOrdinal(cousin.degree)
    label = `your ${nth} cousin`
  }

  if (cousin.removed > 0) {
    const times = cousin.removed === 1 ? 'once removed' : `${cousin.removed} times removed`
    label += ` ${times}`
  }

  return label
}

/**
 * Convert number to ordinal string (1 -> "first", 2 -> "second", etc.)
 */
function numberToOrdinal(n: number): string {
  const s = ['zero', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth']
  if (n < s.length) return s[n]
  if (n % 10 === 1 && n % 100 !== 11) return `${n}st`
  if (n % 10 === 2 && n % 100 !== 12) return `${n}nd`
  if (n % 10 === 3 && n % 100 !== 13) return `${n}rd`
  return `${n}th`
}

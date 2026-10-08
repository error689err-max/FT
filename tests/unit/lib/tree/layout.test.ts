import { describe, it, expect } from 'vitest'
import { calculateLayout, validateLayoutConstraints } from '@/lib/tree/layout'
import { buildFamilyGraph } from '@/lib/relationships/calculator'
import type { Person } from '@/types/person'

describe('Tree Layout Engine', () => {
  // Helper to create test person
  const createPerson = (id: string, name: string): Person => ({
    id,
    treeId: 'test-tree',
    fullName: name,
    gender: null,
    birthDate: null,
    deathDate: null,
    isAlive: true,
    city: null,
    country: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  it('should layout single person', () => {
    const people = [createPerson('p1', 'John')]
    const graph = buildFamilyGraph(people, [], [])
    const layout = calculateLayout(graph)

    expect(layout.nodes).toHaveLength(1)
    expect(layout.nodes[0].id).toBe('p1')
    expect(layout.edges).toHaveLength(0)
  })

  it('should position parent above child', () => {
    const people = [
      createPerson('parent', 'Parent'),
      createPerson('child', 'Child'),
    ]
    const relations = [{ parent_id: 'parent', child_id: 'child' }]
    const graph = buildFamilyGraph(people, relations, [])
    const layout = calculateLayout(graph)

    const parentNode = layout.nodes.find((n) => n.id === 'parent')!
    const childNode = layout.nodes.find((n) => n.id === 'child')!

    expect(parentNode.position.y).toBeLessThan(childNode.position.y)
    expect(layout.edges).toHaveLength(1)
  })

  it('should position partners at same Y coordinate', () => {
    const people = [
      createPerson('p1', 'Person 1'),
      createPerson('p2', 'Person 2'),
    ]
    const partnerships = [{ partner1_id: 'p1', partner2_id: 'p2' }]
    const graph = buildFamilyGraph(people, [], partnerships)
    const layout = calculateLayout(graph)

    const node1 = layout.nodes.find((n) => n.id === 'p1')!
    const node2 = layout.nodes.find((n) => n.id === 'p2')!

    // Partners should have same Y (within small threshold for rounding)
    expect(Math.abs(node1.position.y - node2.position.y)).toBeLessThanOrEqual(10)
    expect(layout.edges).toHaveLength(1)
  })

  it('should handle 3-generation tree', () => {
    const people = [
      createPerson('gp1', 'Grandparent'),
      createPerson('p1', 'Parent'),
      createPerson('c1', 'Child'),
    ]
    const relations = [
      { parent_id: 'gp1', child_id: 'p1' },
      { parent_id: 'p1', child_id: 'c1' },
    ]
    const graph = buildFamilyGraph(people, relations, [])
    const layout = calculateLayout(graph)

    const gpNode = layout.nodes.find((n) => n.id === 'gp1')!
    const pNode = layout.nodes.find((n) => n.id === 'p1')!
    const cNode = layout.nodes.find((n) => n.id === 'c1')!

    expect(gpNode.position.y).toBeLessThan(pNode.position.y)
    expect(pNode.position.y).toBeLessThan(cNode.position.y)
    expect(layout.edges).toHaveLength(2)
  })

  it('should validate layout constraints', () => {
    const people = [
      createPerson('p1', 'Parent'),
      createPerson('c1', 'Child'),
    ]
    const relations = [{ parent_id: 'p1', child_id: 'c1' }]
    const graph = buildFamilyGraph(people, relations, [])
    const layout = calculateLayout(graph)

    const isValid = validateLayoutConstraints(graph, layout)
    expect(isValid).toBe(true)
  })

  it('should handle empty graph', () => {
    const graph = buildFamilyGraph([], [], [])
    const layout = calculateLayout(graph)

    expect(layout.nodes).toHaveLength(0)
    expect(layout.edges).toHaveLength(0)
  })

  it('should create parent-child edges', () => {
    const people = [
      createPerson('p1', 'Parent'),
      createPerson('c1', 'Child'),
    ]
    const relations = [{ parent_id: 'p1', child_id: 'c1' }]
    const graph = buildFamilyGraph(people, relations, [])
    const layout = calculateLayout(graph)

    const edge = layout.edges.find((e) => e.source === 'p1' && e.target === 'c1')
    expect(edge).toBeDefined()
    expect(edge?.style?.stroke).toBe('#94a3b8') // Parent-child line color
  })

  it('should create partner edges', () => {
    const people = [
      createPerson('p1', 'Person 1'),
      createPerson('p2', 'Person 2'),
    ]
    const partnerships = [{ partner1_id: 'p1', partner2_id: 'p2' }]
    const graph = buildFamilyGraph(people, [], partnerships)
    const layout = calculateLayout(graph)

    const edge = layout.edges.find((e) =>
      (e.source === 'p1' && e.target === 'p2') || (e.source === 'p2' && e.target === 'p1')
    )
    expect(edge).toBeDefined()
    expect(edge?.style?.stroke).toBe('#ec4899') // Partner line color (pink)
  })
})

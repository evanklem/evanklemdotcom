import { describe, expect, it } from 'vitest'
import { ABOUT_MODES, ART_CATEGORIES, PROJECTS } from '../panelData'

describe('panel data', () => {
  it('keeps project ids unique and display-ready', () => {
    const ids = PROJECTS.map((project) => project.id)

    expect(new Set(ids).size).toBe(ids.length)
    PROJECTS.forEach((project) => {
      expect(project.name).toBeTruthy()
      expect(project.category).toBeTruthy()
      expect(project.sections.length).toBeGreaterThan(0)
      expect(project.cloud).toMatch(/^\/content\/projects\/clouds\//)
      expect(project.glyph).toMatch(/^\/glyphs\/projects\//)
    })
  })

  it('keeps art category and file ids unique', () => {
    const categoryIds = ART_CATEGORIES.map((category) => category.id)
    const fileIds = ART_CATEGORIES.flatMap((category) => category.files.map((file) => file.id))

    expect(new Set(categoryIds).size).toBe(categoryIds.length)
    expect(new Set(fileIds).size).toBe(fileIds.length)
  })

  it('has complete about modes', () => {
    expect(Object.keys(ABOUT_MODES).sort()).toEqual(['profile', 'setup', 'work'])
  })
})

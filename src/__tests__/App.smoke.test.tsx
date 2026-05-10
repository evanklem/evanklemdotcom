import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// jsdom has no WebGL; stub the r3f Canvas so App can compose without crashing.
vi.mock('@react-three/fiber', () => ({
  Canvas: () => null,
}))

import App from '../App'

describe('App', () => {
  it('renders without throwing', () => {
    expect(() => render(<App />)).not.toThrow()
  })
})

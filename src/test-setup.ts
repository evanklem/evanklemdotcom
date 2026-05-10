import '@testing-library/jest-dom'

// jsdom doesn't implement matchMedia; provide a stub for components that
// gate behavior on hover/pointer media queries (e.g. Cursor).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// Node 22+ exposes a `localStorage` global that is a no-op shim unless
// `--localstorage-file` is set, so jsdom's storage gets shadowed in vitest.
// Replace it with a real in-memory shim for tests.
if (typeof window !== 'undefined' && (!window.localStorage || typeof window.localStorage.removeItem !== 'function')) {
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (i) => [...store.keys()][i] ?? null,
    removeItem: (key) => {
      store.delete(key)
    },
    setItem: (key, value) => {
      store.set(key, String(value))
    },
  }
  Object.defineProperty(window, 'localStorage', { configurable: true, value: memoryStorage })
}

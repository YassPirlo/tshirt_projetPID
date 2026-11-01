// Préparation commune à tous les tests du front.
import '@testing-library/jest-dom/vitest' // ajoute toBeInTheDocument(), etc.
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom n'implémente pas IntersectionObserver ; Motion (animations au scroll) en a besoin.
class IntersectionObserverFantome {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverFantome)
})

// Après chaque test : on vide la page et on remet fetch à son état normal
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

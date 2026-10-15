// Préparation commune à tous les tests du front.
import '@testing-library/jest-dom/vitest' // ajoute toBeInTheDocument(), etc.
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Après chaque test : on vide la page et on remet fetch à son état normal
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

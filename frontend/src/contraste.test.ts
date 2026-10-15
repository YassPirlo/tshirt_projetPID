/// <reference types="node" />
// (types de Node.js : ce test lit un fichier, il ne tourne pas dans le navigateur)
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Contrastes de couleurs (critère WCAG 1.4.3, niveau AA) : un texte normal
// doit avoir un rapport d'au moins 4,5 avec son fond. Les couleurs sont lues
// directement dans index.css : si quelqu'un change une couleur et rend un
// texte illisible, ce test échoue.

// Les tests sont lancés depuis le dossier frontend
const css = readFileSync('src/index.css', 'utf8')

function couleur(nom: string): string {
  const trouvee = css.match(new RegExp(`--${nom}:\\s*(#[0-9a-fA-F]{6})`))
  if (!trouvee) throw new Error(`Couleur --${nom} introuvable dans index.css`)
  return trouvee[1]
}

// Luminance relative, formule officielle des WCAG
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function rapport(texte: string, fond: string): number {
  const [clair, fonce] = [luminance(texte), luminance(fond)].sort(
    (a, b) => b - a,
  )
  return (clair + 0.05) / (fonce + 0.05)
}

describe('Contrastes de couleurs (WCAG AA : au moins 4,5)', () => {
  const cas: [string, string, string][] = [
    ['texte principal sur fond blanc', 'encre', 'blanc'],
    ['texte secondaire (gris) sur fond blanc', 'gris', 'blanc'],
    ['texte gris sur fond des photos produit', 'gris', 'fond-produit'],
    ['texte blanc sur fond noir (bandeau, boutons)', 'blanc', 'encre'],
    ["message d'erreur sur fond blanc", 'erreur', 'blanc'],
  ]

  for (const [description, texte, fond] of cas) {
    it(description, () => {
      expect(rapport(couleur(texte), couleur(fond))).toBeGreaterThanOrEqual(4.5)
    })
  }
})

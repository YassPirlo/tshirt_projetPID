import { describe, expect, it, vi } from 'vitest'
import {
  formaterPrix,
  getCategories,
  getProduit,
  getProduitsDeCategorie,
} from './api'

// Remplace fetch par une fausse version qui renvoie la réponse donnée,
// pour tester api.ts sans lancer le back.
function simulerFetch(corps: unknown, status = 200) {
  const faux = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(corps), { status }),
  )
  vi.stubGlobal('fetch', faux)
  return faux
}

describe('formaterPrix', () => {
  it('écrit le prix à la française, avec une virgule et le symbole €', () => {
    // Intl met une espace insécable avant € : on la remplace pour comparer
    expect(formaterPrix(19.99).replace(/\s/g, ' ')).toBe('19,99 €')
  })

  it('garde deux décimales pour un prix rond', () => {
    expect(formaterPrix(20).replace(/\s/g, ' ')).toBe('20,00 €')
  })
})

describe('getCategories (US1)', () => {
  it('appelle /api/categories et renvoie la liste reçue', async () => {
    const faux = simulerFetch([{ id: 1, nom: 'T-shirts classiques' }])

    const categories = await getCategories()

    expect(faux).toHaveBeenCalledWith('/api/categories', { signal: undefined })
    expect(categories).toEqual([{ id: 1, nom: 'T-shirts classiques' }])
  })

  it('lève une erreur si le serveur répond 500', async () => {
    simulerFetch({ message: 'panne' }, 500)

    await expect(getCategories()).rejects.toThrow('Erreur 500')
  })
})

describe('getProduitsDeCategorie (US2)', () => {
  it("appelle l'URL des produits de la catégorie demandée", async () => {
    const faux = simulerFetch([])

    await getProduitsDeCategorie(3)

    expect(faux).toHaveBeenCalledWith('/api/categories/3/produits', {
      signal: undefined,
    })
  })
})

describe('getProduit (US3)', () => {
  it("appelle l'URL du produit demandé", async () => {
    const faux = simulerFetch({ id: 2, nom: 'T-shirt noir' })

    const produit = await getProduit(2)

    expect(faux).toHaveBeenCalledWith('/api/produits/2', { signal: undefined })
    expect(produit.nom).toBe('T-shirt noir')
  })

  it("lève une erreur si le produit n'existe pas (404)", async () => {
    simulerFetch({}, 404)

    await expect(getProduit(999)).rejects.toThrow('Erreur 404')
  })
})

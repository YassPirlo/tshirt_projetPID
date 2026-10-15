import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import {
  classiques,
  nouveautes,
  slim,
  tshirtBlanc,
  tshirtNoir,
} from './test/donnees'

// Tests d'intégration du front : toute l'application (App et tous ses
// composants) est affichée, et un faux back répond aux appels à l'API
// comme le vrai Spring Boot, avec les données de database/schema.sql.
const reponses: Record<string, unknown> = {
  '/api/categories': [nouveautes, classiques, slim],
  '/api/categories/1/produits': [tshirtBlanc, tshirtNoir],
  '/api/categories/3/produits': [],
  '/api/produits/2': tshirtNoir,
}

function demarrerFauxBack() {
  const faux = vi.fn(async (url: string) =>
    url in reponses
      ? new Response(JSON.stringify(reponses[url]), { status: 200 })
      : new Response('{}', { status: 404 }),
  )
  vi.stubGlobal('fetch', faux)
  return faux
}

// Le menu de l'en-tête et les tuiles de l'accueil ont les mêmes noms :
// on cherche dans le menu pour ne pas cliquer au hasard
const menu = () => within(screen.getByRole('banner'))

describe('Parcours complet (US1, US2, US3)', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  it('accueil → catégorie → produit → retour, sans recharger la page', async () => {
    const faux = demarrerFauxBack()
    const adresseDeDepart = window.location.href
    render(<App />)

    // US1 : la page d'accueil affiche les catégories
    expect(
      await screen.findByRole('heading', { name: 'Acheter par catégorie' }),
    ).toBeInTheDocument()
    expect(
      await menu().findByRole('button', { name: 'T-shirts classiques' }),
    ).toBeInTheDocument()

    // US2 : un clic sur une catégorie affiche ses produits
    await userEvent.click(
      menu().getByRole('button', { name: 'T-shirts classiques' }),
    )
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'T-shirts classiques',
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText('2 modèles')).toBeInTheDocument()
    expect(screen.getByText('T-shirt blanc')).toBeInTheDocument()

    // US3 : un clic sur un produit affiche ses détails
    await userEvent.click(screen.getByRole('button', { name: /T-shirt noir/ }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'T-shirt noir' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Adidas')).toBeInTheDocument()
    expect(screen.getByText(/19,99/)).toBeInTheDocument()

    // Retour à la liste, puis à l'accueil par le fil d'Ariane
    await userEvent.click(
      screen.getByRole('button', { name: 'Retour à T-shirts classiques' }),
    )
    expect(await screen.findByText('2 modèles')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Accueil' }))
    expect(
      await screen.findByRole('heading', { name: 'Les essentiels en coton' }),
    ).toBeInTheDocument()

    // Les données viennent toutes de l'API, et la page n'a jamais changé
    // d'adresse : tout s'est fait sans rechargement
    expect(faux.mock.calls.map(([url]) => url)).toEqual([
      '/api/categories',
      '/api/categories/1/produits',
      '/api/produits/2',
    ])
    expect(window.location.href).toBe(adresseDeDepart)
  })

  it('affiche un message quand la catégorie choisie est vide', async () => {
    demarrerFauxBack()
    render(<App />)

    await userEvent.click(
      await menu().findByRole('button', { name: 'Nouveautes' }),
    )

    expect(
      await screen.findByText('Aucun produit disponible dans cette catégorie.'),
    ).toBeInTheDocument()
  })

  it('affiche une erreur claire si le back ne répond pas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )
    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de charger les catégories.',
    )
  })
})

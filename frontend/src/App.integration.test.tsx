import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rendreApp } from './test/rendre'
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

// Appelé au démarrage par ContexteAuth : 401 = personne n'est connecté,
// c'est l'état normal pour ces tests.
const PROFIL = '/api/profil'

function demarrerFauxBack() {
  const faux = vi.fn(async (url: string) => {
    if (url === PROFIL) return new Response('{}', { status: 401 })
    return url in reponses
      ? new Response(JSON.stringify(reponses[url]), { status: 200 })
      : new Response('{}', { status: 404 })
  })
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
    rendreApp()
    expect(window.location.pathname).toBe('/')

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
    expect(window.location.pathname).toBe('/categories/1')

    // US3 : un clic sur un produit affiche ses détails
    await userEvent.click(screen.getByRole('button', { name: /T-shirt noir/ }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'T-shirt noir' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Adidas')).toBeInTheDocument()
    expect(screen.getByText(/19,99/)).toBeInTheDocument()
    expect(window.location.pathname).toBe('/categories/1/produits/2')

    // Retour à la liste, puis à l'accueil par le fil d'Ariane
    await userEvent.click(
      screen.getByRole('button', { name: 'Retour à T-shirts classiques' }),
    )
    expect(await screen.findByText('2 modèles')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Accueil' }))
    expect(
      await screen.findByRole('heading', { name: 'Les essentiels en coton' }),
    ).toBeInTheDocument()

    expect(window.location.pathname).toBe('/')

    // Les données viennent toutes de l'API. La liste n'est pas redemandée
    // au retour depuis le produit : elle était encore en mémoire, la page
    // n'a donc jamais été rechargée.
    const appels = faux.mock.calls.map(([url]) => url)

    // La vérification de session part au démarrage, une seule fois.
    // Son rang n'est pas figé ici : React exécute les effets des
    // composants enfants avant ceux du parent, donc l'ordre entre
    // /api/profil et /api/categories est un détail d'implémentation.
    expect(appels.filter((url) => url === PROFIL)).toHaveLength(1)

    // Les appels métier, eux, doivent arriver dans cet ordre précis :
    // c'est le parcours accueil -> catégorie -> produit.
    expect(appels.filter((url) => url !== PROFIL)).toEqual([
      '/api/categories',
      '/api/categories/1/produits',
      '/api/produits/2',
    ])
  })

  it('ouvre directement un produit depuis son adresse (lien partagé, F5)', async () => {
    demarrerFauxBack()
    rendreApp('/categories/1/produits/2')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'T-shirt noir' }),
    ).toBeInTheDocument()
    // Le fil d'Ariane connaît la catégorie, lue dans l'adresse
    expect(
      screen.getByRole('button', { name: 'Retour à T-shirts classiques' }),
    ).toBeInTheDocument()
    expect(document.title).toBe('T-shirt noir | FACE')
  })

  it('le bouton Précédent du navigateur revient à la page d’avant', async () => {
    demarrerFauxBack()
    rendreApp()

    await userEvent.click(
      await menu().findByRole('button', { name: 'T-shirts classiques' }),
    )
    expect(await screen.findByText('2 modèles')).toBeInTheDocument()

    await act(async () => window.history.back())

    expect(
      await screen.findByRole('heading', { name: 'Les essentiels en coton' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('affiche « Page introuvable » pour une adresse inconnue', async () => {
    demarrerFauxBack()
    rendreApp('/nimporte-quoi')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Page introuvable' }),
    ).toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Retour à l’accueil' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Les essentiels en coton' }),
    ).toBeInTheDocument()
  })

  it('corrige l’adresse d’un produit rangé dans la mauvaise catégorie', async () => {
    // Le vrai back renvoie la catégorie avec le détail du produit
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url === '/api/categories')
          return new Response(JSON.stringify([nouveautes, classiques, slim]))
        if (url === '/api/produits/2')
          return new Response(
            JSON.stringify({ ...tshirtNoir, categorie: classiques }),
          )
        return new Response('{}', { status: 404 })
      }),
    )
    rendreApp('/categories/2/produits/2')

    expect(
      await screen.findByRole('button', { name: 'Retour à T-shirts classiques' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/categories/1/produits/2')
  })

  it('affiche « Page introuvable » pour une catégorie qui n’existe pas', async () => {
    demarrerFauxBack()
    rendreApp('/categories/999')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page introuvable' }),
    ).toBeInTheDocument()
  })

  it('affiche un message quand la catégorie choisie est vide', async () => {
    demarrerFauxBack()
    rendreApp()

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
    rendreApp()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de charger les catégories.',
    )
  })
})

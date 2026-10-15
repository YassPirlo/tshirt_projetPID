import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import Accueil from './components/Accueil'
import BandeauCookies from './components/BandeauCookies'
import FicheProduit from './components/FicheProduit'
import ListeProduits from './components/ListeProduits'
import MentionsLegales from './components/MentionsLegales'
import PolitiqueConfidentialite from './components/PolitiqueConfidentialite'
import PolitiqueCookies from './components/PolitiqueCookies'
import { problemesAccessibilite } from './test/accessibilite'
import {
  classiques,
  nouveautes,
  slim,
  tshirtBlanc,
  tshirtNoir,
} from './test/donnees'

// Tests d'accessibilité automatiques (règles WCAG 2.1 niveau AA, avec axe).
// Chaque écran doit avoir zéro problème. En cas d'échec, le message liste
// la règle non respectée et l'élément en cause.

const rien = () => {}

describe('Accessibilité de chaque écran (axe, WCAG 2.1 AA)', () => {
  it('accueil', async () => {
    const { container } = render(
      <Accueil
        categories={[nouveautes, classiques, slim]}
        chargement={false}
        erreur={null}
        onChoisir={rien}
      />,
    )
    expect(await problemesAccessibilite(container)).toEqual([])
  })

  it('accueil en erreur', async () => {
    const { container } = render(
      <Accueil
        categories={[]}
        chargement={false}
        erreur="Impossible de charger les catégories."
        onChoisir={rien}
      />,
    )
    expect(await problemesAccessibilite(container)).toEqual([])
  })

  it('liste des produits', async () => {
    const { container } = render(
      <ListeProduits
        categorie={classiques}
        produits={[tshirtBlanc, tshirtNoir]}
        chargement={false}
        erreur={null}
        onAccueil={rien}
        onOuvrirProduit={rien}
      />,
    )
    expect(await problemesAccessibilite(container)).toEqual([])
  })

  it('liste en cours de chargement et catégorie vide', async () => {
    const { container, rerender } = render(
      <ListeProduits
        categorie={nouveautes}
        produits={[]}
        chargement={true}
        erreur={null}
        onAccueil={rien}
        onOuvrirProduit={rien}
      />,
    )
    expect(await problemesAccessibilite(container)).toEqual([])

    rerender(
      <ListeProduits
        categorie={nouveautes}
        produits={[]}
        chargement={false}
        erreur={null}
        onAccueil={rien}
        onOuvrirProduit={rien}
      />,
    )
    expect(await problemesAccessibilite(container)).toEqual([])
  })

  it('fiche produit', async () => {
    const { container } = render(
      <FicheProduit
        categorie={classiques}
        produit={tshirtNoir}
        chargement={false}
        erreur={null}
        onAccueil={rien}
        onRetour={rien}
      />,
    )
    expect(await problemesAccessibilite(container)).toEqual([])
  })

  it('bandeau des cookies, fermé puis personnalisé', async () => {
    const { container } = render(
      <BandeauCookies
        mesureAudienceInitiale={false}
        onEnregistrer={rien}
        onEnSavoirPlus={rien}
      />,
    )
    expect(await problemesAccessibilite(container)).toEqual([])

    await userEvent.click(screen.getByRole('button', { name: 'Personnaliser' }))
    expect(await problemesAccessibilite(container)).toEqual([])
  })

  it('pages Mentions légales, Confidentialité et Cookies', async () => {
    for (const page of [
      <MentionsLegales
        onAccueil={rien}
        onConfidentialite={rien}
        onCookies={rien}
      />,
      <PolitiqueConfidentialite onAccueil={rien} onCookies={rien} />,
      <PolitiqueCookies
        consentement={null}
        onAccueil={rien}
        onModifierChoix={rien}
      />,
    ]) {
      const { container, unmount } = render(page)
      expect(await problemesAccessibilite(container)).toEqual([])
      unmount()
    }
  })
})

describe('Accessibilité de la page entière', () => {
  beforeEach(() => {
    localStorage.clear()
    window.scrollTo = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const reponses: Record<string, unknown> = {
          '/api/categories': [nouveautes, classiques, slim],
          '/api/categories/1/produits': [tshirtBlanc, tshirtNoir],
          '/api/produits/2': tshirtNoir,
        }
        return new Response(JSON.stringify(reponses[url] ?? {}), {
          status: url in reponses ? 200 : 404,
        })
      }),
    )
  })

  it('tout le contenu est rangé dans des zones (en-tête, contenu, pied…)', async () => {
    render(<App />)
    await screen.findAllByRole('button', { name: 'Nouveautes' })

    expect(
      await problemesAccessibilite(document.body, { pageEntiere: true }),
    ).toEqual([])
  })

  it('la touche Tab atteint d’abord le lien « Aller au contenu »', async () => {
    render(<App />)

    await userEvent.tab()

    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveFocus()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenu')
  })

  it('après avoir ouvert un produit au clavier, le focus va au contenu', async () => {
    render(<App />)
    const menu = await screen.findByRole('banner')
    const bouton = await screen.findAllByRole('button', {
      name: 'T-shirts classiques',
    })
    bouton.find((b) => menu.contains(b))!.focus()
    await userEvent.keyboard('{Enter}')
    ;(await screen.findByRole('button', { name: /T-shirt noir/ })).focus()
    await userEvent.keyboard('{Enter}')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'T-shirt noir' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveFocus()
  })
})

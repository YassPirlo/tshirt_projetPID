import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ListeProduits from './ListeProduits'
import type { Produit } from '../api'
import { classiques, nouveautes, tshirtBlanc, tshirtNoir } from '../test/donnees'

// Affiche la liste avec des valeurs par défaut, modifiables test par test
function afficher(
  produits: Produit[],
  options: { erreur?: string; onOuvrirProduit?: () => void } = {},
) {
  render(
    <ListeProduits
      categorie={produits.length ? classiques : nouveautes}
      produits={produits}
      chargement={false}
      erreur={options.erreur ?? null}
      onAccueil={vi.fn()}
      onOuvrirProduit={options.onOuvrirProduit ?? vi.fn()}
    />,
  )
}

describe('ListeProduits (US2)', () => {
  it('affiche chaque produit avec son nom et son prix', () => {
    afficher([tshirtBlanc, tshirtNoir])

    expect(screen.getByText('T-shirt blanc')).toBeInTheDocument()
    expect(screen.getByText('T-shirt noir')).toBeInTheDocument()
    expect(screen.getAllByText(/19,99/)).toHaveLength(2)
    expect(screen.getByText('2 modèles')).toBeInTheDocument()
  })

  it('met le nom du produit en infobulle sur la miniature', () => {
    afficher([tshirtNoir])

    const image = document.querySelector('img')
    expect(image).toHaveAttribute('title', 'T-shirt noir')
    expect(image).toHaveAttribute('src', '/images/tshirt-noir.svg')
  })

  it('affiche un message quand la catégorie est vide', () => {
    afficher([])

    expect(
      screen.getByText('Aucun produit disponible dans cette catégorie.'),
    ).toBeInTheDocument()
  })

  it('affiche le message d’erreur si les produits ne chargent pas', () => {
    afficher([], { erreur: 'Impossible de charger les produits.' })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Impossible de charger les produits.',
    )
  })
})

describe('ListeProduits (US3)', () => {
  it('ouvre le détail quand on clique sur un produit', async () => {
    const onOuvrirProduit = vi.fn()
    afficher([tshirtBlanc, tshirtNoir], { onOuvrirProduit })

    await userEvent.click(screen.getByRole('button', { name: /T-shirt noir/ }))

    expect(onOuvrirProduit).toHaveBeenCalledWith(tshirtNoir)
  })

  it('ouvre le détail au clavier avec la touche Entrée', async () => {
    const onOuvrirProduit = vi.fn()
    afficher([tshirtBlanc], { onOuvrirProduit })

    screen.getByRole('button', { name: /T-shirt blanc/ }).focus()
    await userEvent.keyboard('{Enter}')

    expect(onOuvrirProduit).toHaveBeenCalledWith(tshirtBlanc)
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FicheProduit from './FicheProduit'
import { classiques, tshirtNoir } from '../test/donnees'

describe('FicheProduit (US3)', () => {
  it('affiche le nom, la marque, le prix et l’image du produit', () => {
    render(
      <FicheProduit
        categorie={classiques}
        produit={tshirtNoir}
        chargement={false}
        erreur={null}
        onAccueil={vi.fn()}
        onRetour={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'T-shirt noir' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Adidas')).toBeInTheDocument()
    expect(screen.getByText(/19,99/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'T-shirt noir' })).toHaveAttribute(
      'src',
      '/images/tshirt-noir.svg',
    )
  })

  it('revient à la catégorie avec le bouton Retour', async () => {
    const onRetour = vi.fn()
    render(
      <FicheProduit
        categorie={classiques}
        produit={tshirtNoir}
        chargement={false}
        erreur={null}
        onAccueil={vi.fn()}
        onRetour={onRetour}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Retour à T-shirts classiques' }),
    )

    expect(onRetour).toHaveBeenCalled()
  })

  it('affiche le message d’erreur si le produit ne charge pas', () => {
    render(
      <FicheProduit
        categorie={classiques}
        produit={null}
        chargement={false}
        erreur="Impossible de charger ce produit."
        onAccueil={vi.fn()}
        onRetour={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Impossible de charger ce produit.',
    )
  })
})

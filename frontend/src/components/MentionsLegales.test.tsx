import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import MentionsLegales from './MentionsLegales'

describe('MentionsLegales', () => {
  it('indique que le site est un projet d’école sans vente réelle', () => {
    render(
      <MentionsLegales
        onAccueil={vi.fn()}
        onConfidentialite={vi.fn()}
        onCookies={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { level: 1, name: 'Mentions légales' }),
    ).toBeInTheDocument()
    expect(screen.getByText("aucun produit n'est vendu")).toBeInTheDocument()
    for (const titre of [
      'Éditeur du site',
      'Hébergement',
      'Droit applicable',
    ]) {
      expect(screen.getByRole('heading', { name: titre })).toBeInTheDocument()
    }
  })

  it('renvoie vers les pages Confidentialité et Cookies', async () => {
    const onConfidentialite = vi.fn()
    const onCookies = vi.fn()
    render(
      <MentionsLegales
        onAccueil={vi.fn()}
        onConfidentialite={onConfidentialite}
        onCookies={onCookies}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Confidentialité' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cookies' }))

    expect(onConfidentialite).toHaveBeenCalled()
    expect(onCookies).toHaveBeenCalled()
  })
})

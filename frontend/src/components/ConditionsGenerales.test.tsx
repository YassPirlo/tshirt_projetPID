import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ConditionsGenerales from './ConditionsGenerales'
import { problemesAccessibilite } from '../test/accessibilite'

describe('ConditionsGenerales', () => {
  it('présente les conditions de vente, dont le droit de rétractation', () => {
    render(<ConditionsGenerales onAccueil={vi.fn()} onConfidentialite={vi.fn()} />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Conditions générales de vente' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/projet pédagogique/)).toBeInTheDocument()
    for (const titre of ['3. Produits et prix', '7. Droit de rétractation', '8. Garantie']) {
      expect(screen.getByRole('heading', { name: titre })).toBeInTheDocument()
    }
    expect(screen.getByText('14 jours')).toBeInTheDocument()
  })

  it('renvoie vers la page Confidentialité', async () => {
    const onConfidentialite = vi.fn()
    render(<ConditionsGenerales onAccueil={vi.fn()} onConfidentialite={onConfidentialite} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Confidentialité' }))

    expect(onConfidentialite).toHaveBeenCalledOnce()
  })

  it('ne présente aucun problème d’accessibilité', async () => {
    const { container } = render(
      <ConditionsGenerales onAccueil={vi.fn()} onConfidentialite={vi.fn()} />,
    )

    expect(await problemesAccessibilite(container)).toEqual([])
  })
})

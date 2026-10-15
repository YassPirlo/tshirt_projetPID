import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BandeauCookies from './BandeauCookies'

function afficher(onEnregistrer = vi.fn()) {
  render(
    <BandeauCookies
      mesureAudienceInitiale={false}
      onEnregistrer={onEnregistrer}
      onEnSavoirPlus={vi.fn()}
    />,
  )
  return onEnregistrer
}

describe('BandeauCookies', () => {
  it('propose de refuser aussi simplement que d’accepter', () => {
    afficher()

    expect(screen.getByRole('button', { name: 'Tout refuser' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Tout accepter' })).toBeVisible()
  })

  it('« Tout refuser » enregistre un refus', async () => {
    const onEnregistrer = afficher()

    await userEvent.click(screen.getByRole('button', { name: 'Tout refuser' }))

    expect(onEnregistrer).toHaveBeenCalledWith(false)
  })

  it('« Tout accepter » enregistre une acceptation', async () => {
    const onEnregistrer = afficher()

    await userEvent.click(screen.getByRole('button', { name: 'Tout accepter' }))

    expect(onEnregistrer).toHaveBeenCalledWith(true)
  })

  it('permet de choisir par catégorie, rien n’étant coché par défaut', async () => {
    const onEnregistrer = afficher()

    await userEvent.click(screen.getByRole('button', { name: 'Personnaliser' }))
    const necessaires = screen.getByRole('checkbox', { name: /Nécessaires/ })
    const audience = screen.getByRole('checkbox', { name: /Mesure d'audience/ })

    expect(necessaires).toBeChecked()
    expect(necessaires).toBeDisabled()
    expect(audience).not.toBeChecked()

    await userEvent.click(audience)
    await userEvent.click(
      screen.getByRole('button', { name: 'Enregistrer mes choix' }),
    )

    expect(onEnregistrer).toHaveBeenCalledWith(true)
  })
})

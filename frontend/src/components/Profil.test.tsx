import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Profil from './Profil'
import { rendreAvecAuth } from '../test/rendre'
import { problemesAccessibilite } from '../test/accessibilite'

const compte = {
  id: 7,
  email: 'yassine@mail.be',
  nom: 'Vitullo',
  prenom: 'Yassine',
  adresse: '12 rue des Tests',
  codePostal: '1000',
  ville: 'Bruxelles',
  pays: 'BE',
}

// Faux back : seul /api/profil est appelé (par FournisseurAuth, au
// démarrage). La déconnexion, elle, est simulée par la prop onDeconnexion.
function simulerBack(connecte: boolean) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      connecte
        ? new Response(JSON.stringify(compte), { status: 200 })
        : new Response('{}', { status: 401 }),
    ),
  )
}

function afficher(props: Partial<Parameters<typeof Profil>[0]> = {}) {
  const rappels = {
    onAccueil: vi.fn(),
    onDeconnexion: vi.fn().mockResolvedValue(undefined),
    onConnexion: vi.fn(),
    ...props,
  }
  const rendu = rendreAvecAuth(<Profil {...rappels} />)
  return { ...rappels, ...rendu }
}

describe('Profil (US6) et déconnexion (US7)', () => {
  it('affiche toutes les informations du compte connecté', async () => {
    simulerBack(true)
    afficher()

    expect(await screen.findByText('Yassine')).toBeInTheDocument()
    expect(screen.getByText('Vitullo')).toBeInTheDocument()
    expect(screen.getByText('yassine@mail.be')).toBeInTheDocument()
    expect(screen.getByText('12 rue des Tests')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('Bruxelles')).toBeInTheDocument()
    // Le nom du pays, pas son code
    expect(screen.getByText('Belgique')).toBeInTheDocument()
  })

  it('propose de se connecter à un visiteur', async () => {
    simulerBack(false)
    const { onConnexion } = afficher()

    expect(await screen.findByText(/pas connecté/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Se déconnecter' }),
    ).not.toBeInTheDocument()

    await userEvent.setup().click(
      screen.getByRole('button', { name: 'Se connecter' }),
    )
    expect(onConnexion).toHaveBeenCalledTimes(1)
  })

  // Sans ce garde-fou, un F5 sur /profil afficherait « Se connecter »
  // avant que la session ne soit retrouvée.
  it('n’affiche pas « Se connecter » pendant la vérification de la session', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    afficher()

    expect(screen.getByText('Chargement…')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Se connecter' }),
    ).not.toBeInTheDocument()
  })

  it('lance la déconnexion au clic sur « Se déconnecter »', async () => {
    simulerBack(true)
    const { onDeconnexion } = afficher()

    await userEvent.setup().click(
      await screen.findByRole('button', { name: 'Se déconnecter' }),
    )

    expect(onDeconnexion).toHaveBeenCalledTimes(1)
  })

  it('affiche un message et reste connecté si la déconnexion échoue', async () => {
    simulerBack(true)
    afficher({ onDeconnexion: vi.fn().mockRejectedValue(new Error('500')) })

    await userEvent.setup().click(
      await screen.findByRole('button', { name: 'Se déconnecter' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /toujours connecté/,
    )
    // Les informations sont toujours là et le bouton est réutilisable
    expect(screen.getByText('Yassine')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Se déconnecter' }),
    ).toBeEnabled()
  })

  it('désactive le bouton pendant l’envoi pour éviter un double clic', async () => {
    simulerBack(true)
    let terminer: () => void = () => {}
    const onDeconnexion = vi.fn(
      () => new Promise<void>((resolve) => (terminer = resolve)),
    )
    afficher({ onDeconnexion })

    await userEvent.setup().click(
      await screen.findByRole('button', { name: 'Se déconnecter' }),
    )

    expect(screen.getByRole('button', { name: 'Déconnexion…' })).toBeDisabled()

    terminer()
    await waitFor(() => expect(onDeconnexion).toHaveBeenCalledTimes(1))
  })

  it('mène à l’accueil', async () => {
    simulerBack(true)
    const { onAccueil } = afficher()
    await screen.findByText('Yassine')

    await userEvent.setup().click(
      screen.getByRole('button', { name: 'Retour à l’accueil' }),
    )

    expect(onAccueil).toHaveBeenCalledTimes(1)
  })

  it('ne présente aucun problème d’accessibilité, même avec une erreur', async () => {
    simulerBack(true)
    const { container } = afficher({
      onDeconnexion: vi.fn().mockRejectedValue(new Error('500')),
    })

    await userEvent.setup().click(
      await screen.findByRole('button', { name: 'Se déconnecter' }),
    )
    await screen.findByRole('alert')

    expect(await problemesAccessibilite(container)).toEqual([])
  })
})

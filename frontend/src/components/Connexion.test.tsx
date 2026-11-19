import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Connexion from './Connexion'
import { useAuth } from '../ContexteAuth'
import { rendreAvecAuth } from '../test/rendre'
import { problemesAccessibilite } from '../test/accessibilite'

const compte = {
  id: 7,
  email: 'yassine@mail.be',
  nom: 'Vitullo',
  prenom: 'Yassine',
}

// Affiche qui le contexte croit connecté, pour vérifier que la page l'a
// bien prévenu après la connexion.
function Temoin() {
  const { utilisateur } = useAuth()
  return <p>Connecté : {utilisateur ? utilisateur.prenom : 'personne'}</p>
}

// Faux back : /api/profil répond 401 (visiteur anonyme au démarrage),
// /api/connexion répond ce que le test demande.
function simulerBack(reponseConnexion: () => Promise<Response>) {
  const faux = vi.fn(async (adresse: string) =>
    adresse === '/api/profil'
      ? new Response('{}', { status: 401 })
      : reponseConnexion(),
  )
  vi.stubGlobal('fetch', faux)
  return faux
}

const json = (corps: unknown, status: number) =>
  Promise.resolve(new Response(JSON.stringify(corps), { status }))

function afficher(props: Partial<Parameters<typeof Connexion>[0]> = {}) {
  const rappels = {
    onAccueil: vi.fn(),
    onConnecte: vi.fn(),
    onInscription: vi.fn(),
    ...props,
  }
  const rendu = rendreAvecAuth(
    <>
      <Connexion {...rappels} />
      <Temoin />
    </>,
  )
  return { ...rappels, ...rendu }
}

async function remplirEtEnvoyer(email: string, motDePasse: string) {
  const utilisateur = userEvent.setup()
  await utilisateur.type(screen.getByLabelText('Email'), email)
  await utilisateur.type(screen.getByLabelText('Mot de passe'), motDePasse)
  await utilisateur.click(screen.getByRole('button', { name: 'Se connecter' }))
}

describe('Connexion (US4)', () => {
  it('affiche le formulaire avec un champ mot de passe masqué', () => {
    simulerBack(() => json({}, 401))
    afficher()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Se connecter' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('type', 'password')
  })

  it('envoie les identifiants, prévient le contexte puis redirige', async () => {
    const faux = simulerBack(() => json(compte, 200))
    const { onConnecte } = afficher()

    await remplirEtEnvoyer('yassine@mail.be', 'motdepasse123')

    await waitFor(() => expect(onConnecte).toHaveBeenCalledTimes(1))
    expect(screen.getByText('Connecté : Yassine')).toBeInTheDocument()
    expect(faux).toHaveBeenCalledWith(
      '/api/connexion',
      expect.objectContaining({
        method: 'POST',
        // Sans credentials: 'include', le cookie de session serait ignoré
        credentials: 'include',
        body: JSON.stringify({
          email: 'yassine@mail.be',
          motDePasse: 'motdepasse123',
        }),
      }),
    )
  })

  it('affiche un message sur 401, vide le mot de passe et garde l’email', async () => {
    simulerBack(() => json({ message: 'Email ou mot de passe incorrect' }, 401))
    const { onConnecte } = afficher()

    await remplirEtEnvoyer('yassine@mail.be', 'mauvais')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email ou mot de passe incorrect',
    )
    expect(screen.getByLabelText('Email')).toHaveValue('yassine@mail.be')
    expect(screen.getByLabelText('Mot de passe')).toHaveValue('')
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('aria-invalid', 'true')
    expect(onConnecte).not.toHaveBeenCalled()
    expect(screen.getByText('Connecté : personne')).toBeInTheDocument()
  })

  // POINT NOTÉ — énumération de comptes : même si le back précisait un jour
  // la cause, la page ne doit afficher que le message commun.
  it('n’affiche jamais la cause précise d’un refus', async () => {
    simulerBack(() => json({ message: 'Aucun compte pour cet email' }, 401))
    afficher()

    await remplirEtEnvoyer('inconnu@mail.be', 'motdepasse123')

    const alerte = await screen.findByRole('alert')
    expect(alerte).toHaveTextContent('Email ou mot de passe incorrect')
    expect(alerte).not.toHaveTextContent(/aucun compte/i)
  })

  it('affiche le message du back quand un champ est vide (400)', async () => {
    simulerBack(() => json({ message: 'Le mot de passe est obligatoire' }, 400))
    afficher()

    const utilisateur = userEvent.setup()
    await utilisateur.type(screen.getByLabelText('Email'), 'yassine@mail.be')
    await utilisateur.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Le mot de passe est obligatoire',
    )
  })

  it('prévient l’utilisateur si le serveur est injoignable', async () => {
    simulerBack(() => Promise.reject(new TypeError('Failed to fetch')))
    afficher()

    await remplirEtEnvoyer('yassine@mail.be', 'motdepasse123')

    expect(await screen.findByRole('alert')).toHaveTextContent(/réessayez/)
  })

  it('désactive le bouton pendant l’envoi pour éviter un double envoi', async () => {
    let repondre: (r: Response) => void = () => {}
    const faux = simulerBack(
      () => new Promise<Response>((resolve) => (repondre = resolve)),
    )
    afficher()

    await remplirEtEnvoyer('yassine@mail.be', 'motdepasse123')

    const bouton = screen.getByRole('button', { name: 'Connexion…' })
    expect(bouton).toBeDisabled()

    repondre(new Response(JSON.stringify(compte), { status: 200 }))
    await waitFor(() =>
      expect(
        faux.mock.calls.filter(([adresse]) => adresse === '/api/connexion'),
      ).toHaveLength(1),
    )
  })

  it('mène à l’inscription et à l’accueil', async () => {
    simulerBack(() => json({}, 401))
    const { onInscription, onAccueil } = afficher()
    const utilisateur = userEvent.setup()

    await utilisateur.click(screen.getByRole('button', { name: 'Créer un compte' }))
    await utilisateur.click(screen.getByRole('button', { name: 'Retour à l’accueil' }))

    expect(onInscription).toHaveBeenCalledTimes(1)
    expect(onAccueil).toHaveBeenCalledTimes(1)
  })

  it('ne présente aucun problème d’accessibilité, même avec une erreur', async () => {
    simulerBack(() => json({}, 401))
    const { container } = afficher()

    await remplirEtEnvoyer('yassine@mail.be', 'mauvais')
    await screen.findByRole('alert')

    expect(await problemesAccessibilite(container)).toEqual([])
  })
})

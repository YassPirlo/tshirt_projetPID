import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Inscription from './Inscription'
import { useAuth } from '../ContexteAuth'
import { rendreAvecAuth } from '../test/rendre'

// Faux back : /api/profil répond 401 (personne n'est connecté au départ,
// c'est l'appel que fait FournisseurAuth au démarrage), et
// /api/inscription répond ce qu'on lui donne.
function fauxBack(statut: number, corps: unknown) {
  const faux = vi.fn(async (url: string) => {
    if (url === '/api/profil') return new Response('{}', { status: 401 })
    if (url === '/api/inscription')
      return new Response(JSON.stringify(corps), { status: statut })
    return new Response('{}', { status: 404 })
  })
  vi.stubGlobal('fetch', faux)
  return faux
}

// Affiche le prénom du compte connecté, pour vérifier que le contexte a
// bien été prévenu après l'inscription.
function CompteConnecte() {
  const { utilisateur } = useAuth()
  return <p>{utilisateur ? `Bienvenue, ${utilisateur.prenom}` : 'Anonyme'}</p>
}

async function remplirEtEnvoyer() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Prénom'), 'Loïc')
  await user.type(screen.getByLabelText('Nom'), 'Rossel')
  await user.type(screen.getByLabelText('Email'), 'loic@mail.be')
  await user.type(
    screen.getByLabelText('Mot de passe (8 caractères minimum)'),
    'motdepasse123',
  )
  await user.click(screen.getByRole('button', { name: 'Créer mon compte' }))
}

function afficher(onInscrit = vi.fn()) {
  rendreAvecAuth(
    <>
      <CompteConnecte />
      <Inscription
        onAccueil={vi.fn()}
        onInscrit={onInscrit}
        onConnexion={vi.fn()}
      />
    </>,
  )
  return onInscrit
}

describe('Inscription (US5 du backlog)', () => {
  it('affiche les quatre champs du formulaire', () => {
    fauxBack(201, {})
    afficher()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Créer un compte' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Prénom')).toBeInTheDocument()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Mot de passe (8 caractères minimum)'),
    ).toHaveAttribute('type', 'password')
  })

  it('envoie le formulaire, connecte le visiteur puis le redirige', async () => {
    const faux = fauxBack(201, {
      id: 7,
      email: 'loic@mail.be',
      nom: 'Rossel',
      prenom: 'Loïc',
    })
    const onInscrit = afficher()

    await remplirEtEnvoyer()

    // Le bon endpoint, en POST, avec les quatre champs
    const appel = faux.mock.calls.find(([url]) => url === '/api/inscription')
    expect(appel).toBeDefined()
    // Le faux fetch est déclaré avec un seul paramètre (url) : TypeScript
    // croit donc qu'il n'y a pas de deuxième élément. On lui précise la
    // forme réelle d'un appel à fetch : (url, options).
    const options = (appel as unknown as [string, RequestInit])[1]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body as string)).toEqual({
      email: 'loic@mail.be',
      motDePasse: 'motdepasse123',
      nom: 'Rossel',
      prenom: 'Loïc',
    })

    expect(await screen.findByText('Bienvenue, Loïc')).toBeInTheDocument()
    expect(onInscrit).toHaveBeenCalledOnce()
  })

  it('affiche un message à côté de l’email s’il est déjà pris (409)', async () => {
    fauxBack(409, { message: 'Un compte existe déjà avec cet email' })
    const onInscrit = afficher()

    await remplirEtEnvoyer()

    const alerte = await screen.findByRole('alert')
    expect(alerte).toHaveTextContent('Un compte existe déjà avec cet email')
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onInscrit).not.toHaveBeenCalled()
    expect(screen.getByText('Anonyme')).toBeInTheDocument()
  })

  it('affiche le message du back si un champ est refusé (400)', async () => {
    fauxBack(400, { message: 'Le mot de passe doit faire au moins 8 caractères' })
    const onInscrit = afficher()

    await remplirEtEnvoyer()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Le mot de passe doit faire au moins 8 caractères',
    )
    expect(onInscrit).not.toHaveBeenCalled()
  })

  it('affiche un message générique si le serveur ne répond pas', async () => {
    fauxBack(500, {})
    afficher()

    await remplirEtEnvoyer()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de créer le compte',
    )
  })
})

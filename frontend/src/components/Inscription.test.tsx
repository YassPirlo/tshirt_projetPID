import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Inscription from './Inscription'
import { useAuth } from '../ContexteAuth'
import { rendreAvecAuth } from '../test/rendre'

// Faux back : /api/profil répond 401 (personne n'est connecté au départ,
// c'est l'appel que fait FournisseurAuth au démarrage), et
// /api/inscription répond ce qu'on lui donne.
// Les villes de quelques codes postaux, comme GET /api/localites
const LOCALITES: Record<string, string[]> = {
  '1000': ['Brussel', 'Bruxelles'],
  '1050': ['Elsene', 'Ixelles'],
}

function reponseLocalites(url: string) {
  const code = new URL(url, 'http://test').searchParams.get('codePostal') ?? ''
  return new Response(JSON.stringify(LOCALITES[code] ?? []), { status: 200 })
}

function fauxBack(statut: number, corps: unknown) {
  const faux = vi.fn(async (url: string) => {
    if (url.startsWith('/api/localites')) return reponseLocalites(url)
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

async function remplirEtEnvoyer(confirmation = 'motdepasse123') {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Prénom'), 'Loïc')
  await user.type(screen.getByLabelText('Nom'), 'Rossel')
  await user.type(screen.getByLabelText('Adresse'), '12 rue des Tests')
  await user.type(screen.getByLabelText('Code postal'), '1000')
  // Deux localités pour 1000 : on choisit la sienne dans la liste
  await user.selectOptions(
    screen.getByLabelText('Ville'),
    await screen.findByRole('option', { name: 'Bruxelles' }),
  )
  await user.type(screen.getByLabelText('Email'), 'loic@mail.be')
  await user.type(
    screen.getByLabelText('Mot de passe (8 caractères minimum)'),
    'motdepasse123',
  )
  await user.type(screen.getByLabelText('Confirmer le mot de passe'), confirmation)
  await user.click(
    screen.getByRole('checkbox', { name: /J’ai lu et j’accepte les conditions générales de vente/ }),
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
  it('affiche les champs du formulaire, avec la confirmation du mot de passe', () => {
    fauxBack(201, {})
    afficher()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Créer un compte' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Prénom')).toBeInTheDocument()
    expect(screen.getByLabelText('Nom')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    // US5 : adresse, code postal et ville sont demandés par le backlog
    expect(screen.getByLabelText('Adresse')).toBeRequired()
    expect(screen.getByLabelText('Code postal')).toBeRequired()
    expect(screen.getByLabelText('Ville')).toBeRequired()
    expect(
      screen.getByLabelText('Mot de passe (8 caractères minimum)'),
    ).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('Confirmer le mot de passe')).toHaveAttribute(
      'type',
      'password',
    )
  })

  // La confirmation sert à éviter une faute de frappe : on bloque avant
  // l'envoi, le back n'est pas appelé.
  it('refuse deux mots de passe différents sans rien envoyer', async () => {
    const faux = fauxBack(201, {})
    const onInscrit = afficher()

    await remplirEtEnvoyer('autrechose123')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Les deux mots de passe ne sont pas identiques',
    )
    const confirmation = screen.getByLabelText('Confirmer le mot de passe')
    expect(confirmation).toHaveAttribute('aria-invalid', 'true')
    expect(confirmation).toHaveFocus()
    expect(faux.mock.calls.some(([url]) => url === '/api/inscription')).toBe(false)
    expect(onInscrit).not.toHaveBeenCalled()
  })

  it('envoie le formulaire, connecte le visiteur puis le redirige', async () => {
    const faux = fauxBack(201, {
      id: 7,
      email: 'loic@mail.be',
      nom: 'Rossel',
      prenom: 'Loïc',
      adresse: '12 rue des Tests',
      codePostal: '1000',
      ville: 'Bruxelles',
    })
    const onInscrit = afficher()

    await remplirEtEnvoyer()

    // Le bon endpoint, en POST, avec les sept champs
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
      adresse: '12 rue des Tests',
      codePostal: '1000',
      ville: 'Bruxelles',
      pays: 'BE',
      cgvAcceptees: true,
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
    expect(screen.getByLabelText('Email')).toHaveFocus()
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

  it('affiche la jauge de sécurité pendant la saisie du mot de passe', async () => {
    fauxBack(201, {})
    afficher()
    const user = userEvent.setup()

    // Rien tant que le champ est vide
    expect(screen.queryByRole('meter')).not.toBeInTheDocument()

    const champ = screen.getByLabelText('Mot de passe (8 caractères minimum)')
    await user.type(champ, 'azerty123')
    expect(screen.getByRole('meter', { name: 'Sécurité du mot de passe' })).toHaveAttribute(
      'aria-valuetext',
      'Très faible',
    )

    await user.clear(champ)
    await user.type(champ, 'Tshirts-FACE-2026')
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', 'Excellent')
    // Le champ renvoie aux conseils de la jauge
    expect(champ).toHaveAttribute('aria-describedby', 'conseils-mot-de-passe')
  })

  it('exige la case des conditions générales, avec un lien vers elles', () => {
    fauxBack(201, {})
    afficher()

    const caseCgv = screen.getByRole('checkbox', {
      name: /J’ai lu et j’accepte les conditions générales de vente/,
    })
    expect(caseCgv).toBeRequired()
    expect(caseCgv).not.toBeChecked()
    const lien = screen.getByRole('link', { name: /conditions générales de vente/ })
    expect(lien).toHaveAttribute('href', '/conditions-generales')
    // Nouvel onglet, pour ne pas perdre le formulaire rempli
    expect(lien).toHaveAttribute('target', '_blank')
  })
})

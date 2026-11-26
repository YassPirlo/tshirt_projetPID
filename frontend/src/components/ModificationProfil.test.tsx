import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Profil from './Profil'
import { useAuth } from '../ContexteAuth'
import { rendreAvecAuth } from '../test/rendre'
import { problemesAccessibilite } from '../test/accessibilite'

// US6 — Modifier ses informations personnelles, depuis la page Profil.

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

// Les villes de quelques codes postaux, comme GET /api/localites
const LOCALITES: Record<string, string[]> = {
  '1000': ['Brussel', 'Bruxelles'],
  '1050': ['Elsene', 'Ixelles'],
}

function reponseLocalites(url: string) {
  const code = new URL(url, 'http://test').searchParams.get('codePostal') ?? ''
  return new Response(JSON.stringify(LOCALITES[code] ?? []), { status: 200 })
}


// Faux back : GET /api/profil répond le compte (appel de FournisseurAuth au
// démarrage), PUT /api/profil répond ce qu'on lui donne.
function fauxBack(statut: number, corps: unknown) {
  const faux = vi.fn(async (url: string, options?: RequestInit) => {
    if (url.startsWith('/api/localites')) return reponseLocalites(url)
    if (url === '/api/profil' && options?.method === 'PUT') {
      return new Response(JSON.stringify(corps), { status: statut })
    }
    if (url === '/api/profil') {
      return new Response(JSON.stringify(compte), { status: 200 })
    }
    return new Response('{}', { status: 404 })
  })
  vi.stubGlobal('fetch', faux)
  return faux
}

// Affiche le prénom connu du contexte : c'est lui que l'en-tête utilise
// pour « Bienvenue, <prénom> ».
function PrenomDuContexte() {
  const { utilisateur } = useAuth()
  return <p data-testid="contexte">{utilisateur?.prenom}</p>
}

function afficher() {
  return rendreAvecAuth(
    <>
      <PrenomDuContexte />
      <Profil
        onAccueil={vi.fn()}
        onDeconnexion={vi.fn().mockResolvedValue(undefined)}
        onConnexion={vi.fn()}
      />
    </>,
  )
}

async function ouvrirLeFormulaire() {
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole('button', { name: 'Modifier mes informations' }),
  )
  // Les villes du code postal enregistré sont chargées
  await screen.findByRole('option', { name: 'Bruxelles' })
  return user
}

// Remplace le contenu d'un champ
async function remplacer(
  user: ReturnType<typeof userEvent.setup>,
  libelle: string,
  valeur: string,
) {
  const champ = screen.getByLabelText(libelle)
  await user.clear(champ)
  await user.type(champ, valeur)
}

describe('Modification du profil (US6)', () => {
  it('ouvre un formulaire pré-rempli avec le compte, sans mot de passe', async () => {
    fauxBack(200, compte)
    afficher()

    await ouvrirLeFormulaire()

    expect(screen.getByLabelText('Prénom')).toHaveValue('Yassine')
    expect(screen.getByLabelText('Nom')).toHaveValue('Vitullo')
    expect(screen.getByLabelText('Adresse')).toHaveValue('12 rue des Tests')
    expect(screen.getByLabelText('Code postal')).toHaveValue('1000')
    expect(screen.getByLabelText('Ville')).toHaveValue('Bruxelles')
    expect(screen.getByLabelText('Pays')).toHaveValue('BE')
    expect(screen.getByLabelText('Email')).toHaveValue('yassine@mail.be')
    expect(screen.queryByLabelText(/Mot de passe/)).not.toBeInTheDocument()
    // Le focus clavier est placé dans le formulaire
    expect(screen.getByLabelText('Prénom')).toHaveFocus()
  })

  it('envoie un PUT, met à jour le compte partout et l’annonce', async () => {
    const faux = fauxBack(200, {
      ...compte,
      prenom: 'Marie',
      codePostal: '1050',
      ville: 'Ixelles',
    })
    afficher()
    const user = await ouvrirLeFormulaire()

    await remplacer(user, 'Prénom', 'Marie')
    // Nouveau code postal : la ville se choisit parmi les siennes
    await remplacer(user, 'Code postal', '1050')
    await user.selectOptions(
      screen.getByLabelText('Ville'),
      await screen.findByRole('option', { name: 'Ixelles' }),
    )
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Vos informations ont été enregistrées.',
    )

    // Le bon endpoint, en PUT, avec les sept champs et sans id
    const appel = faux.mock.calls.find(
      ([url, options]) => url === '/api/profil' && options?.method === 'PUT',
    )
    expect(appel).toBeDefined()
    expect(JSON.parse(appel![1]!.body as string)).toEqual({
      email: 'yassine@mail.be',
      nom: 'Vitullo',
      prenom: 'Marie',
      adresse: '12 rue des Tests',
      codePostal: '1050',
      ville: 'Ixelles',
      pays: 'BE',
    })

    // Les informations affichées sont celles renvoyées par le back...
    // (cherchées dans la liste des informations : le témoin du contexte
    // affiche aussi le prénom)
    const infos = within(document.querySelector('dl.profil-infos') as HTMLElement)
    expect(infos.getByText('Marie')).toBeInTheDocument()
    expect(infos.getByText('Ixelles')).toBeInTheDocument()
    // ...et le contexte, donc « Bienvenue, <prénom> », est à jour
    expect(screen.getByTestId('contexte')).toHaveTextContent('Marie')
    // Le focus revient sur le bouton qui a ouvert le formulaire
    expect(
      screen.getByRole('button', { name: 'Modifier mes informations' }),
    ).toHaveFocus()
  })

  it('affiche un message à côté de l’email s’il est pris par un autre compte (409)', async () => {
    fauxBack(409, { message: 'Un compte existe déjà avec cet email' })
    afficher()
    const user = await ouvrirLeFormulaire()

    await remplacer(user, 'Email', 'loic@mail.be')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Un compte existe déjà avec cet email',
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    // Rien n'a changé : le formulaire reste ouvert, le contexte intact
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeEnabled()
    expect(screen.getByTestId('contexte')).toHaveTextContent('Yassine')
  })

  it('affiche le message du back si un champ est refusé (400)', async () => {
    fauxBack(400, { message: 'La ville est obligatoire' })
    afficher()
    const user = await ouvrirLeFormulaire()

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La ville est obligatoire',
    )
  })

  it('invite à se reconnecter si la session a expiré (401)', async () => {
    fauxBack(401, { message: "Vous n'êtes pas connecté" })
    afficher()
    const user = await ouvrirLeFormulaire()

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Reconnectez-vous/)
  })

  it('affiche un message générique si le serveur ne répond pas', async () => {
    fauxBack(500, {})
    afficher()
    const user = await ouvrirLeFormulaire()

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible d’enregistrer vos informations',
    )
  })

  it('« Annuler » referme le formulaire sans rien envoyer', async () => {
    const faux = fauxBack(200, compte)
    afficher()
    const user = await ouvrirLeFormulaire()

    await remplacer(user, 'Prénom', 'Marie')
    await user.click(screen.getByRole('button', { name: 'Annuler' }))

    const infos = within(document.querySelector('dl.profil-infos') as HTMLElement)
    expect(infos.getByText('Yassine')).toBeInTheDocument()
    expect(screen.queryByLabelText('Prénom')).not.toBeInTheDocument()
    expect(
      faux.mock.calls.some(([, options]) => options?.method === 'PUT'),
    ).toBe(false)
  })

  it('ne présente aucun problème d’accessibilité, même avec une erreur', async () => {
    fauxBack(409, { message: 'Un compte existe déjà avec cet email' })
    const { container } = afficher()
    const user = await ouvrirLeFormulaire()

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))
    await screen.findByRole('alert')

    expect(await problemesAccessibilite(container)).toEqual([])
  })
})

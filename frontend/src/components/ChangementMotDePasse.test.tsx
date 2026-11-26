import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Profil from './Profil'
import { rendreAvecAuth } from '../test/rendre'
import { problemesAccessibilite } from '../test/accessibilite'

// Changer son mot de passe, depuis la page Profil.

const compte = {
  id: 7,
  email: 'yassine@mail.be',
  nom: 'Vitullo',
  prenom: 'Yassine',
  adresse: '12 rue des Tests',
  codePostal: '1000',
  ville: 'Bruxelles',
}

// Faux back : GET /api/profil répond le compte (appel de FournisseurAuth au
// démarrage), PUT /api/profil/mot-de-passe répond ce qu'on lui donne.
function fauxBack(statut: number, corps?: unknown) {
  const faux = vi.fn(async (url: string, options?: RequestInit) => {
    if (url === '/api/profil/mot-de-passe' && options?.method === 'PUT') {
      return new Response(corps === undefined ? null : JSON.stringify(corps), {
        status: statut,
      })
    }
    if (url === '/api/profil') {
      return new Response(JSON.stringify(compte), { status: 200 })
    }
    return new Response('{}', { status: 404 })
  })
  vi.stubGlobal('fetch', faux)
  return faux
}

const appelsChangement = (faux: ReturnType<typeof fauxBack>) =>
  faux.mock.calls.filter(([url]) => url === '/api/profil/mot-de-passe')

function afficher() {
  return rendreAvecAuth(
    <Profil
      onAccueil={vi.fn()}
      onDeconnexion={vi.fn().mockResolvedValue(undefined)}
      onConnexion={vi.fn()}
    />,
  )
}

async function ouvrirLeFormulaire() {
  const user = userEvent.setup()
  await user.click(
    await screen.findByRole('button', { name: 'Changer mon mot de passe' }),
  )
  return user
}

async function remplir(
  user: ReturnType<typeof userEvent.setup>,
  ancien: string,
  nouveau: string,
  confirmation: string,
) {
  await user.type(screen.getByLabelText('Mot de passe actuel'), ancien)
  await user.type(
    screen.getByLabelText('Nouveau mot de passe (8 caractères minimum)'),
    nouveau,
  )
  await user.type(screen.getByLabelText('Confirmer le nouveau mot de passe'), confirmation)
  await user.click(screen.getByRole('button', { name: 'Changer le mot de passe' }))
}

describe('Changement du mot de passe', () => {
  it('ouvre un formulaire à trois champs masqués, focus sur le premier', async () => {
    fauxBack(204)
    afficher()
    await ouvrirLeFormulaire()

    const ancien = screen.getByLabelText('Mot de passe actuel')
    expect(ancien).toHaveFocus()
    expect(ancien).toHaveAttribute('type', 'password')
    expect(
      screen.getByLabelText('Nouveau mot de passe (8 caractères minimum)'),
    ).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('Confirmer le nouveau mot de passe')).toHaveAttribute(
      'type',
      'password',
    )
  })

  it('envoie l’ancien et le nouveau mot de passe, puis l’annonce', async () => {
    const faux = fauxBack(204)
    afficher()
    const user = await ouvrirLeFormulaire()

    await remplir(user, 'motdepasse123', 'nouveauSecret9', 'nouveauSecret9')

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Votre mot de passe a été changé.',
    )
    const [, options] = appelsChangement(faux)[0] as unknown as [string, RequestInit]
    expect(options.method).toBe('PUT')
    // La confirmation reste dans le front : le back ne la reçoit pas
    expect(JSON.parse(options.body as string)).toEqual({
      ancienMotDePasse: 'motdepasse123',
      nouveauMotDePasse: 'nouveauSecret9',
    })
    // Formulaire refermé, focus rendu au bouton qui l'avait ouvert
    expect(screen.queryByLabelText('Mot de passe actuel')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Changer mon mot de passe' })).toHaveFocus()
  })

  it('refuse une confirmation différente sans rien envoyer', async () => {
    const faux = fauxBack(204)
    afficher()
    const user = await ouvrirLeFormulaire()

    await remplir(user, 'motdepasse123', 'nouveauSecret9', 'nouveauSecret8')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Les deux mots de passe ne sont pas identiques',
    )
    expect(screen.getByLabelText('Confirmer le nouveau mot de passe')).toHaveFocus()
    expect(appelsChangement(faux)).toHaveLength(0)
  })

  it('affiche le message du back si le mot de passe actuel est faux (400)', async () => {
    fauxBack(400, { message: 'Mot de passe actuel incorrect' })
    afficher()
    const user = await ouvrirLeFormulaire()

    await remplir(user, 'mauvais123', 'nouveauSecret9', 'nouveauSecret9')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Mot de passe actuel incorrect',
    )
    expect(screen.getByRole('button', { name: 'Changer le mot de passe' })).toBeEnabled()
  })

  it('invite à se reconnecter si la session a expiré (401)', async () => {
    fauxBack(401, { message: 'Vous n’êtes pas connecté' })
    afficher()
    const user = await ouvrirLeFormulaire()

    await remplir(user, 'motdepasse123', 'nouveauSecret9', 'nouveauSecret9')

    expect(await screen.findByRole('alert')).toHaveTextContent('Votre session a expiré')
  })

  it('« Annuler » referme le formulaire sans rien envoyer', async () => {
    const faux = fauxBack(204)
    afficher()
    const user = await ouvrirLeFormulaire()

    await user.click(screen.getByRole('button', { name: 'Annuler' }))

    expect(screen.queryByLabelText('Mot de passe actuel')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Changer mon mot de passe' })).toHaveFocus()
    expect(appelsChangement(faux)).toHaveLength(0)
  })

  it('ne présente aucun problème d’accessibilité, même avec une erreur', async () => {
    fauxBack(204)
    const { container } = afficher()
    const user = await ouvrirLeFormulaire()

    await remplir(user, 'motdepasse123', 'nouveauSecret9', 'autre')
    await screen.findByRole('alert')

    expect(await problemesAccessibilite(container)).toEqual([])
  })
})

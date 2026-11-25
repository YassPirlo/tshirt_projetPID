import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rendreApp } from './test/rendre'
import { classiques } from './test/donnees'
import { chemins } from './chemins'

// US4 et US5 — critère d'acceptation : « Une fois connecté, l'application
// affiche sur toutes les pages le message "Bienvenue, <prénom>" ».
//
// Toute l'application est affichée, avec un faux back.

const compte = {
  id: 7,
  email: 'yassine@mail.be',
  nom: 'Vitullo',
  prenom: 'Yassine',
}

// session : true si le cookie de session est encore valide au démarrage
// (cas d'un F5 alors qu'on était connecté).
// session : true si le cookie de session est encore valide au démarrage
// (cas d'un F5 alors qu'on était connecté).
// deconnexion : le code que renvoie /api/deconnexion (204 = réussi).
// Une déconnexion réussie ferme la session : /api/profil répond ensuite 401.
function demarrerFauxBack({
  session,
  deconnexion = 204,
}: {
  session: boolean
  deconnexion?: number
}) {
  let sessionOuverte = session
  const faux = vi.fn(async (url: string) => {
    if (url === '/api/profil') {
      return sessionOuverte
        ? new Response(JSON.stringify(compte), { status: 200 })
        : new Response('{}', { status: 401 })
    }
    if (url === '/api/connexion') {
      return new Response(JSON.stringify(compte), { status: 200 })
    }
    if (url === '/api/deconnexion') {
      if (deconnexion === 204) sessionOuverte = false
      return new Response(null, { status: deconnexion })
    }
    if (url === '/api/categories') {
      return new Response(JSON.stringify([classiques]), { status: 200 })
    }
    return new Response('{}', { status: 404 })
  })
  vi.stubGlobal('fetch', faux)
  return faux
}

// Le message est cherché dans l'en-tête (role banner), présent sur
// toutes les pages.
const entete = () => within(screen.getByRole('banner'))

describe('« Bienvenue, <prénom> » et « Créer un compte » dans l’en-tête (US4, US5)', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  it('n’apparaît pas pour un visiteur', async () => {
    demarrerFauxBack({ session: false })
    rendreApp('/')

    expect(
      await entete().findByRole('button', { name: 'Se connecter' }),
    ).toBeInTheDocument()
    expect(entete().queryByText(/Bienvenue/)).not.toBeInTheDocument()
  })

  // US5 : « l'inscription est possible depuis n'importe quelle page »
  it('propose « Créer un compte » à un visiteur, sur n’importe quelle page', async () => {
    demarrerFauxBack({ session: false })
    rendreApp('/mentions-legales')
    const utilisateur = userEvent.setup()

    await utilisateur.click(
      await entete().findByRole('button', { name: 'Créer un compte' }),
    )

    expect(window.location.pathname).toBe('/inscription')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Créer un compte' }),
    ).toBeInTheDocument()
  })

  it('ne propose plus « Créer un compte » à un membre connecté', async () => {
    demarrerFauxBack({ session: true })
    rendreApp('/')

    expect(await entete().findByText('Bienvenue, Yassine')).toBeInTheDocument()
    expect(
      entete().queryByRole('button', { name: 'Créer un compte' }),
    ).not.toBeInTheDocument()
  })

  it('apparaît juste après la connexion, puis sur les autres pages', async () => {
    demarrerFauxBack({ session: false })
    rendreApp('/connexion')
    const utilisateur = userEvent.setup()

    await utilisateur.type(await screen.findByLabelText('Email'), compte.email)
    await utilisateur.type(screen.getByLabelText('Mot de passe'), 'motdepasse123')
    await utilisateur.click(
      within(screen.getByRole('main')).getByRole('button', { name: 'Se connecter' }),
    )

    expect(await entete().findByText('Bienvenue, Yassine')).toBeInTheDocument()

    // Une autre page : l'en-tête, donc le message, est toujours là
    await utilisateur.click(screen.getByRole('button', { name: 'Mentions légales' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Mentions légales' }),
    ).toBeInTheDocument()
    expect(entete().getByText('Bienvenue, Yassine')).toBeInTheDocument()
  })

  it('réapparaît après un F5 tant que la session est valide', async () => {
    demarrerFauxBack({ session: true })
    rendreApp('/mentions-legales')

    expect(await entete().findByText('Bienvenue, Yassine')).toBeInTheDocument()
    expect(entete().getByRole('button', { name: 'Mon profil' })).toBeInTheDocument()
  })
})

describe('Bouton « Se déconnecter » (US7)', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  it('n’existe pas pour un visiteur', async () => {
    demarrerFauxBack({ session: false })
    rendreApp('/')

    await entete().findByRole('button', { name: 'Se connecter' })
    expect(
      entete().queryByRole('button', { name: 'Se déconnecter' }),
    ).not.toBeInTheDocument()
  })

  // Le piège du backlog : « déconnexion possible depuis n'importe quelle
  // page », donc depuis l'en-tête, pas seulement depuis le profil.
  it('déconnecte depuis l’en-tête, sur n’importe quelle page', async () => {
    const faux = demarrerFauxBack({ session: true })
    rendreApp('/mentions-legales')
    const utilisateur = userEvent.setup()

    await utilisateur.click(
      await entete().findByRole('button', { name: 'Se déconnecter' }),
    )

    // L'en-tête repasse en mode visiteur et on revient à l'accueil
    expect(
      await entete().findByRole('button', { name: 'Se connecter' }),
    ).toBeInTheDocument()
    expect(entete().queryByText(/Bienvenue/)).not.toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    expect(faux).toHaveBeenCalledWith(
      '/api/deconnexion',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('déconnecte aussi depuis la page profil', async () => {
    demarrerFauxBack({ session: true })
    rendreApp(chemins.profil)
    const utilisateur = userEvent.setup()

    await utilisateur.click(
      await within(screen.getByRole('main')).findByRole('button', {
        name: 'Se déconnecter',
      }),
    )

    expect(
      await entete().findByRole('button', { name: 'Se connecter' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('reste connecté et prévient si le serveur refuse', async () => {
    demarrerFauxBack({ session: true, deconnexion: 500 })
    rendreApp('/mentions-legales')
    const utilisateur = userEvent.setup()

    await utilisateur.click(
      await entete().findByRole('button', { name: 'Se déconnecter' }),
    )

    expect(await entete().findByRole('alert')).toBeInTheDocument()
    expect(entete().getByText('Bienvenue, Yassine')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/mentions-legales')
  })
})
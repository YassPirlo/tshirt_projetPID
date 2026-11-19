import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { rendreApp } from './test/rendre'
import { classiques } from './test/donnees'

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
function demarrerFauxBack({ session }: { session: boolean }) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url === '/api/profil') {
        return session
          ? new Response(JSON.stringify(compte), { status: 200 })
          : new Response('{}', { status: 401 })
      }
      if (url === '/api/connexion') {
        return new Response(JSON.stringify(compte), { status: 200 })
      }
      if (url === '/api/categories') {
        return new Response(JSON.stringify([classiques]), { status: 200 })
      }
      return new Response('{}', { status: 404 })
    }),
  )
}

// Le message est cherché dans l'en-tête (role banner), présent sur
// toutes les pages.
const entete = () => within(screen.getByRole('banner'))

describe('« Bienvenue, <prénom> » (US4, US5)', () => {
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

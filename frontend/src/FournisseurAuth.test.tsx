import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from './ContexteAuth'
import { rendreAvecAuth } from './test/rendre'

// Composant minimal qui affiche ce que le contexte expose
function Temoin() {
  const { utilisateur, chargement } = useAuth()
  if (chargement) return <p>Vérification…</p>
  return <p>{utilisateur ? utilisateur.prenom : 'Déconnecté'}</p>
}

const compte = {
  id: 1,
  email: 'yassine@mail.be',
  nom: 'Vitullo',
  prenom: 'Yassine',
}

describe('FournisseurAuth (socle US4 à US7)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('retrouve la session en cours au démarrage', async () => {
    // Le back répond 200 : le cookie de session est encore valide,
    // c'est le cas après un F5 alors qu'on était connecté.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(compte), { status: 200 })),
    )

    rendreAvecAuth(<Temoin />)

    expect(await screen.findByText('Yassine')).toBeInTheDocument()
  })

  it('reste déconnecté si le back répond 401, sans afficher d’erreur', async () => {
    const faux = vi.fn(async () => new Response('{}', { status: 401 }))
    vi.stubGlobal('fetch', faux)

    rendreAvecAuth(<Temoin />)

    expect(await screen.findByText('Déconnecté')).toBeInTheDocument()
    // 401 au démarrage est l'état normal d'un visiteur anonyme :
    // aucun message d'erreur ne doit apparaître.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(faux).toHaveBeenCalledWith(
      '/api/profil',
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('reste déconnecté si le back est injoignable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    rendreAvecAuth(<Temoin />)

    expect(await screen.findByText('Déconnecté')).toBeInTheDocument()
  })

  it('refuse useAuth en dehors du fournisseur', () => {
    // Sans ce garde-fou, un composant mal placé recevrait null et
    // planterait bien plus loin avec un message incompréhensible.
    const erreurs = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Temoin />)).toThrow(/FournisseurAuth/)

    erreurs.mockRestore()
  })
})

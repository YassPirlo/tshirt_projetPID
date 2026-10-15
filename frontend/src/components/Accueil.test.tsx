import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Accueil from './Accueil'
import { classiques, nouveautes, slim } from '../test/donnees'

describe('Accueil (US1)', () => {
  it('affiche une tuile par catégorie', () => {
    render(
      <Accueil
        categories={[nouveautes, classiques, slim]}
        chargement={false}
        erreur={null}
        onChoisir={vi.fn()}
      />,
    )

    for (const nom of ['Nouveautes', 'T-shirts classiques', 'T-shirts slim']) {
      expect(screen.getByRole('button', { name: nom })).toBeInTheDocument()
    }
  })

  it('prévient App quand on clique sur une catégorie', async () => {
    const onChoisir = vi.fn()
    render(
      <Accueil
        categories={[classiques, slim]}
        chargement={false}
        erreur={null}
        onChoisir={onChoisir}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'T-shirts slim' }))

    expect(onChoisir).toHaveBeenCalledWith(slim)
  })

  it('affiche le message d’erreur si les catégories ne chargent pas', () => {
    render(
      <Accueil
        categories={[]}
        chargement={false}
        erreur="Impossible de charger les catégories."
        onChoisir={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Impossible de charger les catégories.',
    )
  })
})

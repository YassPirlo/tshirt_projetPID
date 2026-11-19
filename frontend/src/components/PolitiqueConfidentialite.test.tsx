import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PolitiqueConfidentialite from './PolitiqueConfidentialite'

describe('PolitiqueConfidentialite', () => {
  it('liste les données enregistrées à la création d’un compte', () => {
    render(<PolitiqueConfidentialite onAccueil={vi.fn()} onCookies={vi.fn()} />)

    expect(screen.getByText(/Si vous créez un compte/)).toBeInTheDocument()
    expect(
      screen.getByText(/adresse e-mail, votre nom, votre prénom, votre mot de passe/),
    ).toBeInTheDocument()
  })

  // Le mot de passe est haché, pas chiffré : un chiffrement se déchiffre,
  // un hachage non. Écrire « chiffré » serait inexact.
  it('parle de hachage pour le mot de passe, jamais de chiffrement', () => {
    const { container } = render(
      <PolitiqueConfidentialite onAccueil={vi.fn()} onCookies={vi.fn()} />,
    )

    expect(container).toHaveTextContent(/hachage/)
    expect(container).not.toHaveTextContent(/chiffrée/)
  })
})

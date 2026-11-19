import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PolitiqueCookies from './PolitiqueCookies'
import { enregistrerConsentement } from '../consentement'

describe('PolitiqueCookies', () => {
  // Le tableau doit lister TOUT ce que le site dépose dans le navigateur :
  // un traceur absent de la liste est un manquement au RGPD.
  it('liste le choix sur les cookies et le cookie de session', () => {
    render(
      <PolitiqueCookies
        consentement={null}
        onAccueil={vi.fn()}
        onModifierChoix={vi.fn()}
      />,
    )

    const tableau = screen.getByRole('table')
    expect(within(tableau).getByText('JSESSIONID')).toBeInTheDocument()
    // Le nom affiché doit être exactement la clé réellement utilisée
    expect(within(tableau).getByText('face-consentement')).toBeInTheDocument()
  })

  // Garde-fou : si quelqu'un renomme la clé dans consentement.ts sans
  // mettre à jour le tableau, ce test échoue avec le précédent.
  it('enregistre le choix sous le nom affiché dans le tableau', () => {
    localStorage.clear()
    enregistrerConsentement(false)

    expect(Object.keys(localStorage)).toEqual(['face-consentement'])
  })
})

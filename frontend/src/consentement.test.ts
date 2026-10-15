import { beforeEach, describe, expect, it } from 'vitest'
import {
  aConsenti,
  DUREE_VALIDITE_JOURS,
  enregistrerConsentement,
  lireConsentement,
  VERSION_CONSENTEMENT,
} from './consentement'

const CLE = 'tshirtshop-consentement'
const unJour = 86_400_000

describe('consentement aux cookies', () => {
  beforeEach(() => localStorage.clear())

  it("ne renvoie rien tant que le visiteur n'a pas choisi", () => {
    expect(lireConsentement()).toBeNull()
  })

  it('pas de consentement par défaut pour la mesure d’audience', () => {
    expect(aConsenti('mesureAudience')).toBe(false)
  })

  it('enregistre un refus et le relit', () => {
    enregistrerConsentement(false)

    expect(lireConsentement()?.mesureAudience).toBe(false)
    expect(aConsenti('mesureAudience')).toBe(false)
  })

  it('enregistre une acceptation et le relit', () => {
    enregistrerConsentement(true)

    expect(lireConsentement()?.mesureAudience).toBe(true)
    expect(aConsenti('mesureAudience')).toBe(true)
  })

  it('redemande le choix après 13 mois', () => {
    const jour0 = new Date('2026-01-01T12:00:00Z')
    enregistrerConsentement(true, jour0)

    const encoreValide = new Date(
      jour0.getTime() + DUREE_VALIDITE_JOURS * unJour,
    )
    const expire = new Date(
      jour0.getTime() + (DUREE_VALIDITE_JOURS + 1) * unJour,
    )

    expect(lireConsentement(encoreValide)).not.toBeNull()
    expect(lireConsentement(expire)).toBeNull()
  })

  it('redemande le choix si la liste des traceurs a changé (nouvelle version)', () => {
    localStorage.setItem(
      CLE,
      JSON.stringify({
        mesureAudience: true,
        date: new Date().toISOString(),
        version: VERSION_CONSENTEMENT - 1,
      }),
    )

    expect(lireConsentement()).toBeNull()
  })

  it('redemande le choix si la valeur enregistrée est abîmée', () => {
    localStorage.setItem(CLE, 'pas du JSON')

    expect(lireConsentement()).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { evaluerMotDePasse } from './motDePasse'

describe('evaluerMotDePasse', () => {
  it.each([
    ['abcdefgh', 1, 'Faible'],
    ['Abcdefgh12', 2, 'Moyen'],
    ['Abcdefgh1234', 3, 'Bon'],
    ['Abcdefgh12!?', 4, 'Excellent'],
  ])('« %s » est noté %i (%s)', (motDePasse, score, libelle) => {
    expect(evaluerMotDePasse(motDePasse)).toMatchObject({ score, libelle })
  })

  it('note « très faible » un mot de passe de moins de 8 caractères', () => {
    const { score, conseils } = evaluerMotDePasse('Ab1!')
    expect(score).toBe(0)
    expect(conseils).toContain('Au moins 8 caractères')
  })

  // Les premiers essayés par un pirate, même avec une majuscule ou des
  // chiffres ajoutés à la fin
  it.each(['azerty123', 'Motdepasse2026', 'PASSWORD', '12345678'])(
    'note « très faible » le mot de passe courant « %s »',
    (motDePasse) => {
      const { score, conseils } = evaluerMotDePasse(motDePasse)
      expect(score).toBe(0)
      expect(conseils[0]).toMatch(/parmi les plus utilisés/)
    },
  )

  it('ne se laisse pas tromper par un mot de passe long mais répétitif', () => {
    expect(evaluerMotDePasse('abababababababababab').score).toBe(1)
  })

  it('donne des conseils pour ce qui manque', () => {
    expect(evaluerMotDePasse('abcdefgh').conseils).toEqual([
      'Utilisez au moins 12 caractères',
      'Ajoutez une majuscule',
      'Ajoutez un chiffre',
      'Ajoutez un symbole (! ? # …)',
    ])
    expect(evaluerMotDePasse('Abcdefgh12!?xyz').conseils).toEqual([])
  })
})

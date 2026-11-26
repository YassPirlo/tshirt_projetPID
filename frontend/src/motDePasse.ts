// Évalue la qualité d'un mot de passe pour la jauge (JaugeMotDePasse).
//
// C'est une AIDE pour l'utilisateur, pas une règle : le back n'exige que
// 8 à 72 caractères. On ne bloque pas un mot de passe « Moyen », on montre
// seulement comment l'améliorer.
//
// Le calcul se fait dans le navigateur : le mot de passe n'est envoyé
// nulle part pour être évalué.

export type Evaluation = {
  // 0 = très faible … 4 = excellent
  score: 0 | 1 | 2 | 3 | 4
  libelle: string
  conseils: string[]
}

const LIBELLES = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'] as const

// Mots de passe parmi les plus utilisés (listes publiées chaque année) :
// ce sont les premiers essayés par un pirate. Comparés sans tenir compte
// des majuscules ni des chiffres ajoutés à la fin (« Azerty2026 »).
const TROP_COURANTS = new Set([
  'motdepasse', 'password', 'passw0rd', 'azerty', 'azertyuiop', 'qwerty',
  'qwertyuiop', '123456', '1234567', '12345678', '123456789', '1234567890',
  '000000', '111111', 'abc123', 'iloveyou', 'jetaime', 'soleil', 'bonjour',
  'doudou', 'loulou', 'chouchou', 'marseille', 'chocolat', 'admin',
  'welcome', 'football', 'tshirt', 'face',
])

function estTropCourant(motDePasse: string): boolean {
  const minuscules = motDePasse.toLowerCase()
  const sansChiffresFinaux = minuscules.replace(/\d+$/, '')
  return TROP_COURANTS.has(minuscules) || TROP_COURANTS.has(sansChiffresFinaux)
}

export function evaluerMotDePasse(motDePasse: string): Evaluation {
  const conseils: string[] = []
  const minuscule = /[a-zà-ÿ]/.test(motDePasse)
  const majuscule = /[A-ZÀ-Ý]/.test(motDePasse)
  const chiffre = /\d/.test(motDePasse)
  const symbole = /[^a-zA-Zà-ÿÀ-Ý\d]/.test(motDePasse)
  const variete = [minuscule, majuscule, chiffre, symbole].filter(Boolean).length
  // « aaaaaaaa » ou « abababab » : long, mais très peu de caractères différents
  const repetitif = new Set(motDePasse).size <= 2

  if (motDePasse.length < 12) conseils.push('Utilisez au moins 12 caractères')
  if (!majuscule) conseils.push('Ajoutez une majuscule')
  if (!chiffre) conseils.push('Ajoutez un chiffre')
  if (!symbole) conseils.push('Ajoutez un symbole (! ? # …)')

  if (estTropCourant(motDePasse)) {
    return {
      score: 0,
      libelle: LIBELLES[0],
      conseils: ['Ce mot de passe est parmi les plus utilisés : choisissez-en un autre'],
    }
  }
  if (motDePasse.length < 8) {
    return { score: 0, libelle: LIBELLES[0], conseils: ['Au moins 8 caractères', ...conseils.slice(1)] }
  }

  let score = 1
  if (motDePasse.length >= 12) score++
  if (variete >= 3) score++
  if (variete === 4 || motDePasse.length >= 16) score++
  if (repetitif) score = 1

  const borne = Math.min(score, 4) as Evaluation['score']
  return { score: borne, libelle: LIBELLES[borne], conseils }
}

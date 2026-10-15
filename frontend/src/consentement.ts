// Choix du visiteur sur les cookies et traceurs, enregistré dans son
// navigateur (localStorage). Cet enregistrement est lui-même « strictement
// nécessaire » : il sert seulement à se souvenir du choix, il n'a donc pas
// besoin de consentement.
//
// Aujourd'hui le site n'utilise aucun traceur facultatif. La catégorie
// « mesure d'audience » est prête pour les statistiques (US15) : avant
// d'ajouter un outil de statistiques, vérifier aConsenti('mesureAudience').

export type Consentement = {
  mesureAudience: boolean
  date: string // date du choix, au format ISO
  version: number
}

const CLE = 'tshirtshop-consentement'

// À augmenter si la liste des traceurs change : le bandeau réapparaît
// et chacun refait son choix en connaissant les nouveaux traceurs
export const VERSION_CONSENTEMENT = 1

// Le choix est redemandé après 13 mois (durée maximale recommandée
// par les autorités de protection des données)
export const DUREE_VALIDITE_JOURS = 395

// Renvoie le choix enregistré, ou null s'il faut (re)demander :
// aucun choix, choix trop ancien, ancienne version ou stockage bloqué
export function lireConsentement(maintenant = new Date()): Consentement | null {
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return null

    const choix = JSON.parse(brut) as Consentement
    if (choix.version !== VERSION_CONSENTEMENT) return null

    const ageJours =
      (maintenant.getTime() - new Date(choix.date).getTime()) / 86_400_000
    if (!(ageJours >= 0 && ageJours <= DUREE_VALIDITE_JOURS)) return null

    return choix
  } catch {
    // navigation privée, stockage désactivé, valeur abîmée : on redemande
    return null
  }
}

export function enregistrerConsentement(
  mesureAudience: boolean,
  maintenant = new Date(),
): Consentement {
  const choix: Consentement = {
    mesureAudience,
    date: maintenant.toISOString(),
    version: VERSION_CONSENTEMENT,
  }
  try {
    localStorage.setItem(CLE, JSON.stringify(choix))
  } catch {
    // stockage impossible : le choix vaut pour cette visite seulement
  }
  return choix
}

// Pour le futur code de statistiques : true seulement si le visiteur
// a accepté. Sans choix, c'est non (pas de consentement par défaut).
export function aConsenti(categorie: 'mesureAudience'): boolean {
  return lireConsentement()?.[categorie] === true
}

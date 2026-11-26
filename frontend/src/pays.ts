// Pays proposés dans les formulaires d'adresse (inscription, profil).
// Seule la Belgique pour l'instant : le back ne sait vérifier les codes
// postaux que pour elle (table localite). Pour ajouter un pays, il faut
// d'abord sa liste de codes postaux côté back.
export const PAYS = [{ code: 'BE', nom: 'Belgique' }] as const

export const PAYS_PAR_DEFAUT = 'BE'

export function nomDuPays(code: string): string {
  return PAYS.find((pays) => pays.code === code)?.nom ?? code
}

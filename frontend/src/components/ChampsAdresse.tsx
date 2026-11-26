// Pays, code postal et ville, vérifiés : utilisés par l'inscription (US5)
// et la modification du profil (US6).
//
// Le code postal doit exister en Belgique, et la ville se CHOISIT dans la
// liste des localités de ce code (un code peut en couvrir plusieurs :
// 4000 = Glain, Liège, Rocourt). On ne peut donc pas taper une ville qui
// ne correspond pas. Le back revérifie le tout à l'envoi.
//
// La liste vient de GET /api/localites, appelé dès que 4 chiffres sont
// tapés. Elle est rangée avec le code demandé : si le code change pendant
// l'appel, une ancienne réponse ne s'affiche pas pour le nouveau code.

import { useEffect, useState } from 'react'
import { getLocalites } from '../api'
import { PAYS } from '../pays'

type Props = {
  pays: string
  codePostal: string
  ville: string
  onPays: (pays: string) => void
  onCodePostal: (codePostal: string) => void
  onVille: (ville: string) => void
}

type Resultat = { code: string; localites: string[] | null }

const CODE_COMPLET = /^\d{4}$/

function ChampsAdresse({ pays, codePostal, ville, onPays, onCodePostal, onVille }: Props) {
  const [resultat, setResultat] = useState<Resultat | null>(null)
  const code = codePostal.trim()
  const codeComplet = CODE_COMPLET.test(code)

  useEffect(() => {
    if (!codeComplet) return
    const controleur = new AbortController()
    getLocalites(code, controleur.signal)
      .then((localites) => {
        setResultat({ code, localites })
        // Une seule ville possible : on la choisit pour l'utilisateur.
        // Une ville qui n'est pas dans la liste (ancien profil) est vidée.
        if (localites.length === 1) onVille(localites[0])
        else if (!localites.includes(ville)) onVille('')
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setResultat({ code, localites: null })
      })
    return () => controleur.abort()
    // On ne relance l'appel que si le code change : pas à chaque ville
    // choisie, ni quand le parent recrée onVille.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, codeComplet])

  // Le résultat ne vaut que pour le code affiché
  const actuel = codeComplet && resultat?.code === code ? resultat : null
  const localites = actuel?.localites ?? []
  const codeInconnu = actuel !== null && actuel.localites !== null && localites.length === 0
  const erreurReseau = actuel !== null && actuel.localites === null

  let aideVille = 'Tapez d’abord un code postal à 4 chiffres.'
  if (codeComplet && !actuel) aideVille = 'Recherche des villes…'
  if (codeInconnu || erreurReseau) aideVille = 'Corrigez d’abord le code postal.'
  if (localites.length > 1) aideVille = 'Plusieurs localités ont ce code : choisissez la vôtre.'

  return (
    <>
      <label>
        Pays
        <select name="pays" autoComplete="country" required value={pays} onChange={(e) => onPays(e.target.value)}>
          {PAYS.map((p) => (
            <option key={p.code} value={p.code}>
              {p.nom}
            </option>
          ))}
        </select>
      </label>
      <p className="aide-champ">Seule la Belgique est disponible pour l’instant.</p>

      <label>
        Code postal
        <input
          type="text"
          name="codePostal"
          autoComplete="postal-code"
          inputMode="numeric"
          required
          maxLength={4}
          pattern="\d{4}"
          title="4 chiffres"
          value={codePostal}
          onChange={(e) => {
            onCodePostal(e.target.value)
            // Nouveau code : l'ancienne ville ne lui correspond plus
            onVille('')
          }}
          aria-invalid={codeInconnu ? true : undefined}
          aria-describedby={codeInconnu || erreurReseau ? 'erreur-code-postal' : undefined}
        />
      </label>
      {codeInconnu && (
        <p id="erreur-code-postal" className="message message--erreur" role="alert">
          Ce code postal n’existe pas en Belgique
        </p>
      )}
      {erreurReseau && (
        <p id="erreur-code-postal" className="message message--erreur" role="alert">
          Impossible de vérifier le code postal pour l’instant. Réessayez plus tard.
        </p>
      )}

      <label>
        Ville
        <select
          name="ville"
          autoComplete="address-level2"
          required
          disabled={localites.length === 0}
          value={localites.includes(ville) ? ville : ''}
          onChange={(e) => onVille(e.target.value)}
          aria-describedby={localites.length !== 1 ? 'aide-ville' : undefined}
        >
          <option value="">{localites.length > 0 ? 'Choisissez votre ville' : '—'}</option>
          {localites.map((localite) => (
            <option key={localite} value={localite}>
              {localite}
            </option>
          ))}
        </select>
      </label>
      {localites.length !== 1 && (
        <p id="aide-ville" className="aide-champ">
          {aideVille}
        </p>
      )}
    </>
  )
}

export default ChampsAdresse

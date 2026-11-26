// Jauge de sécurité du mot de passe, affichée sous le champ pendant la
// saisie (inscription, changement de mot de passe).
//
// Accessibilité :
//  - role="meter" avec une valeur et un texte (« Moyen ») : un lecteur
//    d'écran lit le niveau, pas seulement une barre de couleur ;
//  - la couleur n'est jamais la seule information : le niveau est écrit ;
//  - aria-live="polite" : le nouveau niveau est annoncé quand il change,
//    sans interrompre la saisie.

import { evaluerMotDePasse } from '../motDePasse'

type Props = {
  motDePasse: string
  // id de la jauge, pour que le champ y renvoie avec aria-describedby
  // (seulement quand le champ n'est pas vide : la jauge est alors affichée)
  id: string
}

function JaugeMotDePasse({ motDePasse, id }: Props) {
  // Rien tant que le champ est vide : pas de « Très faible » en rouge
  // avant même d'avoir commencé à taper.
  if (!motDePasse) return null

  const { score, libelle, conseils } = evaluerMotDePasse(motDePasse)

  return (
    <div id={id} className={`jauge jauge--${score}`}>
      <div
        className="jauge-barre"
        role="meter"
        aria-label="Sécurité du mot de passe"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={libelle}
      >
        <div className="jauge-remplissage" style={{ width: `${(score + 1) * 20}%` }} />
      </div>
      <p className="jauge-texte" aria-live="polite">
        Sécurité : <strong>{libelle}</strong>
      </p>
      {conseils.length > 0 && (
        <ul className="jauge-conseils">
          {conseils.map((conseil) => (
            <li key={conseil}>{conseil}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default JaugeMotDePasse

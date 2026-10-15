// Outil commun aux tests d'accessibilité : lance axe (la bibliothèque de
// référence pour vérifier les règles WCAG) sur une partie de la page et
// renvoie la liste des problèmes trouvés, lisible en français dans le test.
import axe from 'axe-core'

type Options = {
  // false pour un composant testé seul, qui n'est pas dans <main>,
  // <header>… : la règle « tout le contenu est dans une zone » ne
  // s'applique qu'à la page entière
  pageEntiere?: boolean
}

export async function problemesAccessibilite(
  conteneur: Element,
  { pageEntiere = false }: Options = {},
): Promise<string[]> {
  const resultat = await axe.run(conteneur, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
    },
    rules: {
      // jsdom ne calcule pas les couleurs affichées : les contrastes sont
      // vérifiés à part, dans contraste.test.ts
      'color-contrast': { enabled: false },
      region: { enabled: pageEntiere },
    },
  })

  return resultat.violations.map(
    (v) =>
      `${v.id} : ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
  )
}

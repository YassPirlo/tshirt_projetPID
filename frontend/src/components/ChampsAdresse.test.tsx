import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import ChampsAdresse from './ChampsAdresse'
import { problemesAccessibilite } from '../test/accessibilite'

// Faux GET /api/localites
const LOCALITES: Record<string, string[]> = {
  '4000': ['Glain', 'Liège', 'Rocourt'],
  '5000': ['Namur'],
}

function fauxBack(enPanne = false) {
  const faux = vi.fn(async (url: string) => {
    if (enPanne) throw new TypeError('Failed to fetch')
    const code = new URL(url, 'http://test').searchParams.get('codePostal') ?? ''
    return new Response(JSON.stringify(LOCALITES[code] ?? []), { status: 200 })
  })
  vi.stubGlobal('fetch', faux)
  return faux
}

// Le formulaire parent garde les valeurs, comme Inscription
function Formulaire({ villeInitiale = '', codeInitial = '' }) {
  const [pays, setPays] = useState('BE')
  const [codePostal, setCodePostal] = useState(codeInitial)
  const [ville, setVille] = useState(villeInitiale)
  return (
    <form className="formulaire" aria-label="Adresse">
      <ChampsAdresse
        pays={pays}
        codePostal={codePostal}
        ville={ville}
        onPays={setPays}
        onCodePostal={setCodePostal}
        onVille={setVille}
      />
      <output data-testid="ville">{ville}</output>
    </form>
  )
}

describe('ChampsAdresse', () => {
  it('propose la Belgique comme pays', () => {
    fauxBack()
    render(<Formulaire />)

    expect(screen.getByLabelText('Pays')).toHaveValue('BE')
    expect(screen.getByRole('option', { name: 'Belgique' })).toBeInTheDocument()
  })

  it('n’autorise le choix de la ville qu’après un code postal valide', () => {
    const faux = fauxBack()
    render(<Formulaire />)

    expect(screen.getByLabelText('Ville')).toBeDisabled()
    expect(faux).not.toHaveBeenCalled()
  })

  it('propose les localités du code postal tapé', async () => {
    const faux = fauxBack()
    const user = userEvent.setup()
    render(<Formulaire />)

    await user.type(screen.getByLabelText('Code postal'), '4000')

    expect(await screen.findByRole('option', { name: 'Liège' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Glain' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Rocourt' })).toBeInTheDocument()
    expect(screen.getByLabelText('Ville')).toBeEnabled()
    expect(screen.getByText(/Plusieurs localités ont ce code/)).toBeInTheDocument()
    // Un seul appel, quand le code est complet
    expect(faux).toHaveBeenCalledOnce()
    expect(faux.mock.calls[0][0]).toBe('/api/localites?codePostal=4000')

    await user.selectOptions(screen.getByLabelText('Ville'), 'Liège')
    expect(screen.getByTestId('ville')).toHaveTextContent('Liège')
  })

  it('choisit la ville toute seule quand le code n’en a qu’une', async () => {
    fauxBack()
    const user = userEvent.setup()
    render(<Formulaire />)

    await user.type(screen.getByLabelText('Code postal'), '5000')

    expect(await screen.findByTestId('ville')).toHaveTextContent('Namur')
    expect(screen.getByLabelText('Ville')).toHaveValue('Namur')
  })

  it('signale un code postal qui n’existe pas', async () => {
    fauxBack()
    const user = userEvent.setup()
    render(<Formulaire />)

    await user.type(screen.getByLabelText('Code postal'), '9999')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ce code postal n’existe pas en Belgique',
    )
    expect(screen.getByLabelText('Code postal')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Ville')).toBeDisabled()
  })

  it('vide la ville quand on change de code postal', async () => {
    fauxBack()
    const user = userEvent.setup()
    render(<Formulaire codeInitial="5000" villeInitiale="Namur" />)
    await screen.findByRole('option', { name: 'Namur' })

    await user.clear(screen.getByLabelText('Code postal'))
    await user.type(screen.getByLabelText('Code postal'), '4000')

    await screen.findByRole('option', { name: 'Liège' })
    expect(screen.getByTestId('ville')).toBeEmptyDOMElement()
  })

  it('prévient si les villes ne peuvent pas être chargées', async () => {
    fauxBack(true)
    const user = userEvent.setup()
    render(<Formulaire />)

    await user.type(screen.getByLabelText('Code postal'), '4000')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de vérifier le code postal',
    )
  })

  it('ne présente aucun problème d’accessibilité, même avec une erreur', async () => {
    fauxBack()
    const user = userEvent.setup()
    const { container } = render(<Formulaire />)

    await user.type(screen.getByLabelText('Code postal'), '9999')
    await screen.findByRole('alert')

    expect(await problemesAccessibilite(container)).toEqual([])
  })
})

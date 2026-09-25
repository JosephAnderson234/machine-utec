import { Fragment, useState } from 'react';
import { Slider, Stat } from '../ui/Plot';
import Tex from '../ui/Tex';

const COLORS = ['var(--pg-c1)', 'var(--pg-c2)', 'var(--pg-c3)'];
const NAMES = ['gato', 'perro', 'ave'];

/** Softmax: logits → probabilidades, cross-entropy con one-hot y gradiente p − y. */
export default function Softmax() {
	const [z, setZ] = useState([2, 1, -0.5]);
	const [T, setT] = useState(1);
	const [yTrue, setYTrue] = useState(0);
	const ez = z.map((v) => Math.exp(v / T));
	const S = ez.reduce((a, b) => a + b, 0);
	const p = ez.map((v) => v / S);
	const ce = -Math.log(p[yTrue]);
	const pred = p.indexOf(Math.max(...p));

	return (
		<div className="pg not-content">
			<h4>Softmax: un score por clase</h4>
			<p className="pg-sub">
				Cada clase tiene su propio score lineal <Tex>{'z_k=\\mathbf{w}_k^\\top\\mathbf{x}+b_k'}</Tex>. La softmax los exponencia y normaliza para que sumen 1. Cambia los logits y la temperatura.
			</p>
			<div className="pg-row">
				{z.map((v, k) => (
					<Slider key={k} label={`logit z (${NAMES[k]})`} value={v} min={-4} max={4} step={0.1} onChange={(nv) => setZ(z.map((u, j) => (j === k ? nv : u)))} />
				))}
			</div>
			<div className="pg-row">
				<Slider label="temperatura T" value={T} min={0.2} max={5} step={0.1} onChange={setT} />
				<label className="pg-field">
					<span>clase verdadera (one-hot)</span>
					<select value={yTrue} onChange={(e) => setYTrue(Number(e.target.value))}>
						{NAMES.map((n, k) => <option key={k} value={k}>{n}</option>)}
					</select>
				</label>
			</div>
			<div style={{ display: 'grid', gridTemplateColumns: '4rem 1fr 4rem 5.5rem', gap: '0.5rem 0.8rem', alignItems: 'center', fontSize: '0.85rem' }}>
				<span style={{ color: 'var(--pg-muted)' }}>clase</span>
				<span style={{ color: 'var(--pg-muted)' }}>probabilidad p_k</span>
				<span style={{ color: 'var(--pg-muted)' }}>p_k</span>
				<span style={{ color: 'var(--pg-muted)' }}>∂ℓ/∂z_k = p−y</span>
				{p.map((pk, k) => (
					<Fragment key={k}>
						<span key={`n${k}`} style={{ fontWeight: k === pred ? 700 : 400, color: 'var(--sl-color-white)' }}>{NAMES[k]}</span>
						<div key={`b${k}`} className="bar-h" style={{ height: '1rem' }}>
							<i style={{ width: `${100 * pk}%`, background: COLORS[k] }} />
						</div>
						<span key={`v${k}`} className="mono">{pk.toFixed(3)}</span>
						<span key={`g${k}`} className="mono" style={{ color: k === yTrue ? 'var(--pg-bad)' : 'var(--pg-muted)' }}>{(pk - (k === yTrue ? 1 : 0)).toFixed(3)}</span>
					</Fragment>
				))}
			</div>
			<div className="pg-stats">
				<Stat k="predicción arg max" v={NAMES[pred]} />
				<Stat k="Σ p_k" v={p.reduce((a, b) => a + b, 0).toFixed(3)} />
				<Stat k="cross-entropy −log p_y" v={ce.toFixed(3)} color="var(--sl-color-accent)" />
			</div>
			<div className="formula">
				<Tex block>{`p_k=\\frac{e^{z_k/T}}{\\sum_j e^{z_j/T}}\\qquad \\ell = -\\sum_k y_k\\log p_k = -\\log p_{\\text{${NAMES[yTrue]}}} = ${ce.toFixed(3)}`}</Tex>
			</div>
			<div className="pg-note">
				Suma la misma constante a los tres logits: las probabilidades <b>no cambian</b> (solo importan las diferencias). Con 2 clases, softmax se reduce exactamente a la sigmoide de <Tex>{'z_1-z_0'}</Tex>. El gradiente vuelve a ser <b>p − y</b>, la misma forma «residual» de la regresión lineal y la logística.
			</div>
		</div>
	);
}

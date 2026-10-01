import { useState } from 'react';
import { Slider, Stat } from '../ui/Plot';

const fmtBig = (v: number) => (v < 1e6 ? v.toLocaleString('es-PE') : v.toExponential(2).replace('e+', ' × 10^'));

/** La maldición de la conjunta: parámetros de p(x | y) completa vs Naive Bayes, con d features binarias. */
export default function CurseJoint() {
	const [d, setD] = useState(20);
	const joint = Math.pow(2, d) - 1;
	const nb = d;
	const lj = Math.log10(joint + 1),
		ln = Math.log10(nb + 1);
	return (
		<div className="pg not-content">
			<h4>¿Por qué hace falta ser «naive»?</h4>
			<p className="pg-sub">Con d palabras (presente/ausente), la distribución conjunta p(x | y) tiene una probabilidad por cada combinación posible. Naive Bayes solo necesita una por palabra.</p>
			<Slider label="d (nº de features binarias)" value={d} min={1} max={60} step={1} onChange={setD} />
			<div className="kv" style={{ gridTemplateColumns: '11rem 1fr 7rem', alignItems: 'center' }}>
				<span>conjunta completa</span>
				<div className="bar-h">
					<i style={{ width: `${(100 * lj) / 18.1}%`, background: 'var(--pg-bad)' }} />
				</div>
				<span>{fmtBig(joint)}</span>
				<span>Naive Bayes</span>
				<div className="bar-h">
					<i style={{ width: `${Math.max(1, (100 * ln) / 18.1)}%`, background: 'var(--pg-ok)' }} />
				</div>
				<span>{nb}</span>
			</div>
			<p className="pg-sub" style={{ marginTop: 0 }}>(barras en escala logarítmica, por clase)</p>
			<div className="pg-stats">
				<Stat k="parámetros por clase (conjunta)" v={fmtBig(joint)} color="var(--pg-bad)" />
				<Stat k="parámetros por clase (NB)" v={nb} color="var(--pg-ok)" />
			</div>
			<div className="pg-note warn">
				Con d = {d}, estimar la conjunta exigiría ver cada una de las {fmtBig(joint + 1)} combinaciones varias veces: imposible (un vocabulario real tiene miles de palabras). Suponer independencia condicional cambia un crecimiento <b>exponencial</b> (2ᵈ) por uno <b>lineal</b> (d). Es falso, pero hace el problema estimable: un ejemplo puro de cambiar sesgo por varianza.
			</div>
		</div>
	);
}

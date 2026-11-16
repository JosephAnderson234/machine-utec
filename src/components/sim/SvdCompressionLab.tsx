import { useState } from 'react';
import { Slider, Stat, CA, C0 } from '../ui/Plot';

export default function SvdCompressionLab() {
	const [k, setK] = useState(1), [step, setStep] = useState(0);
	const sig = [4, 2], lam = sig.map(v => v * v / 4);
	return <div className="pg not-content">
		<h4>La SVD comprime al conservar solo las primeras direcciones</h4>
		<p className="pg-sub">En los cuatro puntos de la sesión 11a, los valores singulares son 4 y 2. La altura representa cuánta varianza aporta cada dirección.</p>
		<Slider label="componentes conservadas, k" value={k} min={1} max={2} step={1} onChange={setK} />
		<div className="pg-row"><button onClick={() => setStep(Math.min(2, step + 1))}>Siguiente</button><button onClick={() => { setStep(0); setK(1); }}>Reiniciar</button></div>
		<svg viewBox="0 0 440 145" role="img" aria-label="Varianza conservada y descartada por componente" style={{ width: '100%', maxWidth: 440 }}>
			{lam.map((v, i) => <g key={i}><rect x={70 + i * 160} y={125 - v * 22} width={95} height={v * 22} rx={5} fill={i < k ? CA : C0} opacity={i < k ? 1 : .35} /><text x={117 + i * 160} y={138} textAnchor="middle" fill="currentColor" fontSize="13">PC{i + 1}: λ={v}</text></g>)}
		</svg>
		<div className="pg-stats"><Stat k="varianza conservada" v={`${(lam.slice(0, k).reduce((a, b) => a + b, 0) / 5 * 100).toFixed(0)} %`} /><Stat k="error de reconstrucción" v={lam.slice(k).reduce((a, b) => a + b, 0).toFixed(0)} /></div>
		<p className="pg-note">{['1. Centrar X: media (5,3).', '2. Factorizar X centrada = UΣVᵀ; σ = (4,2).', '3. Conservar k direcciones; lo descartado es el error.'][step]}</p>
	</div>;
}

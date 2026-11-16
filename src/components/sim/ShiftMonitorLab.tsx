import { useState } from 'react';
import { Slider, Stat, C0, C1 } from '../ui/Plot';

export default function ShiftMonitorLab() {
	const [today, setToday] = useState(30), [step, setStep] = useState(0);
	const q = today / 100, p = .5;
	const psi = (q - p) * Math.log(q / p) + ((1 - q) - p) * Math.log((1 - q) / p);
	return <div className="pg not-content"><h4>PSI: compara la mezcla de hoy con la anterior</h4>
		<p className="pg-sub">Dos intervalos. Antes había 50 % en cada uno; mueve la proporción del primero hoy.</p>
		<Slider label="primer intervalo hoy" value={today} min={1} max={99} step={1} onChange={setToday} show={`${today} %`} />
		<div className="pg-row"><button onClick={() => setStep(Math.min(2, step + 1))}>Siguiente</button><button onClick={() => { setStep(0); setToday(30); }}>Reiniciar</button></div>
		<svg viewBox="0 0 440 125" role="img" aria-label="Comparación de proporciones antes y hoy" style={{ width: '100%', maxWidth: 440 }}>
			<text x="4" y="35" fill="currentColor">antes</text><rect x="80" y="18" width="150" height="25" fill={C0} /><rect x="230" y="18" width="150" height="25" fill={C1} />
			<text x="4" y="85" fill="currentColor">hoy</text><rect x="80" y="68" width={300 * q} height="25" fill={C0} /><rect x={80 + 300 * q} y="68" width={300 * (1 - q)} height="25" fill={C1} />
		</svg>
		<div className="pg-stats"><Stat k="PSI" v={psi.toFixed(3)} /><Stat k="primer intervalo" v={`${today} %`} /></div>
		<p className="pg-note">{['1. Compara proporciones por intervalo.', '2. En cada intervalo calcula (hoy − antes) × ln(hoy/antes).', '3. Suma aportes; calibra la alarma con lotes sanos del mismo tamaño.'][step]} Un PSI alto indica cambio, no prueba caída de accuracy.</p>
	</div>;
}

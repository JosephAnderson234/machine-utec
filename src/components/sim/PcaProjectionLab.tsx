import { useState } from 'react';
import Plot, { C0, C1, CA, Slider, Stat } from '../ui/Plot';

const X: [number, number][] = [[2, 2], [-2, -2], [1, -1], [-1, 1]];
export default function PcaProjectionLab() {
	const [deg, setDeg] = useState(0);
	const [step, setStep] = useState(0);
	const a = deg * Math.PI / 180, u: [number, number] = [Math.cos(a), Math.sin(a)];
	const z = X.map(([x, y]) => x * u[0] + y * u[1]);
	const projected: [number, number][] = z.map(v => [v * u[0], v * u[1]]);
	const kept = z.reduce((s, v) => s + v * v, 0) / 4;
	return <div className="pg not-content">
		<h4>PCA: gira una recta y deja caer los cuatro puntos</h4>
		<p className="pg-sub">Datos centrados del cuaderno 11a. La dirección de 45° conserva la mayor dispersión; las líneas punteadas son lo que se pierde.</p>
		<Slider label="ángulo" value={deg} min={0} max={180} step={1} onChange={setDeg} show={`${deg}°`} />
		<div className="pg-row"><button onClick={() => setStep(Math.min(2, step + 1))}>Siguiente</button><button onClick={() => { setStep(0); setDeg(0); }}>Reiniciar</button></div>
		<Plot x={[-3, 3]} y={[-3, 3]} h={310} xlabel="x₁ centrada" ylabel="x₂ centrada" ariaLabel="Proyección sobre una dirección variable">{s => <>
			{step > 0 && <line x1={s.X(-3 * u[0])} y1={s.Y(-3 * u[1])} x2={s.X(3 * u[0])} y2={s.Y(3 * u[1])} stroke={CA} strokeWidth={2} />}
			{X.map(([x, y], i) => <g key={i}>{step > 1 && <><line x1={s.X(x)} y1={s.Y(y)} x2={s.X(projected[i][0])} y2={s.Y(projected[i][1])} stroke={C1} strokeDasharray="4 3" /><circle cx={s.X(projected[i][0])} cy={s.Y(projected[i][1])} r={4} fill={CA} /></>}<circle cx={s.X(x)} cy={s.Y(y)} r={6} fill={C0} /></g>)}
		</>}</Plot>
		<div className="pg-stats"><Stat k="varianza conservada" v={kept.toFixed(3)} /><Stat k="error cuadrático medio perdido" v={(5 - kept).toFixed(3)} /><Stat k="suma" v="5" /></div>
		<p className="pg-note">Paso {step + 1}/3: {['observa los puntos centrados', 'gira el eje candidato', 'cada punto proyecta y deja un residuo perpendicular'][step]}.</p>
	</div>;
}

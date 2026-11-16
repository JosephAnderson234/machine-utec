import { useState } from 'react';
import { Slider, Stat } from '../ui/Plot';

const fact = (n: number) => { let x = 1; for (let i = 2; i <= n; i++) x *= i; return x; };
export default function ReleaseGateLab() {
	const [fixed, setFixed] = useState(9), [broken, setBroken] = useState(4), [step, setStep] = useState(0);
	const n = fixed + broken;
	const p = n ? Math.min(1, 2 * Array.from({ length: Math.min(fixed, broken) + 1 }, (_, i) => fact(n) / fact(i) / fact(n - i)).reduce((a, b) => a + b, 0) / 2 ** n) : 1;
	return <div className="pg not-content"><h4>¿Cinco aciertos más justifican lanzar?</h4>
		<p className="pg-sub">Cuenta solo formularios donde los modelos discrepan. Si ambos aciertan o ambos fallan, ese formulario no informa qué versión gana.</p>
		<div className="pg-row"><Slider label="arregla" value={fixed} min={0} max={20} step={1} onChange={setFixed} /><Slider label="estropea" value={broken} min={0} max={20} step={1} onChange={setBroken} /></div>
		<div className="pg-row"><button onClick={() => setStep(Math.min(2, step + 1))}>Siguiente</button><button onClick={() => { setFixed(9); setBroken(4); setStep(0); }}>Reiniciar</button></div>
		<div className="pg-stats"><Stat k="mejora neta" v={fixed - broken} /><Stat k="casos discordantes" v={n} /><Stat k="p exacta bilateral" v={p.toFixed(3)} /></div>
		<p className="pg-note">{['1. Cuenta arreglados y estropeados.', '2. Bajo empate, cada caso discordante favorece a cada modelo con probabilidad 1/2.', '3. Suma las colas binomiales: p pequeña aporta evidencia; fija el umbral antes de mirar.'][step]} Con 9 frente a 4, p ≈ 0.267: +5 puede ser azar.</p>
	</div>;
}

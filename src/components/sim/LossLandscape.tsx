import { useState } from 'react';
import Plot, { Path, CA, CR, Slider, Stat, Legend } from '../ui/Plot';
import { range, sigmoid } from '../ui/math';

// datos 1-D con un punto «difícil»: el modelo es p = σ(w·x), sin sesgo
const DATA: [number, number][] = [
	[-2, 0], [-1.2, 0], [-0.5, 0], [0.4, 1], [1.1, 1], [2.2, 1], [-3, 1],
];

// log(1 + e^t) estable: así −log σ(z) = softplus(−z) no se satura numéricamente
const softplus = (t: number) => Math.max(t, 0) + Math.log1p(Math.exp(-Math.abs(t)));
const ce = (w: number) => DATA.reduce((s, [x, y]) => s + (y ? softplus(-w * x) : softplus(w * x)), 0) / DATA.length;
const mse = (w: number) => DATA.reduce((s, [x, y]) => s + (sigmoid(w * x) - y) ** 2, 0) / DATA.length;

/** Superficie de pérdida en un peso: cross-entropy (un valle) vs error² sobre la sigmoide (meseta). */
export default function LossLandscape() {
	const [w0, setW0] = useState(-6);
	const ws = range(-10, 10, 400);
	const run = (loss: (w: number) => number) => {
		let w = w0;
		const path = [w];
		for (let i = 0; i < 60; i++) {
			const h = 1e-4;
			const g = (loss(w + h) - loss(w - h)) / (2 * h);
			w -= 1.5 * g;
			path.push(w);
		}
		return path;
	};
	const pCE = run(ce),
		pMS = run(mse);
	const ceMax = Math.max(...ws.map(ce));
	const msMax = Math.max(...ws.map(mse));

	return (
		<div className="pg not-content">
			<h4>¿Por qué no error cuadrático? Mira la superficie</h4>
			<p className="pg-sub">Modelo p = σ(w·x) con un solo peso, sobre 7 puntos (uno de ellos está «del lado equivocado»). Las dos curvas están normalizadas para compararlas. Desde un mal inicio, se hacen 60 pasos de descenso de gradiente con la misma tasa.</p>
			<Slider label="peso inicial w₀" value={w0} min={-10} max={10} step={0.5} onChange={setW0} />
			<Plot x={[-10, 10]} y={[0, 1.05]} h={300} xlabel="peso w" ylabel="pérdida (normalizada)" yticks={[]}>
				{(s) => (
					<>
						<Path pts={ws.map((w) => [w, ce(w) / ceMax])} s={s} color={CA} width={2.6} />
						<Path pts={ws.map((w) => [w, mse(w) / msMax])} s={s} color={CR} width={2.4} dash="6 4" />
						{pCE.map((w, i) => <circle key={`c${i}`} cx={s.X(w)} cy={s.Y(ce(w) / ceMax)} r={i === pCE.length - 1 ? 6 : 2.4} fill={CA} />)}
						{pMS.map((w, i) => <circle key={`m${i}`} cx={s.X(w)} cy={s.Y(mse(w) / msMax)} r={i === pMS.length - 1 ? 6 : 2.4} fill={CR} />)}
					</>
				)}
			</Plot>
			<Legend items={[[CA, 'cross-entropy (convexa: un valle)'], [CR, 'error² sobre σ (no convexa: mesetas)', 'd']]} />
			<div className="pg-stats">
				<Stat k="w final · cross-entropy" v={pCE[pCE.length - 1].toFixed(2)} color={CA} />
				<Stat k="w final · error²" v={pMS[pMS.length - 1].toFixed(2)} color={CR} />
			</div>
			<div className="pg-note">
				Empieza en w₀ = −6 o −10: el error² está en una <b>meseta</b> (σ saturada ⇒ σ′ ≈ 0 ⇒ gradiente ≈ 0) y el descenso casi no se mueve, aunque el modelo está seguro y equivocado. La cross-entropy castiga fuerte ese error (−log de algo ≈ 0) y su gradiente (p − y)x no se apaga: llega al mínimo desde cualquier inicio.
			</div>
		</div>
	);
}

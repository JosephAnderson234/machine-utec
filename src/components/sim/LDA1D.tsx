import { useState } from 'react';
import Plot, { Path, CA, C0, C1, CV, Slider, Stat, Legend } from '../ui/Plot';
import Tex from '../ui/Tex';
import { gauss, range, sigmoid } from '../ui/math';

/** LDA en 1-D: densidades ponderadas por el prior, posterior sigmoide y la fórmula de x*. */
export default function LDA1D() {
	const [m0, setM0] = useState(2);
	const [m1, setM1] = useState(6);
	const [s2, setS2] = useState(4);
	const [p1, setP1] = useState(0.5);
	const s = Math.sqrt(s2);
	const w = (m1 - m0) / s2;
	const lr = Math.log(p1 / (1 - p1));
	const b = -((m1 * m1 - m0 * m0) / (2 * s2)) + lr;
	const xs = range(-4, 12, 260);
	const xstar = w !== 0 ? -b / w : NaN;
	const ymax = Math.max(...xs.map((x) => Math.max((1 - p1) * gauss(x, m0, s), p1 * gauss(x, m1, s)))) * 1.15;

	return (
		<div className="pg not-content">
			<h4>LDA a mano en 1-D</h4>
			<p className="pg-sub">Dos clases gaussianas con la <b>misma</b> varianza σ². Arriba: cada densidad multiplicada por su prior (el área sombreada donde se traslapan es el error de Bayes). Abajo: el posterior que sale de Bayes, que es exactamente una sigmoide.</p>
			<div className="pg-row">
				<Slider label="μ₀" value={m0} min={-2} max={8} step={0.1} onChange={setM0} />
				<Slider label="μ₁" value={m1} min={-2} max={10} step={0.1} onChange={setM1} />
				<Slider label="σ² (compartida)" value={s2} min={0.3} max={9} step={0.1} onChange={setS2} />
				<Slider label="prior π₁" value={p1} min={0.05} max={0.95} step={0.05} onChange={setP1} />
			</div>
			<Plot x={[-4, 12]} y={[0, ymax]} h={230} xlabel="x" yticks={[]}>
				{(sc) => (
					<>
						<path
							d={`M${sc.X(-4)},${sc.Y(0)}` + xs.map((x) => `L${sc.X(x)},${sc.Y(Math.min((1 - p1) * gauss(x, m0, s), p1 * gauss(x, m1, s)))}`).join('') + `L${sc.X(12)},${sc.Y(0)}Z`}
							fill={CV}
							opacity={0.25}
						/>
						<Path pts={xs.map((x) => [x, (1 - p1) * gauss(x, m0, s)])} s={sc} color={C0} width={2.4} />
						<Path pts={xs.map((x) => [x, p1 * gauss(x, m1, s)])} s={sc} color={C1} width={2.4} />
						{Number.isFinite(xstar) && <line x1={sc.X(xstar)} x2={sc.X(xstar)} y1={sc.y0} y2={sc.y1} stroke={CA} strokeWidth={2} strokeDasharray="5 4" />}
					</>
				)}
			</Plot>
			<Plot x={[-4, 12]} y={[-0.05, 1.05]} h={200} xlabel="x" ylabel="P(y=1 | x)" yticks={[0, 0.5, 1]}>
				{(sc) => (
					<>
						<line x1={sc.x0} x2={sc.x1} y1={sc.Y(0.5)} y2={sc.Y(0.5)} stroke="var(--pg-border)" strokeDasharray="4 4" />
						<Path pts={xs.map((x) => [x, sigmoid(w * x + b)])} s={sc} color={CA} width={2.6} />
						{Number.isFinite(xstar) && <circle cx={sc.X(xstar)} cy={sc.Y(0.5)} r={5} fill={CA} />}
					</>
				)}
			</Plot>
			<Legend items={[[C0, 'π₀·p(x | y=0)'], [C1, 'π₁·p(x | y=1)'], [CV, 'traslape = error de Bayes'], [CA, 'frontera x* y posterior σ(wx + b)']]} />
			<div className="matrix-wrap">
				<Tex block>{`w = \\frac{\\mu_1-\\mu_0}{\\sigma^2} = \\frac{${m1.toFixed(1)}-${m0.toFixed(1)}}{${s2.toFixed(1)}} = ${w.toFixed(3)},\\qquad x^* = \\frac{\\mu_0+\\mu_1}{2} - \\frac{\\sigma^2}{\\mu_1-\\mu_0}\\log\\frac{\\pi_1}{\\pi_0} = ${((m0 + m1) / 2).toFixed(2)} - ${(s2 / (m1 - m0)).toFixed(2)}\\cdot(${lr.toFixed(2)}) = ${xstar.toFixed(3)}`}</Tex>
			</div>
			<div className="pg-stats">
				<Stat k="w" v={w.toFixed(3)} />
				<Stat k="b" v={b.toFixed(3)} />
				<Stat k="frontera x*" v={Number.isFinite(xstar) ? xstar.toFixed(3) : '—'} color={CA} />
			</div>
			<div className="pg-note">
				Con priors iguales, x* es el <b>punto medio</b> (gana la media más cercana). Baja π₁: la frontera se corre hacia μ₁ y la clase rara pierde territorio, porque se necesita más evidencia para apostar por ella. Sube σ²: la sigmoide se aplana (más incertidumbre) y el prior pesa más. Si μ₀ = μ₁, w = 0 y solo decide el prior.
			</div>
		</div>
	);
}

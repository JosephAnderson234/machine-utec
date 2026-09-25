import { useMemo, useState } from 'react';
import Plot, { Path, CA, C0, C1, CM, CV, CR, CG, Slider, Stat, Legend } from '../ui/Plot';
import { rng, range } from '../ui/math';
import { smo, linearK } from '../ui/svm';

function makeData(seed: number, overlap: number) {
	const r = rng(seed);
	const X: number[][] = [],
		y: number[] = [];
	for (let i = 0; i < 52; i++) {
		const c = i % 2 ? 1 : -1;
		X.push([c * 1.3 + r.normal() * overlap, c * 0.8 + r.normal() * overlap]);
		y.push(c);
	}
	return { X, y };
}

/** SVM de margen suave: C, holguras ξ, los tres casos KKT y la pérdida hinge. */
export default function SoftMarginSVM() {
	const [logC, setLogC] = useState(0);
	const [seed, setSeed] = useState(5);
	const [ov, setOv] = useState(1);
	const [m, setM] = useState(0.5);
	const C = Math.pow(10, logC);
	const { X, y } = useMemo(() => makeData(seed, ov), [seed, ov]);
	const model = useMemo(() => smo(X, y, C, linearK, 1e-3, 10, seed), [X, y, C]);
	const w = [0, 0];
	model.alpha.forEach((a, i) => {
		w[0] += a * y[i] * X[i][0];
		w[1] += a * y[i] * X[i][1];
	});
	const b = model.b;
	const nw = Math.hypot(w[0], w[1]) || 1e-9;
	const fx = (x: number[]) => w[0] * x[0] + w[1] * x[1] + b;
	const cat = model.alpha.map((a) => (a < 1e-6 ? 0 : a < C - 1e-6 ? 1 : 2));
	const xi = X.map((x, i) => Math.max(0, 1 - y[i] * fx(x)));
	const obj = 0.5 * nw * nw + C * xi.reduce((s, v) => s + v, 0);
	const errors = X.filter((x, i) => y[i] * fx(x) < 0).length;
	const nsv = cat.filter((c) => c > 0).length;

	const line = (level: number): [number, number][] => {
		if (Math.abs(w[1]) > 1e-9) return [[-5, (level - b - w[0] * -5) / w[1]], [5, (level - b - w[0] * 5) / w[1]]];
		return [[(level - b) / w[0], -5], [(level - b) / w[0], 5]];
	};
	const ms = range(-2, 3, 200);

	return (
		<div className="pg not-content">
			<h4>Margen suave: C como tipo de cambio</h4>
			<p className="pg-sub">Datos que se traslapan: el margen duro sería infactible. Cada punto puede invadir la banda pagando su holgura ξᵢ (flecha). Este SVM se resuelve de verdad en tu navegador con SMO sobre el dual.</p>
			<div className="pg-row">
				<Slider label="C (precio de cada violación)" value={logC} min={-2} max={2} step={0.1} onChange={setLogC} show={C < 1 ? C.toFixed(3) : C.toFixed(1)} />
				<Slider label="traslape de clases" value={ov} min={0.4} max={1.8} step={0.05} onChange={setOv} />
				<button onClick={() => setSeed(seed + 1)}>Otros datos</button>
			</div>
			<Plot x={[-5, 5]} y={[-4, 4]} h={420} xlabel="x₁" ylabel="x₂">
				{(s) => (
					<>
						<path d={`M${s.X(line(1)[0][0])},${s.Y(line(1)[0][1])}L${s.X(line(1)[1][0])},${s.Y(line(1)[1][1])}L${s.X(line(-1)[1][0])},${s.Y(line(-1)[1][1])}L${s.X(line(-1)[0][0])},${s.Y(line(-1)[0][1])}Z`} fill={CA} opacity={0.09} />
						<Path pts={line(1)} s={s} color={C1} dash="6 5" width={1.5} />
						<Path pts={line(-1)} s={s} color={C0} dash="6 5" width={1.5} />
						<Path pts={line(0)} s={s} color="var(--sl-color-white)" width={2.4} />
						{X.map((x, i) =>
							xi[i] > 1e-6 ? (
								<line key={`x${i}`} x1={s.X(x[0])} y1={s.Y(x[1])} x2={s.X(x[0] + (y[i] * xi[i] * w[0]) / (nw * nw))} y2={s.Y(x[1] + (y[i] * xi[i] * w[1]) / (nw * nw))} stroke={CV} strokeWidth={1.5} />
							) : null,
						)}
						{X.map((x, i) => (
							<g key={i}>
								{cat[i] > 0 && <circle cx={s.X(x[0])} cy={s.Y(x[1])} r={9.5} fill="none" stroke={cat[i] === 1 ? CG : CR} strokeWidth={1.8} />}
								<circle cx={s.X(x[0])} cy={s.Y(x[1])} r={4.8} fill={y[i] === 1 ? C1 : C0} stroke="var(--pg-surface)" strokeWidth={1.3} />
							</g>
						))}
					</>
				)}
			</Plot>
			<Legend items={[[CG, '0 < αᵢ < C: sobre el margen (fija b)'], [CR, 'αᵢ = C: dentro de la banda o mal clasificado'], [CV, 'holgura ξᵢ'], [CM, 'sin anillo: αᵢ = 0 (espectador)']]} />
			<div className="pg-stats">
				<Stat k="ancho 2/‖w‖" v={(2 / nw).toFixed(3)} />
				<Stat k="vectores de soporte" v={`${nsv} / ${X.length}`} />
				<Stat k="Σ ξᵢ" v={xi.reduce((s, v) => s + v, 0).toFixed(2)} />
				<Stat k="errores de entrenamiento" v={errors} />
				<Stat k="½‖w‖² + CΣξ" v={obj.toFixed(2)} />
			</div>
			<div className="pg-note">
				{logC < -0.5 ? (
					<><b>C pequeño</b>: violar es barato, así que el optimizador compra una banda ancha y tolerante; muchos puntos se vuelven vectores de soporte (alto sesgo, fuerte regularización).</>
				) : logC > 0.8 ? (
					<><b>C grande</b>: cada intrusión cuesta caro; la banda se estrecha para perseguir puntos individuales (alta varianza). Con C → ∞ recuperas el margen duro.</>
				) : (
					<>C es el dial de regularización del SVM, igual que λ en ridge pero <b>invertido</b>: C grande = regularización débil (λ ∝ 1/C). En el dual el único cambio es 0 ≤ αᵢ ≤ C: ningún punto puede empujar la frontera con más fuerza que C.</>
				)}
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid var(--pg-border)', width: '100%' }} />
			<h4>La hinge frente a las pérdidas que ya conoces</h4>
			<p className="pg-sub">Eliminando ξ queda <span className="mono">min ½‖w‖² + C Σ max(0, 1 − yᵢf(xᵢ))</span>: pérdida + penalización L2. Mueve el margen m = y·f(x) de un punto.</p>
			<Slider label="margen del punto m = y f(x)" value={m} min={-2} max={3} step={0.05} onChange={setM} />
			<Plot x={[-2, 3]} y={[0, 3.2]} h={290} xlabel="margen m = y f(x)" ylabel="pérdida">
				{(s) => (
					<>
						<rect x={s.X(-2)} y={s.y1} width={s.X(0) - s.X(-2)} height={s.y0 - s.y1} fill={CR} opacity={0.06} />
						<Path pts={ms.map((v) => [v, v < 0 ? 1 : 0])} s={s} color={CM} width={2} />
						<Path pts={ms.map((v) => [v, (1 - v) ** 2])} s={s} color={CR} width={1.8} dash="5 4" />
						<Path pts={ms.map((v) => [v, Math.log2(1 + Math.exp(-v))])} s={s} color={CV} width={2.2} />
						<Path pts={ms.map((v) => [v, Math.max(0, 1 - v)])} s={s} color={CA} width={3} />
						<line x1={s.X(m)} x2={s.X(m)} y1={s.y0} y2={s.y1} stroke="var(--sl-color-white)" strokeDasharray="3 3" />
						<circle cx={s.X(m)} cy={s.Y(Math.max(0, 1 - m))} r={6} fill={CA} />
					</>
				)}
			</Plot>
			<Legend items={[[CA, 'hinge max(0, 1 − m)'], [CV, 'logística (sesión 04)'], [CM, '0/1 (la ideal, no optimizable)'], [CR, 'cuadrática (castiga ser «demasiado correcto»)', 'd']]} />
			<div className="pg-stats">
				<Stat k="hinge" v={Math.max(0, 1 - m).toFixed(3)} color={CA} />
				<Stat k="logística" v={Math.log2(1 + Math.exp(-m)).toFixed(3)} />
				<Stat k="caso de holgura" v={m >= 1 ? 'ξ = 0 (fuera de la banda)' : m >= 0 ? '0 < ξ ≤ 1 (dentro, correcto)' : 'ξ > 1 (lado equivocado)'} />
			</div>
			<div className="pg-note">
				La hinge vale <b>exactamente 0</b> (y su gradiente también) cuando m ≥ 1: esos puntos no influyen en el ajuste; es la historia de los vectores de soporte vista como pérdida. La logística nunca llega a 0: todo punto sigue tirando de la frontera para siempre.
			</div>
		</div>
	);
}

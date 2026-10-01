import { useMemo, useState } from 'react';
import Plot, { Path, CA, C0, C1, CM, CV, Slider, Stat, Legend } from '../ui/Plot';
import { range, rng, mean } from '../ui/math';

type P = { x: number; y: number };
type Node = { t?: number; l?: Node; r?: Node; c: number };
const truth = (x: number) => Math.sin(1.3 * x) + 0.25 * x;

function build(d: P[], depth: number, minLeaf = 2): Node {
	const c = mean(d.map((p) => p.y));
	if (depth === 0 || d.length < 2 * minLeaf) return { c };
	const s = [...d].sort((a, b) => a.x - b.x);
	let best = { sse: Infinity, t: 0, k: -1 };
	// prefijos para SSE en O(n)
	let sl = 0,
		sl2 = 0;
	const tot = s.reduce((a, p) => a + p.y, 0),
		tot2 = s.reduce((a, p) => a + p.y * p.y, 0);
	for (let k = 0; k < s.length - 1; k++) {
		sl += s[k].y;
		sl2 += s[k].y * s[k].y;
		const nl = k + 1,
			nr = s.length - nl;
		if (nl < minLeaf || nr < minLeaf || s[k].x === s[k + 1].x) continue;
		const sse = sl2 - (sl * sl) / nl + (tot2 - sl2) - ((tot - sl) * (tot - sl)) / nr;
		if (sse < best.sse) best = { sse, t: (s[k].x + s[k + 1].x) / 2, k };
	}
	if (best.k < 0) return { c };
	return { c, t: best.t, l: build(s.slice(0, best.k + 1), depth - 1, minLeaf), r: build(s.slice(best.k + 1), depth - 1, minLeaf) };
}
const pred = (n: Node, x: number): number => (n.t === undefined ? n.c : x <= n.t ? pred(n.l!, x) : pred(n.r!, x));
const leaves = (n: Node): number => (n.t === undefined ? 1 : leaves(n.l!) + leaves(n.r!));

/** Árbol de regresión = escalera; profundidad = complejidad; bagging promedia escaleras. */
export default function TreeRegression() {
	const [depth, setDepth] = useState(3);
	const [B, setB] = useState(1);
	const [seed, setSeed] = useState(3);
	const { train, test } = useMemo(() => {
		const r = rng(seed);
		const gen = (n: number) => Array.from({ length: n }, () => { const x = r.uniform(-3, 3); return { x, y: truth(x) + 0.35 * r.normal() }; });
		return { train: gen(70), test: gen(300) };
	}, [seed]);
	const trees = useMemo(() => {
		const r = rng(seed * 101 + 7);
		if (B === 1) return [build(train, depth)];
		return Array.from({ length: B }, () => build(Array.from({ length: train.length }, () => train[Math.floor(r.next() * train.length)]), depth));
	}, [train, depth, B, seed]);
	const f = (x: number) => mean(trees.map((t) => pred(t, x)));
	const mse = (d: P[]) => mean(d.map((p) => (p.y - f(p.x)) ** 2));
	const xs = range(-4.5, 4.5, 500);

	return (
		<div className="pg not-content">
			<h4>Un árbol de regresión es una escalera</h4>
			<p className="pg-sub">Cada hoja predice la <b>media</b> de sus puntos. Sube la profundidad y mira el error de test; fíjate en las zonas sombreadas fuera del rango de entrenamiento. Luego sube B: <b>bagging</b> promedia B árboles entrenados con remuestreos bootstrap (el tema siguiente del curso).</p>
			<div className="pg-row">
				<Slider label="profundidad máxima" value={depth} min={1} max={10} step={1} onChange={setDepth} />
				<Slider label="B árboles (bagging)" value={B} min={1} max={60} step={1} onChange={setB} />
				<button onClick={() => setSeed(seed + 1)}>Nuevos datos</button>
			</div>
			<Plot x={[-4.5, 4.5]} y={[-2.6, 2.6]} h={340} xlabel="x" ylabel="y">
				{(s) => (
					<>
						<rect x={s.x0} y={s.y1} width={s.X(-3) - s.x0} height={s.y0 - s.y1} fill={CM} opacity={0.12} />
						<rect x={s.X(3)} y={s.y1} width={s.x1 - s.X(3)} height={s.y0 - s.y1} fill={CM} opacity={0.12} />
						{test.slice(0, 120).map((p, i) => <circle key={`t${i}`} cx={s.X(p.x)} cy={s.Y(p.y)} r={2.2} fill={C1} opacity={0.35} />)}
						<Path pts={xs.map((x) => [x, truth(x)])} s={s} color={CM} dash="5 5" width={1.6} />
						{B > 1 && trees.slice(0, 12).map((t, k) => <Path key={k} pts={xs.map((x) => [x, pred(t, x)])} s={s} color={CV} width={0.8} opacity={0.3} />)}
						<Path pts={xs.map((x) => [x, f(x)])} s={s} color={CA} width={2.6} />
						{train.map((p, i) => <circle key={i} cx={s.X(p.x)} cy={s.Y(p.y)} r={3.6} fill={C0} stroke="var(--pg-surface)" strokeWidth={1} />)}
					</>
				)}
			</Plot>
			<Legend items={[[CA, B > 1 ? `promedio de ${B} árboles` : 'predicción del árbol'], [C0, 'entrenamiento'], [C1, 'test'], [CM, 'verdad · zona gris = sin datos', 'd'], ...(B > 1 ? ([[CV, 'árboles individuales']] as [string, string][]) : [])]} />
			<div className="pg-stats">
				<Stat k="hojas (1 árbol)" v={leaves(trees[0])} />
				<Stat k="MSE train" v={mse(train).toFixed(3)} />
				<Stat k="MSE test" v={mse(test).toFixed(3)} color="var(--sl-color-accent)" />
				<Stat k="ruido irreducible σ²" v="0.123" />
			</div>
			<div className="pg-note">
				{B === 1 ? (
					depth <= 2 ? (
						<>Pocos escalones: no puede seguir la curva (sesgo alto).</>
					) : depth >= 7 ? (
						<>Casi un escalón por punto: el MSE de train cae pero el de test sube: <b>memoriza el ruido</b> (varianza alta). Fuera de [−3, 3] la predicción es <b>plana para siempre</b>: un árbol no extrapola.</>
					) : (
						<>Profundidad intermedia: sigue la forma sin perseguir cada punto. Igual, fuera del rango de entrenamiento queda plano.</>
					)
				) : (
					<>Cada árbol (violeta) es dentado y distinto; su <b>promedio</b> es más suave y su MSE de test baja. Promediar B árboles casi independientes divide la varianza sin tocar el sesgo: por eso se promedian árboles <b>profundos</b> (sesgo bajo, varianza alta). Eso es bagging; random forest además sortea las features en cada split.</>
				)}
			</div>
		</div>
	);
}

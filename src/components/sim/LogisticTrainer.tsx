import { useEffect, useMemo, useState } from 'react';
import Plot, { useMounted, Path, CA, C0, C1, CV, Slider, Stat, Legend } from '../ui/Plot';
import { heatmap, probColor, rng, sigmoid, fmt } from '../ui/math';

type Pt = { x: number[]; y: number };
function makeData(seed: number, sep: number): Pt[] {
	const r = rng(seed);
	const out: Pt[] = [];
	for (let i = 0; i < 60; i++) {
		const y = i % 2;
		const c = y ? [sep / 2, sep / 3] : [-sep / 2, -sep / 3];
		out.push({ x: [c[0] + 1.1 * r.normal(), c[1] + 1.1 * r.normal()], y });
	}
	return out;
}

type St = { w: number[]; b: number; hist: number[] };
const START: St = { w: [-2, 1.6], b: 2.2, hist: [] };

function loss(d: Pt[], w: number[], b: number, kind: 'ce' | 'mse', lam: number) {
	let s = 0;
	for (const p of d) {
		const q = sigmoid(w[0] * p.x[0] + w[1] * p.x[1] + b);
		s += kind === 'ce' ? -(p.y * Math.log(Math.max(q, 1e-12)) + (1 - p.y) * Math.log(Math.max(1 - q, 1e-12))) : (q - p.y) ** 2;
	}
	return s / d.length + lam * (w[0] ** 2 + w[1] ** 2);
}

/** Regresión logística entrenada por descenso de gradiente, en vivo. */
export default function LogisticTrainer() {
	const [seed, setSeed] = useState(3);
	const [sep, setSep] = useState(3);
	const [eta, setEta] = useState(0.5);
	const [lam, setLam] = useState(0);
	const [kind, setKind] = useState<'ce' | 'mse'>('ce');
	const [st, setSt] = useState<St>(START);
	const [play, setPlay] = useState(false);
	const data = useMemo(() => makeData(seed, sep), [seed, sep]);

	const step = (s: St): St => {
		let g0 = 0,
			g1 = 0,
			gb = 0;
		for (const p of data) {
			const q = sigmoid(s.w[0] * p.x[0] + s.w[1] * p.x[1] + s.b);
			const e = kind === 'ce' ? q - p.y : 2 * (q - p.y) * q * (1 - q); // MSE: el factor σ' aparece y se «apaga»
			g0 += e * p.x[0];
			g1 += e * p.x[1];
			gb += e;
		}
		const n = data.length;
		const w = [s.w[0] - eta * (g0 / n + 2 * lam * s.w[0]), s.w[1] - eta * (g1 / n + 2 * lam * s.w[1])];
		const b = s.b - (eta * gb) / n;
		return { w, b, hist: [...s.hist, loss(data, s.w, s.b, kind, lam)].slice(-300) };
	};

	useEffect(() => {
		if (!play) return;
		const id = setInterval(() => setSt((s) => step(s)), 60);
		return () => clearInterval(id);
	}, [play, data, eta, lam, kind]);

	const reset = () => { setSt(START); setPlay(false); };
	const { w, b } = st;
	const mounted = useMounted();
	const img = useMemo(() => !mounted ? '' : heatmap((x, y) => sigmoid(w[0] * x + w[1] * y + b), [-5, 5], [-4, 4], probColor, 80), [w[0], w[1], b, mounted]);
	const acc = data.filter((p) => (w[0] * p.x[0] + w[1] * p.x[1] + b >= 0 ? 1 : 0) === p.y).length / data.length;
	const J = loss(data, w, b, kind, lam);
	const hmax = Math.max(0.1, ...st.hist);

	const bline = (s: any) => {
		if (Math.abs(w[1]) > 1e-6) return <Path pts={[[-5, (-b - w[0] * -5) / w[1]], [5, (-b - w[0] * 5) / w[1]]]} s={s} color="var(--sl-color-white)" width={2.2} />;
		if (Math.abs(w[0]) > 1e-6) return <line x1={s.X(-b / w[0])} x2={s.X(-b / w[0])} y1={s.y0} y2={s.y1} stroke="var(--sl-color-white)" strokeWidth={2.2} />;
		return null;
	};

	return (
		<div className="pg not-content">
			<h4>Mira a la frontera acomodarse</h4>
			<p className="pg-sub">Descenso de gradiente por lotes desde un inicio deliberadamente malo. El color es P(y = 1 | x); la línea blanca es la frontera wᵀx + b = 0. El gradiente es <span className="mono">Xᵀ(p − y)/n</span>: «error × feature», igual que en regresión lineal.</p>
			<div className="pg-row">
				<div className="pg-seg">
					<button className={kind === 'ce' ? 'active' : ''} onClick={() => { setKind('ce'); reset(); }}>Pérdida: cross-entropy</button>
					<button className={kind === 'mse' ? 'active' : ''} onClick={() => { setKind('mse'); reset(); }}>Pérdida: error² sobre σ</button>
				</div>
			</div>
			<div className="pg-row">
				<Slider label="η" value={eta} min={0.05} max={3} step={0.05} onChange={setEta} />
				<Slider label="λ (L2)" value={lam} min={0} max={0.3} step={0.005} onChange={setLam} />
				<Slider label="separación de clases" value={sep} min={0.5} max={7} step={0.25} onChange={(v) => { setSep(v); reset(); }} />
			</div>
			<div className="pg-row">
				<button className="primary" onClick={() => setPlay(!play)}>{play ? 'Pausa' : 'Entrenar'}</button>
				<button onClick={() => setSt(step(st))}>Un paso</button>
				<button onClick={() => { let s = st; for (let i = 0; i < 50; i++) s = step(s); setSt(s); }}>+50 pasos</button>
				<button onClick={reset}>Reiniciar</button>
				<button onClick={() => { setSeed(seed + 1); reset(); }}>Nuevos datos</button>
			</div>
			<div className="pg-grid-2">
				<Plot x={[-5, 5]} y={[-4, 4]} w={420} h={350} xlabel="x₁" ylabel="x₂">
					{(s) => (
						<>
							{img && <image href={img} x={s.X(-5)} y={s.Y(4)} width={s.X(5) - s.X(-5)} height={s.Y(-4) - s.Y(4)} preserveAspectRatio="none" />}
							{bline(s)}
							{data.map((p, i) => (
								<circle key={i} cx={s.X(p.x[0])} cy={s.Y(p.x[1])} r={4.5} fill={p.y ? C1 : C0} stroke="var(--pg-surface)" strokeWidth={1.3} />
							))}
						</>
					)}
				</Plot>
				<Plot x={[0, Math.max(20, st.hist.length)]} y={[0, hmax * 1.05]} w={420} h={350} xlabel="iteración" ylabel={kind === 'ce' ? 'cross-entropy' : 'error cuadrático'}>
					{(s) => <Path pts={st.hist.map((v, i) => [i, v])} s={s} color={kind === 'ce' ? CA : CV} width={2.4} />}
				</Plot>
			</div>
			<Legend items={[[C0, 'clase 0'], [C1, 'clase 1'], ['var(--sl-color-white)', 'frontera (P = 0.5)']]} />
			<div className="pg-stats">
				<Stat k="iteraciones" v={st.hist.length} />
				<Stat k="pérdida" v={fmt(J, 4)} />
				<Stat k="accuracy" v={`${Math.round(acc * 100)}%`} />
				<Stat k="‖w‖" v={fmt(Math.hypot(w[0], w[1]), 2)} />
			</div>
			<div className="pg-note">
				{kind === 'ce' ? (
					<>La cross-entropy es <b>convexa</b>: baja monótonamente. Separa mucho las clases con λ = 0 y deja entrenar: ‖w‖ crece sin límite (sigmoides cada vez más afiladas). Con λ &gt; 0 se estabiliza.</>
				) : (
					<>Con error² sobre σ el gradiente lleva el factor <b>σ(1 − σ)</b>, que casi vale 0 donde el modelo está seguro y equivocado: el descenso se arrastra en una meseta (superficie no convexa). Compara cuántos pasos necesita cada pérdida.</>
				)}
			</div>
		</div>
	);
}

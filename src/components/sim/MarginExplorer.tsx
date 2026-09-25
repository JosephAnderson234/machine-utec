import { useMemo, useState } from 'react';
import Plot, { Path, CA, C0, C1, CV, CM, Slider, Stat, Legend } from '../ui/Plot';
import { rng, fmt } from '../ui/math';

type P = { x: number[]; y: 1 | -1 };
const EJEMPLO: P[] = [
	{ x: [2, 0], y: 1 },
	{ x: [0, 2], y: 1 },
	{ x: [0, 0], y: -1 },
	{ x: [3, 3], y: 1 },
];
function nube(seed: number): P[] {
	const r = rng(seed);
	const out: P[] = [];
	while (out.length < 16) {
		const y = out.length % 2 ? 1 : -1;
		const x = [y * 1.5 + r.normal() * 0.9, y * 0.9 + r.normal() * 0.9];
		if (y * (x[0] + 0.6 * x[1]) > 0.9) out.push({ x, y: y as 1 | -1 });
	}
	return out;
}

function maxMargin(d: P[]) {
	let best = { th: 0, gap: -Infinity, mid: 0 };
	for (let k = 0; k < 1440; k++) {
		const th = (k / 4) * (Math.PI / 180);
		const u = [Math.cos(th), Math.sin(th)];
		let minP = Infinity,
			maxN = -Infinity;
		for (const p of d) {
			const v = u[0] * p.x[0] + u[1] * p.x[1];
			if (p.y === 1) minP = Math.min(minP, v);
			else maxN = Math.max(maxN, v);
		}
		const gap = (minP - maxN) / 2;
		if (gap > best.gap) best = { th: k / 4, gap, mid: (minP + maxN) / 2 };
	}
	return best;
}

/** Explorador del margen: w ⊥ frontera, distancia con signo, margen funcional vs geométrico, 2/‖w‖. */
export default function MarginExplorer() {
	const [ds, setDs] = useState<'ej' | 'nube'>('ej');
	const [seed, setSeed] = useState(2);
	const data = useMemo(() => (ds === 'ej' ? EJEMPLO : nube(seed)), [ds, seed]);
	const [th, setTh] = useState(20); // ángulo de w en grados
	const [off, setOff] = useState(1.2); // la frontera es û·x = off
	const [nw, setNw] = useState(1); // ‖w‖

	const u = [Math.cos((th * Math.PI) / 180), Math.sin((th * Math.PI) / 180)];
	const w = [nw * u[0], nw * u[1]];
	const b = -off * nw;
	const f = (x: number[]) => w[0] * x[0] + w[1] * x[1] + b;
	const func = data.map((p) => p.y * f(p.x));
	const geo = func.map((v) => v / nw);
	const gmin = Math.min(...geo);
	const fmin = Math.min(...func);
	const opt = useMemo(() => maxMargin(data), [data]);

	const toOpt = () => {
		setTh(+opt.th.toFixed(2));
		setOff(+opt.mid.toFixed(4));
		setNw(+(1 / opt.gap).toFixed(4));
	};
	const canon = () => setNw(+(nw / fmin).toFixed(4));
	const xd: [number, number] = ds === 'ej' ? [-1.5, 4.5] : [-4.5, 4.5];
	const yd: [number, number] = ds === 'ej' ? [-1.5, 4] : [-3.6, 3.6];

	const lineAt = (level: number) => {
		// puntos con w·x + b = level: x = x0 + t·(−u2, u1), con x0 = u·(level − b)/nw
		const c = (level - b) / nw;
		const p0 = [u[0] * c, u[1] * c];
		const dir = [-u[1], u[0]];
		return [
			[p0[0] - 20 * dir[0], p0[1] - 20 * dir[1]],
			[p0[0] + 20 * dir[0], p0[1] + 20 * dir[1]],
		] as [number, number][];
	};

	return (
		<div className="pg not-content">
			<h4>El margen, pieza por pieza</h4>
			<p className="pg-sub">
				Controla la dirección de <b>w</b> (siempre perpendicular a la frontera), dónde cae la frontera y el tamaño ‖w‖. Las rectas punteadas son <span className="mono">f(x) = ±1</span>: su separación es 2/‖w‖. El número junto a cada punto es su margen <b>geométrico</b> γᵢ = yᵢ f(xᵢ)/‖w‖.
			</p>
			<div className="pg-row">
				<div className="pg-seg">
					<button className={ds === 'ej' ? 'active' : ''} onClick={() => setDs('ej')}>Ejemplo de la clase (3 + 1 puntos)</button>
					<button className={ds === 'nube' ? 'active' : ''} onClick={() => setDs('nube')}>Nube separable</button>
				</div>
				{ds === 'nube' && <button onClick={() => setSeed(seed + 1)}>Otros datos</button>}
			</div>
			<div className="pg-row">
				<Slider label="dirección de w (grados)" value={th} min={-180} max={180} step={0.5} onChange={setTh} />
				<Slider label="posición de la frontera" value={off} min={-3} max={4} step={0.02} onChange={setOff} />
				<Slider label="‖w‖ (escala)" value={nw} min={0.2} max={4} step={0.01} onChange={setNw} />
			</div>
			<div className="pg-row">
				<button className="primary" onClick={toOpt}>Máximo margen (SVM)</button>
				<button onClick={canon} disabled={fmin <= 0}>Normalización canónica (min yᵢf = 1)</button>
			</div>
			<Plot x={xd} y={yd} h={ds === 'ej' ? 474 : 420} xlabel="x₁" ylabel="x₂">
				{(s) => {
					const ctr = lineAt(0);
					const mid = [(ctr[0][0] + ctr[1][0]) / 2, (ctr[0][1] + ctr[1][1]) / 2];
					const inside = (l: [number, number][]) => l;
					return (
						<>
							<path
								d={`M${s.X(lineAt(1)[0][0])},${s.Y(lineAt(1)[0][1])}L${s.X(lineAt(1)[1][0])},${s.Y(lineAt(1)[1][1])}L${s.X(lineAt(-1)[1][0])},${s.Y(lineAt(-1)[1][1])}L${s.X(lineAt(-1)[0][0])},${s.Y(lineAt(-1)[0][1])}Z`}
								fill={CA}
								opacity={0.1}
							/>
							<Path pts={inside(lineAt(1))} s={s} color={CA} dash="6 5" width={1.6} />
							<Path pts={inside(lineAt(-1))} s={s} color={CA} dash="6 5" width={1.6} />
							<Path pts={ctr} s={s} color="var(--sl-color-white)" width={2.4} />
							<line x1={s.X(mid[0])} y1={s.Y(mid[1])} x2={s.X(mid[0] + u[0] * 0.9)} y2={s.Y(mid[1] + u[1] * 0.9)} stroke={CV} strokeWidth={2.6} markerEnd="url(#arrowv)" />
							<defs>
								<marker id="arrowv" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
									<path d="M0,0L10,5L0,10z" fill={CV} />
								</marker>
							</defs>
							<text x={s.X(mid[0] + u[0] * 1.05)} y={s.Y(mid[1] + u[1] * 1.05)} fill={CV} fontSize={13} fontWeight={700}>w</text>
							{data.map((p, i) => {
								const sv = Math.abs(geo[i] - gmin) < 1e-3 * Math.max(1, Math.abs(gmin)) + 0.02 && gmin > 0;
								// pie de la perpendicular sobre la frontera
								const r = f(p.x) / nw;
								const foot = [p.x[0] - r * u[0], p.x[1] - r * u[1]];
								return (
									<g key={i}>
										<line x1={s.X(p.x[0])} y1={s.Y(p.x[1])} x2={s.X(foot[0])} y2={s.Y(foot[1])} stroke={CM} strokeDasharray="2 3" />
										{sv && <circle cx={s.X(p.x[0])} cy={s.Y(p.x[1])} r={12} fill="none" stroke="var(--sl-color-white)" strokeWidth={1.6} />}
										<circle cx={s.X(p.x[0])} cy={s.Y(p.x[1])} r={6.5} fill={p.y === 1 ? C1 : C0} stroke="var(--pg-surface)" strokeWidth={1.8} />
										<text x={s.X(p.x[0]) + 10} y={s.Y(p.x[1]) + 16} fontSize={10.5} fill={geo[i] < 0 ? 'var(--pg-bad)' : 'var(--pg-muted)'}>{geo[i].toFixed(2)}</text>
									</g>
								);
							})}
						</>
					);
				}}
			</Plot>
			<Legend items={[[C1, 'y = +1'], [C0, 'y = −1'], ['var(--sl-color-white)', 'frontera wᵀx + b = 0'], [CA, 'f(x) = ±1 (ancho 2/‖w‖)', 'd']]} />
			<div className="pg-stats">
				<Stat k="w" v={`(${w[0].toFixed(2)}, ${w[1].toFixed(2)})`} />
				<Stat k="b" v={b.toFixed(2)} />
				<Stat k="min margen funcional" v={fmt(fmin, 3)} color={fmin < 0 ? 'var(--pg-bad)' : undefined} />
				<Stat k="margen geométrico γ" v={fmt(gmin, 3)} color={gmin < 0 ? 'var(--pg-bad)' : undefined} />
				<Stat k="banda 2/‖w‖" v={(2 / nw).toFixed(3)} />
				<Stat k="½‖w‖²" v={(0.5 * nw * nw).toFixed(3)} />
			</div>
			<div className={`pg-note ${gmin < 0 ? 'bad' : ''}`}>
				{gmin < 0 ? (
					<>Algún punto tiene margen <b>negativo</b>: está del lado equivocado. El producto yᵢ·f(xᵢ) &gt; 0 reemplaza el chequeo de dos casos.</>
				) : (
					<>
						Cambia solo ‖w‖: el margen <b>funcional</b> se multiplica, pero el <b>geométrico</b> no se mueve (la recta es la misma). Por eso maximizar el funcional no tiene sentido y fijamos la escala con min yᵢf(xᵢ) = 1: entonces las líneas ±1 tocan los vectores de soporte (círculo blanco) y la banda mide 2/‖w‖.
						{ds === 'ej' && <> En el ejemplo, el óptimo es w = (1, 1), b = −1, banda √2 ≈ 1.414; el punto (3,3) tiene yf = 5 &gt; 1 y no influye (α₄ = 0).</>}
					</>
				)}
			</div>
		</div>
	);
}

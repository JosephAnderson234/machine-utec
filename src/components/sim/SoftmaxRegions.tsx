import { useMemo, useState } from 'react';
import Plot, { useMounted, Slider } from '../ui/Plot';
import { heatmap } from '../ui/math';

const COL: [number, number, number][] = [
	[80, 190, 215],
	[236, 150, 70],
	[170, 130, 230],
];
const CSS = ['var(--pg-c1)', 'var(--pg-c2)', 'var(--pg-c3)'];
const NAMES = ['gato', 'perro', 'ave'];

/** Regiones de decisión de softmax: un vector de pesos por clase; cada frontera par a par es una recta. */
export default function SoftmaxRegions() {
	const [W, setW] = useState<number[][]>([
		[-1.5, 1],
		[1.6, 0.8],
		[0.2, -1.6],
	]);
	const [T, setT] = useState(1);
	const [drag, setDrag] = useState<number | null>(null);
	const [q, setQ] = useState<number[]>([0.5, 0.5]);
	const mounted = useMounted();
	const probs = (x: number[]) => {
		const z = W.map((w) => (w[0] * x[0] + w[1] * x[1]) / T);
		const m = Math.max(...z);
		const e = z.map((v) => Math.exp(v - m));
		const S = e.reduce((a, b) => a + b, 0);
		return e.map((v) => v / S);
	};
	const img = useMemo(
		() =>
			!mounted
				? ''
				: heatmap(
						(x, y) => {
							const p = probs([x, y]);
							const k = p.indexOf(Math.max(...p));
							return k + Math.max(...p) * 0.999; // codifica clase y confianza
						},
						[-3, 3],
						[-3, 3],
						(v) => {
							const k = Math.floor(v);
							const conf = v - k;
							const [r, g, b] = COL[k];
							return [r, g, b, Math.round(40 + 150 * (conf - 1 / 3) * 1.5)];
						},
						100,
					),
		[W, T, mounted],
	);
	const pq = probs(q);

	return (
		<div className="pg not-content">
			<h4>Regiones de softmax: arrastra los vectores de pesos</h4>
			<p className="pg-sub">Cada clase tiene su vector wₖ (la flecha). El score es zₖ = wₖᵀx: gana la clase cuya flecha apunta más «hacia» x. La intensidad del color es la confianza (max pₖ). Haz clic en el plano para consultar un punto.</p>
			<Slider label="temperatura T (divide los logits)" value={T} min={0.2} max={4} step={0.1} onChange={setT} />
			<Plot
				x={[-3, 3]}
				y={[-3, 3]}
				w={460}
				h={452}
				xlabel="x₁"
				ylabel="x₂"
				onPointerDown={(e, s) => {
					const [x, y] = s.toData(e);
					const k = W.findIndex((w) => Math.hypot(w[0] - x, w[1] - y) < 0.35);
					if (k >= 0) { setDrag(k); (e.target as Element).setPointerCapture?.(e.pointerId); } else setQ([x, y]);
				}}
				onPointerMove={(e, s) => {
					if (drag === null) return;
					const [x, y] = s.toData(e);
					setW(W.map((w, i) => (i === drag ? [Math.max(-2.8, Math.min(2.8, x)), Math.max(-2.8, Math.min(2.8, y))] : w)));
				}}
				onPointerUp={() => setDrag(null)}
			>
				{(s) => (
					<>
						{img && <image href={img} x={s.X(-3)} y={s.Y(3)} width={s.X(3) - s.X(-3)} height={s.Y(-3) - s.Y(3)} preserveAspectRatio="none" />}
						<defs>
							{CSS.map((c, k) => (
								<marker key={k} id={`smx${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
									<path d="M0,0L10,5L0,10z" fill={c} />
								</marker>
							))}
						</defs>
						{W.map((w, k) => (
							<g key={k} className="drag">
								<line x1={s.X(0)} y1={s.Y(0)} x2={s.X(w[0])} y2={s.Y(w[1])} stroke={CSS[k]} strokeWidth={3} markerEnd={`url(#smx${k})`} />
								<circle cx={s.X(w[0])} cy={s.Y(w[1])} r={9} fill={CSS[k]} stroke="var(--pg-surface)" strokeWidth={2} opacity={0.9} />
								<text x={s.X(w[0]) + 12} y={s.Y(w[1]) - 10} fontSize={12} fontWeight={700} fill="var(--sl-color-white)">w {NAMES[k]}</text>
							</g>
						))}
						<circle cx={s.X(q[0])} cy={s.Y(q[1])} r={6} fill="var(--sl-color-white)" stroke="var(--pg-surface)" strokeWidth={2} />
					</>
				)}
			</Plot>
			<div style={{ display: 'grid', gridTemplateColumns: '4rem 1fr 3.5rem', gap: '0.4rem 0.8rem', alignItems: 'center', fontSize: '0.85rem' }}>
				{pq.map((p, k) => (
					<div key={k} style={{ display: 'contents' }}>
						<span style={{ color: 'var(--sl-color-white)' }}>{NAMES[k]}</span>
						<div className="bar-h" style={{ height: '0.8rem' }}>
							<i style={{ width: `${100 * p}%`, background: CSS[k] }} />
						</div>
						<span className="mono">{p.toFixed(3)}</span>
					</div>
				))}
			</div>
			<div className="pg-note">
				La frontera entre dos clases i, j es donde zᵢ = zⱼ, es decir (wᵢ − wⱼ)ᵀx = 0: <b>una recta</b> perpendicular a wᵢ − wⱼ. Por eso softmax (sin features extra) parte el plano en regiones convexas con bordes rectos. La temperatura no mueve las fronteras: solo cambia qué tan seguras son las probabilidades (T alto ⇒ más difusas).
			</div>
		</div>
	);
}

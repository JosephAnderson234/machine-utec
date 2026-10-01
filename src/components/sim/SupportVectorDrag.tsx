import { useMemo, useState } from 'react';
import Plot, { Path, CA, C0, C1, Stat, Legend } from '../ui/Plot';

type P = { x: number[]; y: 1 | -1 };
const INIT: P[] = [
	{ x: [2, 0], y: 1 },
	{ x: [0, 2], y: 1 },
	{ x: [3, 3], y: 1 },
	{ x: [3.5, 1.2], y: 1 },
	{ x: [0, 0], y: -1 },
	{ x: [-1, 0.8], y: -1 },
	{ x: [-0.6, -1.2], y: -1 },
];

/** Margen máximo exacto en 2-D: barrido fino de la dirección + punto medio de las proyecciones extremas. */
function svm(d: P[]) {
	let best = { th: 0, gap: -Infinity, mid: 0 };
	for (let k = 0; k < 3600; k++) {
		const th = (k / 10) * (Math.PI / 180);
		const u = [Math.cos(th), Math.sin(th)];
		let minP = Infinity,
			maxN = -Infinity;
		for (const p of d) {
			const v = u[0] * p.x[0] + u[1] * p.x[1];
			if (p.y === 1) minP = Math.min(minP, v);
			else maxN = Math.max(maxN, v);
		}
		const gap = (minP - maxN) / 2;
		if (gap > best.gap) best = { th, gap, mid: (minP + maxN) / 2 };
	}
	const u = [Math.cos(best.th), Math.sin(best.th)];
	const w = [u[0] / best.gap, u[1] / best.gap];
	const b = -best.mid / best.gap;
	return { w, b, gap: best.gap, ok: best.gap > 0 };
}

/** Arrastra los puntos: solo los vectores de soporte mueven la frontera. */
export default function SupportVectorDrag() {
	const [pts, setPts] = useState<P[]>(INIT);
	const [drag, setDrag] = useState<number | null>(null);
	const m = useMemo(() => svm(pts), [pts]);
	const f = (x: number[]) => m.w[0] * x[0] + m.w[1] * x[1] + m.b;
	const isSV = (p: P) => m.ok && Math.abs(p.y * f(p.x) - 1) < 0.03;
	const line = (lv: number): [number, number][] => {
		const [a, c] = m.w;
		if (Math.abs(c) > 1e-6) return [[-3, (lv - m.b - a * -3) / c], [5, (lv - m.b - a * 5) / c]];
		return [[(lv - m.b) / a, -3], [(lv - m.b) / a, 5]];
	};

	return (
		<div className="pg not-content">
			<h4>La carpa y sus postes: arrastra los puntos</h4>
			<p className="pg-sub">El SVM de margen máximo se recalcula en cada movimiento. Arrastra un punto <b>sin anillo</b> (no es vector de soporte): mientras no entre en la banda, la frontera no se mueve. Arrastra un punto <b>con anillo</b>: toda la frontera cambia.</p>
			<div className="pg-row">
				<button onClick={() => setPts(INIT)}>Restaurar</button>
			</div>
			<Plot
				x={[-3, 5]}
				y={[-2.5, 4.5]}
				h={455}
				xlabel="x₁"
				ylabel="x₂"
				onPointerDown={(e, s) => {
					const [x, y] = s.toData(e);
					let bi = -1,
						bd = 0.45;
					pts.forEach((p, i) => {
						const d = Math.hypot(p.x[0] - x, p.x[1] - y);
						if (d < bd) { bd = d; bi = i; }
					});
					if (bi >= 0) { setDrag(bi); (e.target as Element).setPointerCapture?.(e.pointerId); }
				}}
				onPointerMove={(e, s) => {
					if (drag === null) return;
					const [x, y] = s.toData(e);
					setPts(pts.map((p, i) => (i === drag ? { ...p, x: [Math.max(-2.8, Math.min(4.8, x)), Math.max(-2.3, Math.min(4.3, y))] } : p)));
				}}
				onPointerUp={() => setDrag(null)}
			>
				{(s) => (
					<>
						{m.ok && (
							<>
								<path d={`M${s.X(line(1)[0][0])},${s.Y(line(1)[0][1])}L${s.X(line(1)[1][0])},${s.Y(line(1)[1][1])}L${s.X(line(-1)[1][0])},${s.Y(line(-1)[1][1])}L${s.X(line(-1)[0][0])},${s.Y(line(-1)[0][1])}Z`} fill={CA} opacity={0.1} />
								<Path pts={line(1)} s={s} color={C1} dash="6 5" width={1.6} />
								<Path pts={line(-1)} s={s} color={C0} dash="6 5" width={1.6} />
								<Path pts={line(0)} s={s} color="var(--sl-color-white)" width={2.4} />
							</>
						)}
						{pts.map((p, i) => (
							<g key={i} className="drag">
								{isSV(p) && <circle cx={s.X(p.x[0])} cy={s.Y(p.x[1])} r={13} fill="none" stroke="var(--sl-color-white)" strokeWidth={1.8} />}
								<circle cx={s.X(p.x[0])} cy={s.Y(p.x[1])} r={8} fill={p.y === 1 ? C1 : C0} stroke="var(--pg-surface)" strokeWidth={2} />
							</g>
						))}
					</>
				)}
			</Plot>
			<Legend items={[[C1, 'y = +1'], [C0, 'y = −1'], ['var(--sl-color-white)', 'frontera; anillo = vector de soporte (αᵢ > 0)']]} />
			<div className="pg-stats">
				<Stat k="w" v={m.ok ? `(${m.w[0].toFixed(2)}, ${m.w[1].toFixed(2)})` : '—'} />
				<Stat k="b" v={m.ok ? m.b.toFixed(2) : '—'} />
				<Stat k="banda 2/‖w‖" v={m.ok ? (2 * m.gap).toFixed(3) : 'infactible'} color={m.ok ? undefined : 'var(--pg-bad)'} />
				<Stat k="vectores de soporte" v={pts.filter(isSV).length} />
			</div>
			<div className={`pg-note ${m.ok ? '' : 'bad'}`}>
				{m.ok ? (
					<>Por la <b>holgura complementaria</b> αᵢ[yᵢf(xᵢ) − 1] = 0, todo punto estrictamente fuera de la banda tiene αᵢ = 0 y no aparece en w = Σ αᵢyᵢxᵢ. Por eso el modelo final se guarda con muy pocos puntos y predecir es barato. La contracara: el SVM es sensible a los puntos cercanos a la frontera (justo los más probables de estar mal etiquetados).</>
				) : (
					<>Cruzaste un punto al otro lado: las clases ya no son separables y el margen duro es <b>infactible</b> (no existe ningún w, b). Hace falta el <a href="/svm/margen-suave/">margen suave</a> con holguras ξᵢ.</>
				)}
			</div>
		</div>
	);
}

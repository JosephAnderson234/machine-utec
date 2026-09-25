import { useState } from 'react';
import Plot, { Path, CA, CM, CV, C1, Slider, Stat, Legend } from '../ui/Plot';
import { range, fmt } from '../ui/math';

// Forma de las elipses del costo: (β−β̂)ᵀ A (β−β̂), con features correlacionados
const A = [
	[1.0, 0.55],
	[0.55, 1.6],
];
const q = (b: number[], c: number[]) => {
	const d0 = b[0] - c[0],
		d1 = b[1] - c[1];
	return A[0][0] * d0 * d0 + 2 * A[0][1] * d0 * d1 + A[1][1] * d1 * d1;
};
// autovalores/vectores de A para dibujar las elipses
const tr = A[0][0] + A[1][1],
	det = A[0][0] * A[1][1] - A[0][1] ** 2;
const l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det),
	l2 = tr / 2 - Math.sqrt(tr * tr / 4 - det);
const ang = (Math.atan2(l1 - A[0][0], A[0][1]) * 180) / Math.PI; // dirección del autovector de l1

function constrained(c: number[], t: number, kind: 'l1' | 'l2') {
	const inside = kind === 'l2' ? Math.hypot(c[0], c[1]) <= t : Math.abs(c[0]) + Math.abs(c[1]) <= t;
	if (inside) return c;
	let best = [0, 0],
		bv = Infinity;
	const N = 4000;
	for (let i = 0; i < N; i++) {
		const th = (2 * Math.PI * i) / N;
		let p: number[];
		if (kind === 'l2') p = [t * Math.cos(th), t * Math.sin(th)];
		else {
			const cx = Math.cos(th),
				cy = Math.sin(th);
			const r = t / (Math.abs(cx) + Math.abs(cy));
			p = [r * cx, r * cy];
		}
		const v = q(p, c);
		if (v < bv) { bv = v; best = p; }
	}
	// ajusta a la esquina exacta si está muy cerca de un eje
	if (kind === 'l1') best = best.map((v) => (Math.abs(v) < t * 0.004 ? 0 : v));
	return best;
}

/** Geometría de ridge vs lasso: el presupuesto ‖β‖ ≤ t y dónde lo toca la elipse del costo. */
export default function L1L2Geometry() {
	const [c, setC] = useState([2.2, 1.3]);
	const [t, setT] = useState(1.2);
	const [drag, setDrag] = useState(false);
	const [lam, setLam] = useState(1);
	const r2 = constrained(c, t, 'l2');
	const r1 = constrained(c, t, 'l1');

	const ellipse = (s: any, level: number, color: string, op = 0.55, key?: string) => {
		const u = s.X(1) - s.X(0);
		return (
			<ellipse
				key={key}
				cx={s.X(c[0])}
				cy={s.Y(c[1])}
				rx={Math.sqrt(level / l1) * u}
				ry={Math.sqrt(level / l2) * u}
				transform={`rotate(${-ang} ${s.X(c[0])} ${s.Y(c[1])})`}
				fill="none"
				stroke={color}
				strokeOpacity={op}
				strokeWidth={1.3}
			/>
		);
	};
	const panel = (kind: 'l1' | 'l2') => {
		const sol = kind === 'l1' ? r1 : r2;
		const lv = q(sol, c);
		return (
			<Plot
				x={[-3, 3]}
				y={[-2.6, 2.6]}
				w={400}
				h={346}
				xlabel="β₁"
				ylabel="β₂"
				onPointerDown={(e, s) => {
					const [x, y] = s.toData(e);
					if (Math.hypot(x - c[0], y - c[1]) < 0.45) { setDrag(true); (e.target as Element).setPointerCapture?.(e.pointerId); }
				}}
				onPointerMove={(e, s) => { if (drag) { const [x, y] = s.toData(e); setC([+x.toFixed(2), +y.toFixed(2)]); } }}
				onPointerUp={() => setDrag(false)}
			>
				{(s) => (
					<>
						<line x1={s.X(-3)} x2={s.X(3)} y1={s.Y(0)} y2={s.Y(0)} stroke={CM} strokeOpacity={0.5} />
						<line x1={s.X(0)} x2={s.X(0)} y1={s.Y(-3)} y2={s.Y(3)} stroke={CM} strokeOpacity={0.5} />
						{kind === 'l2' ? (
							<circle cx={s.X(0)} cy={s.Y(0)} r={t * (s.X(1) - s.X(0))} fill={CA} fillOpacity={0.14} stroke={CA} strokeWidth={1.6} />
						) : (
							<polygon points={[[t, 0], [0, t], [-t, 0], [0, -t]].map(([a, b]) => `${s.X(a)},${s.Y(b)}`).join(' ')} fill={CV} fillOpacity={0.14} stroke={CV} strokeWidth={1.6} />
						)}
						{[0.15, 0.5, 1.2].map((f) => (lv > 0 ? ellipse(s, lv * f, CM, 0.35, `e${f}`) : null))}
						{lv > 0 && ellipse(s, lv, C1, 0.95)}
						<circle className="drag" cx={s.X(c[0])} cy={s.Y(c[1])} r={7} fill={C1} stroke="var(--pg-surface)" strokeWidth={2} />
						<text x={s.X(c[0]) + 10} y={s.Y(c[1]) - 8} fontSize={12} fill="var(--sl-color-white)">β̂ OLS</text>
						<circle cx={s.X(sol[0])} cy={s.Y(sol[1])} r={6.5} fill={kind === 'l1' ? CV : CA} stroke="var(--pg-surface)" strokeWidth={2} />
					</>
				)}
			</Plot>
		);
	};

	const as = range(-3, 3, 121);
	const gamma = lam / 2;

	return (
		<div className="pg not-content">
			<h4>¿Por qué el lasso produce ceros? La geometría</h4>
			<p className="pg-sub">Arrastra β̂ (el óptimo sin penalización, en naranja). La solución penalizada es el punto donde la elipse de costo más pequeña <b>toca por primera vez</b> la región del presupuesto: el disco ℓ2 (ridge) o el rombo ℓ1 (lasso).</p>
			<Slider label="presupuesto t (t pequeño ⇔ λ grande)" value={t} min={0.1} max={3} step={0.05} onChange={setT} />
			<div className="pg-grid-2">
				<div>
					<span className="lane-label">Ridge · ‖β‖₂ ≤ t</span>
					{panel('l2')}
				</div>
				<div>
					<span className="lane-label">Lasso · ‖β‖₁ ≤ t</span>
					{panel('l1')}
				</div>
			</div>
			<div className="pg-stats">
				<Stat k="β ridge" v={`(${fmt(r2[0], 2)}, ${fmt(r2[1], 2)})`} />
				<Stat k="β lasso" v={`(${fmt(r1[0], 2)}, ${fmt(r1[1], 2)})`} color={r1.some((v) => v === 0) ? 'var(--pg-ok)' : undefined} />
				<Stat k="ceros en lasso" v={r1.filter((v) => v === 0).length} />
			</div>
			<div className="pg-note">
				El disco es <b>redondo</b>: el contacto cae en un punto genérico con ambas coordenadas ≠ 0. El rombo tiene <b>esquinas sobre los ejes</b>: con frecuencia la elipse toca primero una esquina y una coordenada queda exactamente en 0 (selección de features). Achica t y mira cómo el lasso pasa a una esquina.
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid var(--pg-border)', width: '100%' }} />
			<h4>El mecanismo en 1-D: encoger vs umbralizar</h4>
			<p className="pg-sub">Con features no correlacionados cada peso resuelve min (w − a)² + λΩ(w), donde a = w_OLS.</p>
			<Slider label="λ" value={lam} min={0} max={4} step={0.05} onChange={setLam} />
			<Plot x={[-3, 3]} y={[-3, 3]} h={330} xlabel="coeficiente de mínimos cuadrados a" ylabel="coeficiente penalizado w">
				{(s) => (
					<>
						<rect x={s.X(-gamma)} y={s.y1} width={s.X(gamma) - s.X(-gamma)} height={s.y0 - s.y1} fill={CV} opacity={0.08} />
						<Path pts={as.map((a) => [a, a])} s={s} color={CM} dash="5 5" />
						<Path pts={as.map((a) => [a, a / (1 + lam)])} s={s} color={CA} width={2.4} />
						<Path pts={as.map((a) => [a, Math.sign(a) * Math.max(Math.abs(a) - gamma, 0)])} s={s} color={CV} width={2.4} />
					</>
				)}
			</Plot>
			<Legend items={[[CM, 'sin penalización w = a', 'd'], [CA, 'ridge: w = a/(1+λ)'], [CV, `lasso: soft-threshold, zona muerta |a| ≤ ${gamma.toFixed(2)}`]]} />
			<div className="pg-note">
				Ridge <b>escala</b> cada peso (nunca llega a 0: es una perilla de volumen). Lasso <b>resta</b> un γ constante y recorta a 0 todo lo que cae en la zona muerta (un botón de mute): cerca de 0 la pendiente de |w| es constante y domina a los pesos pequeños.
			</div>
		</div>
	);
}

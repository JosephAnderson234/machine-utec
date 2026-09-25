import { useMemo, useState } from 'react';
import Plot, { useMounted, C0, C1, CA, Slider, Stat, Legend } from '../ui/Plot';
import { heatmap, probColor, rng, sigmoid, fmt } from '../ui/math';

type Cls = { mu: number[]; s1: number; s2: number; rho: number };
type M2 = number[][];
const cov = (c: Cls): M2 => [
	[c.s1 * c.s1, c.rho * c.s1 * c.s2],
	[c.rho * c.s1 * c.s2, c.s2 * c.s2],
];
const det = (S: M2) => S[0][0] * S[1][1] - S[0][1] * S[1][0];
const inv = (S: M2): M2 => {
	const d = det(S);
	return [
		[S[1][1] / d, -S[0][1] / d],
		[-S[1][0] / d, S[0][0] / d],
	];
};
const maha = (x: number[], mu: number[], Si: M2) => {
	const a = x[0] - mu[0],
		b = x[1] - mu[1];
	return a * (Si[0][0] * a + Si[0][1] * b) + b * (Si[1][0] * a + Si[1][1] * b);
};
function eig(S: M2) {
	const tr = S[0][0] + S[1][1],
		d = det(S);
	const disc = Math.sqrt(Math.max(tr * tr / 4 - d, 0));
	const l1 = tr / 2 + disc,
		l2 = tr / 2 - disc;
	const ang = Math.abs(S[0][1]) < 1e-12 ? (S[0][0] >= S[1][1] ? 0 : 90) : (Math.atan2(l1 - S[0][0], S[0][1]) * 180) / Math.PI;
	return { l1, l2, ang };
}

/** LDA, QDA y Naive Bayes gaussiano: el mismo recipe, tres supuestos sobre Σ. */
export default function GaussianClassifier() {
	const [c0, setC0] = useState<Cls>({ mu: [-1.5, -0.5], s1: 1.2, s2: 0.7, rho: 0.5 });
	const [c1, setC1] = useState<Cls>({ mu: [1.5, 0.8], s1: 0.6, s2: 1.3, rho: -0.3 });
	const [mode, setMode] = useState<'qda' | 'lda' | 'nb'>('qda');
	const [pi1, setPi1] = useState(0.5);
	const [drag, setDrag] = useState<0 | 1 | null>(null);
	const [q, setQ] = useState<number[] | null>([0.3, 2.2]);
	const [edit, setEdit] = useState<0 | 1>(0);

	const samples = useMemo(() => {
		const r = rng(11);
		const draw = (c: Cls) =>
			Array.from({ length: 50 }, () => {
				const z1 = r.normal(),
					z2 = r.normal();
				return [c.mu[0] + c.s1 * z1, c.mu[1] + c.s2 * (c.rho * z1 + Math.sqrt(1 - c.rho * c.rho) * z2)];
			});
		return [draw(c0), draw(c1)];
	}, [c0, c1]);

	// covarianzas que usa el modelo según el supuesto
	const S0t = cov(c0),
		S1t = cov(c1);
	const pooled: M2 = S0t.map((row, i) => row.map((v, j) => (1 - pi1) * v + pi1 * S1t[i][j]));
	const diag = (S: M2): M2 => [
		[S[0][0], 0],
		[0, S[1][1]],
	];
	const S = mode === 'qda' ? [S0t, S1t] : mode === 'lda' ? [pooled, pooled] : [diag(S0t), diag(S1t)];
	const Si = S.map(inv);
	const mus = [c0.mu, c1.mu];
	const pis = [1 - pi1, pi1];
	const delta = (x: number[], k: number) => Math.log(pis[k]) - 0.5 * maha(x, mus[k], Si[k]) - 0.5 * Math.log(det(S[k]));
	const post1 = (x: number[]) => sigmoid(delta(x, 1) - delta(x, 0));

	const mounted = useMounted();
	const img = useMemo(() => !mounted ? '' : heatmap((x, y) => post1([x, y]), [-5, 5], [-4, 4], probColor, 110), [JSON.stringify(S), JSON.stringify(mus), pi1, mounted]);

	const ell = (s: any, k: number, color: string) => {
		const { l1, l2, ang } = eig(S[k]);
		const u = s.X(1) - s.X(0);
		return [1, 2].map((m) => (
			<ellipse key={`${k}${m}`} cx={s.X(mus[k][0])} cy={s.Y(mus[k][1])} rx={m * Math.sqrt(l1) * u} ry={m * Math.sqrt(Math.max(l2, 1e-6)) * u} transform={`rotate(${-ang} ${s.X(mus[k][0])} ${s.Y(mus[k][1])})`} fill="none" stroke={color} strokeWidth={m === 1 ? 2.2 : 1.2} strokeDasharray={m === 2 ? '5 4' : undefined} />
		));
	};

	const cur = edit === 0 ? c0 : c1;
	const setCur = (c: Cls) => (edit === 0 ? setC0(c) : setC1(c));

	return (
		<div className="pg not-content">
			<h4>Cada clase es una gaussiana; la frontera sale sola</h4>
			<p className="pg-sub">Arrastra los centros μ (cruces). Ajusta la forma de cada clase. Cambia el supuesto sobre Σ y observa la frontera (donde el color pasa por blanco, P = 0.5). Haz clic en cualquier otro lugar para evaluar un punto.</p>
			<div className="pg-row">
				<div className="pg-seg">
					<button className={mode === 'qda' ? 'active' : ''} onClick={() => setMode('qda')}>QDA · Σₖ propia</button>
					<button className={mode === 'lda' ? 'active' : ''} onClick={() => setMode('lda')}>LDA · Σ compartida</button>
					<button className={mode === 'nb' ? 'active' : ''} onClick={() => setMode('nb')}>Naive Bayes · Σₖ diagonal</button>
				</div>
			</div>
			<div className="pg-row">
				<div className="pg-seg">
					<button className={edit === 0 ? 'active' : ''} onClick={() => setEdit(0)} style={{ borderColor: C0 }}>Editar clase 0</button>
					<button className={edit === 1 ? 'active' : ''} onClick={() => setEdit(1)} style={{ borderColor: C1 }}>Editar clase 1</button>
				</div>
				<Slider label="σ₁" value={cur.s1} min={0.3} max={2.2} step={0.05} onChange={(v) => setCur({ ...cur, s1: v })} />
				<Slider label="σ₂" value={cur.s2} min={0.3} max={2.2} step={0.05} onChange={(v) => setCur({ ...cur, s2: v })} />
				<Slider label="correlación ρ" value={cur.rho} min={-0.9} max={0.9} step={0.05} onChange={(v) => setCur({ ...cur, rho: v })} />
				<Slider label="prior π₁" value={pi1} min={0.05} max={0.95} step={0.05} onChange={setPi1} />
			</div>
			<Plot
				x={[-5, 5]}
				y={[-4, 4]}
				h={420}
				xlabel="x₁"
				ylabel="x₂"
				onPointerDown={(e, s) => {
					const [x, y] = s.toData(e);
					const d0 = Math.hypot(x - c0.mu[0], y - c0.mu[1]),
						d1 = Math.hypot(x - c1.mu[0], y - c1.mu[1]);
					if (Math.min(d0, d1) < 0.4) { setDrag(d0 < d1 ? 0 : 1); (e.target as Element).setPointerCapture?.(e.pointerId); }
					else setQ([x, y]);
				}}
				onPointerMove={(e, s) => {
					if (drag === null) return;
					const [x, y] = s.toData(e);
					const mu = [Math.max(-4.5, Math.min(4.5, x)), Math.max(-3.6, Math.min(3.6, y))];
					drag === 0 ? setC0({ ...c0, mu }) : setC1({ ...c1, mu });
				}}
				onPointerUp={() => setDrag(null)}
			>
				{(s) => (
					<>
						{img && <image href={img} x={s.X(-5)} y={s.Y(4)} width={s.X(5) - s.X(-5)} height={s.Y(-4) - s.Y(4)} preserveAspectRatio="none" />}
						{samples[0].map((p, i) => <circle key={`a${i}`} cx={s.X(p[0])} cy={s.Y(p[1])} r={2.6} fill={C0} opacity={0.75} />)}
						{samples[1].map((p, i) => <circle key={`b${i}`} cx={s.X(p[0])} cy={s.Y(p[1])} r={2.6} fill={C1} opacity={0.75} />)}
						{ell(s, 0, C0)}
						{ell(s, 1, C1)}
						{[0, 1].map((k) => (
							<g key={k} className="drag">
								<circle cx={s.X(mus[k][0])} cy={s.Y(mus[k][1])} r={11} fill="var(--pg-surface)" opacity={0.7} />
								<path d={`M${s.X(mus[k][0]) - 7},${s.Y(mus[k][1])}h14M${s.X(mus[k][0])},${s.Y(mus[k][1]) - 7}v14`} stroke={k ? C1 : C0} strokeWidth={3} />
							</g>
						))}
						{q && <circle cx={s.X(q[0])} cy={s.Y(q[1])} r={6} fill={CA} stroke="var(--pg-surface)" strokeWidth={2} />}
					</>
				)}
			</Plot>
			<Legend items={[[C0, 'clase 0: μ₀, elipses a 1σ y 2σ'], [C1, 'clase 1: μ₁'], [CA, 'punto consultado']]} />
			{q && (
				<div className="pg-stats">
					<Stat k="Mahalanobis² a μ₀" v={fmt(maha(q, mus[0], Si[0]), 2)} />
					<Stat k="Mahalanobis² a μ₁" v={fmt(maha(q, mus[1], Si[1]), 2)} />
					<Stat k="δ₀(x)" v={fmt(delta(q, 0), 2)} />
					<Stat k="δ₁(x)" v={fmt(delta(q, 1), 2)} />
					<Stat k="P(y = 1 | x)" v={post1(q).toFixed(3)} color="var(--sl-color-accent)" />
				</div>
			)}
			<div className="pg-note">
				{mode === 'lda' && <>Ambas clases usan la <b>misma</b> Σ agrupada (mismas elipses, solo cambia el centro): el término cuadrático xᵀΣ⁻¹x se cancela y la frontera es una <b>recta</b>. Su posterior es exactamente σ(wᵀx + b) con w = Σ⁻¹(μ₁ − μ₀).</>}
				{mode === 'qda' && <>Cada clase conserva su Σₖ: el término xᵀΣₖ⁻¹x sobrevive y la frontera es <b>cuadrática</b> (puede envolver a la clase más compacta). Más parámetros ⇒ más varianza ⇒ necesita más datos.</>}
				{mode === 'nb' && <>Naive Bayes asume features independientes dada la clase: Σₖ <b>diagonal</b>, elipses sin inclinación (alineadas a los ejes) aunque los datos estén correlacionados. La frontera igual puede curvarse.</>}{' '}
				Mueve el prior: la frontera se desliza hacia la clase <b>más rara</b>, achicando su territorio.
			</div>
		</div>
	);
}

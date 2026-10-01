import { useEffect, useState } from 'react';
import Plot, { Path, C1, CV, Legend, Stat } from '../ui/Plot';
import { rng, sigmoid } from '../ui/math';

const NS = [4, 8, 16, 32, 64, 128, 256];
const DI = 30; // modo independiente: muchas features débiles
const DC = 6; // modo correlacionado

type Mode = 'indep' | 'corr';

/** Datos: 2 clases gaussianas. En modo «corr» las features son copias ruidosas de una sola señal (NB se equivoca). */
export function sample(r: ReturnType<typeof rng>, n: number, mode: Mode) {
	const X: number[][] = [],
		y: number[] = [];
	for (let i = 0; i < n; i++) {
		const c = i % 2;
		const sgn = c ? 1 : -1;
		if (mode === 'indep') {
			X.push(Array.from({ length: DI }, () => sgn * 0.22 + r.normal()));
		} else {
			const z = sgn * 0.6 + r.normal();
			// 5 copias casi idénticas de la misma señal + 1 feature informativa independiente
			X.push(Array.from({ length: DC }, (_, j) => (j < 5 ? z + 0.15 * r.normal() : -sgn * 0.5 + r.normal())));
		}
		y.push(c);
	}
	return { X, y };
}

export function gnb(X: number[][], y: number[]) {
	const D = X[0].length;
	// NB gaussiano con varianza por feature agrupada entre clases (más estable con pocos datos)
	const st = [0, 1].map((c) => {
		const rows = X.filter((_, i) => y[i] === c);
		const mu = Array.from({ length: D }, (_, j) => rows.reduce((s, r) => s + r[j], 0) / Math.max(1, rows.length));
		return { mu, pi: rows.length / X.length };
	});
	const v = Array.from({ length: D }, (_, j) => X.reduce((s, r, i) => s + (r[j] - st[y[i]].mu[j]) ** 2, 0) / X.length + 0.05);
	return (x: number[]) => {
		const sc = st.map((s) => Math.log(s.pi || 1e-9) + x.reduce((a, xj, j) => a - (xj - s.mu[j]) ** 2 / (2 * v[j]), 0));
		return sc[1] > sc[0] ? 1 : 0;
	};
}

export function logreg(X: number[][], y: number[]) {
	const D = X[0].length;
	const w = new Array(D).fill(0);
	let b = 0;
	const lam = 1e-4;
	for (let it = 0; it < 1500; it++) {
		const g = new Array(D).fill(0);
		let gb = 0;
		for (let i = 0; i < X.length; i++) {
			const e = sigmoid(X[i].reduce((s, v, j) => s + v * w[j], b)) - y[i];
			for (let j = 0; j < D; j++) g[j] += e * X[i][j];
			gb += e;
		}
		for (let j = 0; j < D; j++) w[j] -= 1.0 * (g[j] / X.length + lam * w[j]);
		b -= (1.0 * gb) / X.length;
	}
	return (x: number[]) => (x.reduce((s, v, j) => s + v * w[j], b) >= 0 ? 1 : 0);
}

/** Curvas de aprendizaje: Naive Bayes (generativo) vs regresión logística (discriminativo), Ng & Jordan (2001). */
export default function GenDiscCurves() {
	const [mode, setMode] = useState<Mode>('indep');
	const [res, setRes] = useState<{ nb: number[]; lr: number[] } | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		setBusy(true);
		const id = setTimeout(() => {
			const r = rng(mode === 'indep' ? 11 : 23);
			const test = sample(r, 1000, mode);
			const reps = 12;
			const nb: number[] = [],
				lr: number[] = [];
			for (const n of NS) {
				let eNb = 0,
					eLr = 0;
				for (let k = 0; k < reps; k++) {
					const tr = sample(r, n, mode);
					const f1 = gnb(tr.X, tr.y),
						f2 = logreg(tr.X, tr.y);
					let a = 0,
						c = 0;
					test.X.forEach((x, i) => {
						a += f1(x) !== test.y[i] ? 1 : 0;
						c += f2(x) !== test.y[i] ? 1 : 0;
					});
					eNb += a / test.X.length;
					eLr += c / test.X.length;
				}
				nb.push(eNb / reps);
				lr.push(eLr / reps);
			}
			setRes({ nb, lr });
			setBusy(false);
		}, 30);
		return () => clearTimeout(id);
	}, [mode]);

	const lx = (n: number) => Math.log2(n);
	const ymax = res ? Math.min(0.55, Math.max(...res.nb, ...res.lr) * 1.15) : 0.5;
	const ymin = res ? Math.max(0, Math.min(...res.nb, ...res.lr) * 0.85) : 0;

	return (
		<div className="pg not-content">
			<h4>¿Pocos datos o muchos? Generativo vs discriminativo</h4>
			<p className="pg-sub">Se entrenan Naive Bayes gaussiano (varianza por feature compartida entre clases) y regresión logística casi sin regularizar con n ejemplos (promedio de 12 repeticiones) y se mide el error en 1000 puntos de test. Todo se calcula en tu navegador.</p>
			<div className="pg-seg">
				<button className={mode === 'indep' ? 'active' : ''} onClick={() => setMode('indep')}>Supuesto de NB correcto (features independientes)</button>
				<button className={mode === 'corr' ? 'active' : ''} onClick={() => setMode('corr')}>Supuesto violado (features redundantes)</button>
			</div>
			<Plot x={[1.6, 8.4]} y={[ymin, ymax]} h={300} xlabel="ejemplos de entrenamiento n (escala logarítmica)" ylabel="error de test" xticks={[]}>
				{(s) =>
					res ? (
						<>
							<Path pts={NS.map((n, i) => [lx(n), res.nb[i]])} s={s} color={CV} width={2.6} />
							<Path pts={NS.map((n, i) => [lx(n), res.lr[i]])} s={s} color={C1} width={2.6} />
							{NS.map((n, i) => (
								<g key={n}>
									<circle cx={s.X(lx(n))} cy={s.Y(res.nb[i])} r={3.5} fill={CV} />
									<circle cx={s.X(lx(n))} cy={s.Y(res.lr[i])} r={3.5} fill={C1} />
									<text x={s.X(lx(n))} y={s.y0 - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--pg-muted)">n={n}</text>
								</g>
							))}
						</>
					) : null
				}
			</Plot>
			<Legend items={[[CV, 'Naive Bayes (generativo)'], [C1, 'regresión logística (discriminativa)']]} />
			{res && (
				<div className="pg-stats">
					<Stat k="error con n = 64 · NB / logística" v={`${(100 * res.nb[4]).toFixed(1)}% / ${(100 * res.lr[4]).toFixed(1)}%`} />
					<Stat k="error con n = 256 · NB / logística" v={`${(100 * res.nb[6]).toFixed(1)}% / ${(100 * res.lr[6]).toFixed(1)}%`} />
				</div>
			)}
			<div className="pg-note">
				{busy && <>Simulando… </>}
				{mode === 'indep' ? (
					<>30 features débiles e independientes (el supuesto de NB es cierto). NB solo estima una media por clase y una varianza por feature, así que <b>aprende mucho más rápido</b>: con ~64 ejemplos ya está donde la logística llega recién con ~256. La logística tiene que aprender 31 pesos con poca regularización y con pocos datos sobreajusta (con n &lt; d las clases son separables).</>
				) : (
					<>Con 5 features casi idénticas, NB <b>cuenta cinco veces la misma evidencia</b> (supone independencia) y se sobreconfía: su error se estanca más arriba. La logística aprende a repartir el peso entre las copias y, con datos suficientes, <b>termina más abajo</b>. Esa es la regla práctica de Ng & Jordan.</>
				)}
			</div>
		</div>
	);
}

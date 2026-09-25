import { useEffect, useMemo, useState } from 'react';
import Plot, { Path, CA, CM, CV, C0, C1, Slider, Stat, Legend } from '../ui/Plot';
import { polyEval, polyRow, ridge, rmse, sineData, rng, mean } from '../ui/math';

const DEG = 9;
const LOGS = Array.from({ length: 29 }, (_, i) => -7 + i * 0.3); // log10 λ

function fitScore(train: { x: number; y: number }[], val: { x: number; y: number }[], lam: number) {
	const w = ridge(train.map((p) => polyRow(p.x, DEG)), train.map((p) => p.y), lam);
	return rmse(val.map((p) => polyEval(w, p.x)), val.map((p) => p.y));
}

/** K-fold: diagrama animado + por qué una sola partición es una lotería. */
export default function KFold() {
	const [K, setK] = useState(5);
	const [seed, setSeed] = useState(7);
	const [active, setActive] = useState(0);

	useEffect(() => {
		const id = setInterval(() => setActive((a) => (a + 1) % K), 1300);
		return () => clearInterval(id);
	}, [K]);

	const { cv, cvSe, singles, bestCV, oneSE } = useMemo(() => {
		const data = sineData(30, 0.25, seed);
		const r = rng(seed * 13 + 1);
		const perm = data.map((_, i) => i).sort(() => r.next() - 0.5);
		const cv: number[] = [];
		const cvSe: number[] = [];
		for (const lg of LOGS) {
			const scores: number[] = [];
			for (let k = 0; k < K; k++) {
				const valIdx = new Set(perm.filter((_, j) => j % K === k));
				scores.push(fitScore(data.filter((_, i) => !valIdx.has(i)), data.filter((_, i) => valIdx.has(i)), Math.pow(10, lg)));
			}
			const m = mean(scores);
			cv.push(m);
			cvSe.push(Math.sqrt(mean(scores.map((v) => (v - m) ** 2)) / Math.sqrt(K)));
		}
		const singles: number[][] = [];
		for (let t = 0; t < 8; t++) {
			const rr = rng(seed * 31 + t * 7 + 2);
			const idx = data.map((_, i) => i).sort(() => rr.next() - 0.5);
			const tr = idx.slice(0, 15).map((i) => data[i]);
			const va = idx.slice(15).map((i) => data[i]);
			singles.push(LOGS.map((lg) => fitScore(tr, va, Math.pow(10, lg))));
		}
		const bi = cv.indexOf(Math.min(...cv));
		const thr = cv[bi] + cvSe[bi];
		let oneSE = bi;
		for (let i = LOGS.length - 1; i >= bi; i--) if (cv[i] <= thr) { oneSE = i; break; }
		return { cv, cvSe, singles, bestCV: bi, oneSE };
	}, [K, seed]);

	const cellW = 100 / K;
	return (
		<div className="pg not-content">
			<h4>Validación cruzada K-fold</h4>
			<p className="pg-sub">Cada bloque se turna como validación; se entrena con los K−1 restantes y se promedian los K errores. El test set <b>no participa</b>: queda aparte y se usa una sola vez al final.</p>
			<Slider label="K (número de folds)" value={K} min={2} max={10} step={1} onChange={(v) => { setK(v); setActive(0); }} />
			<div style={{ display: 'flex', gap: '0.8rem', alignItems: 'stretch' }}>
				<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
					{Array.from({ length: K }, (_, f) => (
						<div key={f} style={{ display: 'flex', gap: 3, alignItems: 'center', opacity: f === active ? 1 : 0.45, transition: 'opacity .3s' }}>
							<span className="mono" style={{ width: '3.6rem', fontSize: '0.72rem', color: 'var(--pg-muted)' }}>fold {f + 1}</span>
							{Array.from({ length: K }, (_, b) => (
								<div key={b} style={{ width: `${cellW}%`, height: 20, borderRadius: 5, background: b === f ? C1 : C0, opacity: b === f ? 0.95 : 0.5, transition: 'background .3s' }} />
							))}
						</div>
					))}
				</div>
				<div style={{ width: '14%', borderRadius: 8, background: 'repeating-linear-gradient(135deg, var(--pg-tile) 0 6px, var(--pg-surface-2) 6px 12px)', display: 'grid', placeItems: 'center', fontSize: '0.72rem', color: 'var(--pg-muted)', textAlign: 'center', padding: 4 }}>
					test
					<br />
					(guardado)
				</div>
			</div>
			<Legend items={[[C0, 'entrena'], [C1, 'valida (se rota)']]} />
			<hr style={{ border: 'none', borderTop: '1px solid var(--pg-border)', width: '100%' }} />
			<h4>Una sola partición es una lotería</h4>
			<p className="pg-sub">Ridge con polinomio de grado {DEG} sobre 30 puntos. Las curvas finas son 8 particiones 50/50 al azar; la gruesa es el promedio {K}-fold (la banda es ±1 error estándar).</p>
			<button onClick={() => setSeed(seed + 1)} style={{ alignSelf: 'flex-start' }}>Nuevos datos</button>
			<Plot x={[-7, 1.4]} y={[0.1, 1.2]} h={330} xlabel="log₁₀ λ" ylabel="RMSE de validación">
				{(s) => (
					<>
						{singles.map((c, t) => {
							const bi = c.indexOf(Math.min(...c));
							return (
								<g key={t}>
									<Path pts={LOGS.map((l, i) => [l, c[i]])} s={s} color={CM} width={1} opacity={0.5} />
									<line x1={s.X(LOGS[bi])} x2={s.X(LOGS[bi])} y1={s.y0} y2={s.y0 - 12} stroke={CM} strokeWidth={2} />
								</g>
							);
						})}
						<path
							d={
								LOGS.map((l, i) => `${i ? 'L' : 'M'}${s.X(l)},${s.Y(cv[i] + cvSe[i])}`).join('') +
								[...LOGS].reverse().map((l, j) => { const i = LOGS.length - 1 - j; return `L${s.X(l)},${s.Y(cv[i] - cvSe[i])}`; }).join('') + 'Z'
							}
							fill={CA}
							opacity={0.15}
						/>
						<Path pts={LOGS.map((l, i) => [l, cv[i]])} s={s} color={CA} width={3} />
						<circle cx={s.X(LOGS[bestCV])} cy={s.Y(cv[bestCV])} r={6} fill={CA} />
						<circle cx={s.X(LOGS[oneSE])} cy={s.Y(cv[oneSE])} r={7} fill="none" stroke={CV} strokeWidth={2} />
					</>
				)}
			</Plot>
			<Legend items={[[CM, 'una partición 50/50 (marca: su «mejor λ»)'], [CA, `media ${K}-fold ± 1 SE`], [CV, 'regla de 1 SE']]} />
			<div className="pg-stats">
				<Stat k="λ con mínimo CV" v={`10^${LOGS[bestCV].toFixed(1)}`} />
				<Stat k="λ por regla 1-SE" v={`10^${LOGS[oneSE].toFixed(1)}`} color={CV} />
			</div>
			<div className="pg-note">
				Las marcas de las particiones individuales se esparcen varios órdenes de magnitud: el «mejor λ» depende de qué puntos cayeron en validación. Promediar folds da una curva suave y estable. <b>Regla de 1 SE</b>: entre los λ cuyo error está a menos de un error estándar del mínimo, toma el más fuerte (modelo más simple, gratis).
			</div>
		</div>
	);
}

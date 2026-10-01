import { useMemo, useState } from 'react';
import Plot, { Path, CA, C0, C1, CV, CR, Slider, Stat, Legend } from '../ui/Plot';
import { range, rng } from '../ui/math';

/** Autovalores de una matriz simétrica (método de Jacobi). */
function eigSym(A0: number[][]): number[] {
	const n = A0.length;
	const A = A0.map((r) => [...r]);
	for (let sweep = 0; sweep < 60; sweep++) {
		let off = 0;
		for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] ** 2;
		if (off < 1e-14) break;
		for (let p = 0; p < n; p++)
			for (let q = p + 1; q < n; q++) {
				if (Math.abs(A[p][q]) < 1e-15) continue;
				const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
				const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
				const c = 1 / Math.sqrt(t * t + 1),
					s = t * c;
				for (let k = 0; k < n; k++) {
					const akp = A[k][p],
						akq = A[k][q];
					A[k][p] = c * akp - s * akq;
					A[k][q] = s * akp + c * akq;
				}
				for (let k = 0; k < n; k++) {
					const apk = A[p][k],
						aqk = A[q][k];
					A[p][k] = c * apk - s * aqk;
					A[q][k] = s * apk + c * aqk;
				}
			}
	}
	return A.map((r, i) => r[i]).sort((a, b) => a - b);
}

type KName = 'rbf' | 'poly' | 'lin' | 'negdist' | 'tanh';
const KN: Record<KName, string> = { rbf: 'RBF', poly: 'polinómico (1 + xᵀx′)³', lin: 'lineal', negdist: '«impostor»: −‖x − x′‖²', tanh: 'sigmoide tanh(2xᵀx′ − 1)' };

/** Kernels como similitudes: forma local/global y la matriz de Gram con su prueba de PSD. */
export default function KernelShapes() {
	const [anchor, setAnchor] = useState(0.5);
	const [g, setG] = useState(1);
	const [kn, setKn] = useState<KName>('rbf');
	const xs = range(-3, 3, 240);

	const pts = useMemo(() => {
		const r = rng(5);
		const a = Array.from({ length: 14 }, () => [-1.3 + 0.5 * r.normal(), 0.8 + 0.5 * r.normal()]);
		const b = Array.from({ length: 14 }, () => [1.2 + 0.5 * r.normal(), -0.6 + 0.5 * r.normal()]);
		return [...a, ...b];
	}, []);
	const K = (u: number[], v: number[]) => {
		const dot = u[0] * v[0] + u[1] * v[1];
		const d2 = (u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2;
		if (kn === 'rbf') return Math.exp(-g * d2);
		if (kn === 'poly') return (1 + dot) ** 3;
		if (kn === 'lin') return dot;
		if (kn === 'negdist') return -d2;
		return Math.tanh(2 * dot - 1);
	};
	const G = pts.map((u) => pts.map((v) => K(u, v)));
	const ev = useMemo(() => eigSym(G), [kn, g]);
	const minEv = ev[0];
	const gmax = Math.max(...G.flat().map(Math.abs)) || 1;
	const cell = 300 / pts.length;
	const color = (v: number) => {
		const t = v / gmax;
		return t >= 0 ? `rgba(54, 200, 170, ${0.1 + 0.85 * t})` : `rgba(230, 90, 100, ${0.1 + 0.85 * -t})`;
	};

	return (
		<div className="pg not-content">
			<h4>Un kernel es una similitud: local vs global</h4>
			<p className="pg-sub">K(x, ancla) en 1-D mientras x se mueve. El lineal crece sin límite, el polinómico tiene alcance global y el RBF es una campana local cuyo ancho fija γ.</p>
			<div className="pg-row">
				<Slider label="posición del ancla x′" value={anchor} min={-2} max={2} step={0.05} onChange={setAnchor} />
				<Slider label="γ del RBF" value={g} min={0.1} max={8} step={0.1} onChange={setG} />
			</div>
			<Plot x={[-3, 3]} y={[-2, 4]} h={280} xlabel="x (el otro punto en el ancla)" ylabel="K(x, x′)">
				{(s) => (
					<>
						<line x1={s.X(anchor)} x2={s.X(anchor)} y1={s.y0} y2={s.y1} stroke="var(--pg-border)" strokeDasharray="4 4" />
						<Path pts={xs.map((x) => [x, x * anchor])} s={s} color={C0} width={2} />
						<Path pts={xs.map((x) => [x, (1 + x * anchor) ** 3 / 4])} s={s} color={C1} width={2} />
						<Path pts={xs.map((x) => [x, Math.exp(-g * (x - anchor) ** 2)])} s={s} color={CA} width={2.8} />
						<Path pts={xs.map((x) => [x, Math.exp(-(g / 6) * (x - anchor) ** 2)])} s={s} color={CV} width={2} dash="5 4" />
					</>
				)}
			</Plot>
			<Legend items={[[C0, 'lineal x·x′'], [C1, 'polinómico (1 + x·x′)³ / 4'], [CA, `RBF γ = ${g}`], [CV, `RBF γ = ${(g / 6).toFixed(2)} (más ancho)`, 'd']]} />
			<hr style={{ border: 'none', borderTop: '1px solid var(--pg-border)', width: '100%' }} />
			<h4>La matriz de Gram y la prueba de validez (PSD)</h4>
			<p className="pg-sub">28 puntos de dos clases, ordenados por clase. Cada celda es K(xᵢ, xⱼ): verde = similitud positiva, rojo = negativa. Un kernel es válido si la matriz es simétrica y todos sus <b>autovalores son ≥ 0</b>.</p>
			<div className="pg-seg">
				{(Object.keys(KN) as KName[]).map((k) => (
					<button key={k} className={k === kn ? 'active' : ''} onClick={() => setKn(k)}>{KN[k]}</button>
				))}
			</div>
			<div className="pg-grid-2" style={{ alignItems: 'center' }}>
				<svg viewBox="0 0 320 320" style={{ width: '100%', maxWidth: 360 }}>
					{G.map((row, i) => row.map((v, j) => <rect key={`${i}-${j}`} x={10 + j * cell} y={10 + i * cell} width={cell + 0.3} height={cell + 0.3} fill={color(v)} />))}
					<line x1={10} x2={310} y1={10 + 14 * cell} y2={10 + 14 * cell} stroke="var(--sl-color-white)" strokeWidth={1} opacity={0.6} />
					<line y1={10} y2={310} x1={10 + 14 * cell} x2={10 + 14 * cell} stroke="var(--sl-color-white)" strokeWidth={1} opacity={0.6} />
				</svg>
				<div>
					<div className="pg-stats">
						<Stat k="autovalor mínimo" v={minEv.toExponential(2)} color={minEv < -1e-8 ? CR : 'var(--pg-ok)'} />
						<Stat k="¿válido (PSD)?" v={minEv < -1e-8 ? 'NO' : 'sí'} color={minEv < -1e-8 ? CR : 'var(--pg-ok)'} />
					</div>
					<div className={`pg-note ${minEv < -1e-8 ? 'bad' : 'ok'}`} style={{ marginTop: '0.8rem' }}>
						{minEv < -1e-8 ? (
							<>Hay autovalores negativos: no existe ningún φ con K = φᵀφ. Usar esta «similitud» en el dual del SVM rompe la convexidad. La distancia negativa parece razonable pero <b>no es un producto interno</b>; la sigmoide a veces sí y a veces no.</>
						) : (
							<>Todos los autovalores ≥ 0: hay un φ (quizás infinito) con K(x, x′) = φ(x)ᵀφ(x′). {kn === 'rbf' && <>Los dos <b>bloques brillantes</b> en la diagonal son las clases: dentro de cada clase los puntos se parecen. Sube γ: los bloques se apagan y queda casi solo la diagonal (cada punto solo se parece a sí mismo ⇒ overfitting).</>}</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

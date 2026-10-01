import { useState } from 'react';
import Tex from '../ui/Tex';
import { Stat } from '../ui/Plot';

const f = (v: number) => (Math.abs(v) < 1e-10 ? '0' : Number.isInteger(+v.toFixed(4)) ? String(+v.toFixed(4)) : v.toFixed(3));
const mat = (M: number[][]) => `\\begin{bmatrix}${M.map((r) => r.map(f).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;

/** Calculadora de ecuaciones normales: edita los datos y mira cada matriz intermedia. */
export default function NormalEqCalc() {
	const [pts, setPts] = useState<[number, number][]>([
		[0, 1],
		[1, 2],
		[2, 2],
	]);
	const [lam, setLam] = useState(0);
	const n = pts.length;
	const X = pts.map(([x]) => [1, x]);
	const y = pts.map(([, yy]) => yy);
	const sx = pts.reduce((s, p) => s + p[0], 0);
	const sxx = pts.reduce((s, p) => s + p[0] * p[0], 0);
	const sy = y.reduce((a, b) => a + b, 0);
	const sxy = pts.reduce((s, p) => s + p[0] * p[1], 0);
	const A = [
		[n, sx],
		[sx, sxx + lam],
	]; // no se penaliza el sesgo
	const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
	const Ainv = [
		[A[1][1] / det, -A[0][1] / det],
		[-A[1][0] / det, A[0][0] / det],
	];
	const bvec = [sy, sxy];
	const w = [Ainv[0][0] * bvec[0] + Ainv[0][1] * bvec[1], Ainv[1][0] * bvec[0] + Ainv[1][1] * bvec[1]];
	const r = pts.map(([x, yy]) => yy - w[0] - w[1] * x);
	const Xtr = [r.reduce((a, b) => a + b, 0), pts.reduce((s, [x], i) => s + x * r[i], 0)];
	const singular = Math.abs(det) < 1e-9;

	const set = (i: number, k: 0 | 1, v: number) => setPts(pts.map((p, j) => (j === i ? ((k === 0 ? [v, p[1]] : [p[0], v]) as [number, number]) : p)));

	return (
		<div className="pg not-content">
			<h4>Calculadora: ecuaciones normales a mano</h4>
			<p className="pg-sub">Edita los puntos (o agrega/quita). Cada matriz intermedia se recalcula: así puedes verificar tus ejercicios de examen. Con λ &gt; 0 ves cómo ridge suma λ a la diagonal (sin penalizar el sesgo).</p>
			<div className="pg-row" style={{ alignItems: 'center' }}>
				{pts.map((p, i) => (
					<span key={i} className="chip" style={{ gap: '0.3rem' }}>
						x<sub>{i + 1}</sub>
						<input className="num" type="number" step="0.5" value={p[0]} onChange={(e) => set(i, 0, Number(e.target.value))} />
						y<sub>{i + 1}</sub>
						<input className="num" type="number" step="0.5" value={p[1]} onChange={(e) => set(i, 1, Number(e.target.value))} />
					</span>
				))}
				<button onClick={() => pts.length < 6 && setPts([...pts, [pts.length, pts.length]])} disabled={pts.length >= 6}>+ punto</button>
				<button onClick={() => pts.length > 2 && setPts(pts.slice(0, -1))} disabled={pts.length <= 2}>− punto</button>
				<label className="pg-field" style={{ flex: '0 0 9rem', minWidth: '8rem' }}>
					<span>λ (ridge)</span>
					<input className="num" type="number" step="0.5" min="0" value={lam} onChange={(e) => setLam(Math.max(0, Number(e.target.value)))} />
				</label>
			</div>
			<div className="matrix-wrap">
				<Tex block>{`\\mathbf{X} = ${mat(X)}\\qquad \\mathbf{y} = ${mat(y.map((v) => [v]))}`}</Tex>
				<Tex block>{`\\mathbf{X}^\\top\\mathbf{X}${lam ? `+\\lambda\\mathbf{I}'` : ''} = \\begin{bmatrix} n & \\sum x_i\\\\ \\sum x_i & \\sum x_i^2${lam ? '+\\lambda' : ''}\\end{bmatrix} = ${mat(A)}\\qquad \\mathbf{X}^\\top\\mathbf{y} = \\begin{bmatrix}\\sum y_i\\\\ \\sum x_iy_i\\end{bmatrix} = ${mat(bvec.map((v) => [v]))}`}</Tex>
				{!singular && (
					<>
						<Tex block>{`\\det = ${f(A[0][0])}\\cdot${f(A[1][1])} - ${f(A[0][1])}^2 = ${f(det)}\\qquad (\\cdot)^{-1} = \\frac{1}{${f(det)}}\\begin{bmatrix}${f(A[1][1])} & ${f(-A[0][1])}\\\\ ${f(-A[1][0])} & ${f(A[0][0])}\\end{bmatrix}`}</Tex>
						<Tex block>{`\\mathbf{w}^\\star = (\\cdot)^{-1}\\mathbf{X}^\\top\\mathbf{y} = ${mat(w.map((v) => [v]))}\\quad\\Rightarrow\\quad \\hat y = ${f(w[0])} ${w[1] >= 0 ? '+' : '-'} ${f(Math.abs(w[1]))}\\,x`}</Tex>
						<Tex block>{`\\mathbf{r} = \\mathbf{y}-\\mathbf{X}\\mathbf{w}^\\star = ${mat(r.map((v) => [v]))}\\qquad \\mathbf{X}^\\top\\mathbf{r} = ${mat(Xtr.map((v) => [v]))}`}</Tex>
					</>
				)}
			</div>
			<div className="pg-stats">
				<Stat k="w₀ (intercepto)" v={singular ? '—' : f(w[0])} />
				<Stat k="w₁ (pendiente)" v={singular ? '—' : f(w[1])} />
				<Stat k="SSE" v={singular ? '—' : f(r.reduce((s, v) => s + v * v, 0))} />
			</div>
			<div className={`pg-note ${singular ? 'bad' : lam ? 'warn' : 'ok'}`}>
				{singular ? (
					<>Todos los x son iguales: las columnas de X son colineales y <b>XᵀX es singular</b> (det = 0). OLS no tiene solución única. Pon λ &gt; 0: ridge la vuelve invertible.</>
				) : lam ? (
					<>Con ridge el residual ya <b>no</b> es ortogonal a la columna de x (Xᵀr ≠ 0 en esa componente): cambiamos un poco de ajuste por una pendiente más pequeña ({f(w[1])}).</>
				) : (
					<>Fíjate en <b>Xᵀr = 0</b>: el residual es perpendicular a las dos columnas de X (la de unos y la de x). Eso es exactamente lo que dicen las ecuaciones normales; la primera componente también implica que los residuales suman 0.</>
				)}
			</div>
		</div>
	);
}

import { useMemo, useState } from 'react';
import Plot, { Path, CA, C0, C1, CM, CV, Slider, Stat, Legend } from '../ui/Plot';
import Tex from '../ui/Tex';
import { range, rng, solve, rmse } from '../ui/math';

/** Kernel ridge regression: α = (K + λI)⁻¹y y el ajuste como suma de «bumps» (teorema del representante). */
export default function KernelRidge() {
	const [lg, setLg] = useState(0);
	const [ll, setLl] = useState(-1);
	const [bumps, setBumps] = useState(true);
	const [kind, setKind] = useState<'rbf' | 'lin'>('rbf');
	const gamma = Math.pow(10, lg),
		lam = Math.pow(10, ll);
	const { tr, te } = useMemo(() => {
		const r = rng(21);
		const gen = (n: number) => Array.from({ length: n }, () => { const x = r.uniform(-3, 3); return { x, y: Math.sin(1.4 * x) + 0.18 * r.normal() }; });
		return { tr: gen(18), te: gen(60) };
	}, []);
	const K = (a: number, b: number) => (kind === 'rbf' ? Math.exp(-gamma * (a - b) ** 2) : a * b);
	const alpha = useMemo(() => {
		const G = tr.map((p) => tr.map((q) => K(p.x, q.x) + 0));
		G.forEach((row, i) => (row[i] += lam));
		return solve(G, tr.map((p) => p.y));
	}, [gamma, lam, kind, tr]);
	const f = (x: number) => tr.reduce((s, p, i) => s + alpha[i] * K(p.x, x), 0);
	const xs = range(-3.6, 3.6, 260);

	return (
		<div className="pg not-content">
			<h4>Kernel ridge: una curva hecha de campanas</h4>
			<p className="pg-sub">
				Por el teorema del representante, el óptimo es <Tex>{'f(x)=\\sum_i \\alpha_i K(x_i,x)'}</Tex>: una campana por punto de entrenamiento, escalada por αᵢ. Y los αᵢ salen de un solo sistema lineal: <Tex>{'\\boldsymbol\\alpha=(\\mathbf{K}+\\lambda\\mathbf{I})^{-1}\\mathbf{y}'}</Tex>.
			</p>
			<div className="pg-row">
				<div className="pg-seg">
					<button className={kind === 'rbf' ? 'active' : ''} onClick={() => setKind('rbf')}>kernel RBF</button>
					<button className={kind === 'lin' ? 'active' : ''} onClick={() => setKind('lin')}>kernel lineal (= ridge común)</button>
				</div>
				<label style={{ margin: 0 }}>
					<input type="checkbox" checked={bumps} onChange={(e) => setBumps(e.target.checked)} /> ver campanas αᵢK(xᵢ, ·)
				</label>
			</div>
			<div className="pg-row">
				{kind === 'rbf' && <Slider label="γ" value={lg} min={-2} max={2.5} step={0.05} onChange={setLg} show={gamma.toFixed(gamma < 1 ? 3 : 1)} />}
				<Slider label="λ" value={ll} min={-6} max={2} step={0.1} onChange={setLl} show={`10^${ll.toFixed(1)}`} />
			</div>
			<Plot x={[-3.6, 3.6]} y={[-2, 2]} h={340} xlabel="x" ylabel="y">
				{(s) => (
					<>
						{bumps && kind === 'rbf' && tr.map((p, i) => <Path key={i} pts={xs.map((x) => [x, alpha[i] * K(p.x, x)])} s={s} color={alpha[i] > 0 ? C1 : C0} width={1} opacity={0.55} />)}
						<Path pts={xs.map((x) => [x, Math.sin(1.4 * x)])} s={s} color={CM} dash="5 5" width={1.6} />
						<Path pts={xs.map((x) => [x, f(x)])} s={s} color={CA} width={2.8} />
						{te.map((p, i) => <circle key={`t${i}`} cx={s.X(p.x)} cy={s.Y(p.y)} r={2.4} fill={CV} opacity={0.5} />)}
						{tr.map((p, i) => <circle key={i} cx={s.X(p.x)} cy={s.Y(p.y)} r={4.8} fill="var(--sl-color-white)" stroke="var(--pg-surface)" strokeWidth={1.5} />)}
					</>
				)}
			</Plot>
			<Legend items={[[CA, 'f(x) = Σ αᵢ K(xᵢ, x)'], [C1, 'campana con αᵢ > 0'], [C0, 'campana con αᵢ < 0'], [CM, 'verdad', 'd'], [CV, 'puntos de test']]} />
			<div className="pg-stats">
				<Stat k="RMSE train" v={rmse(tr.map((p) => f(p.x)), tr.map((p) => p.y)).toFixed(3)} />
				<Stat k="RMSE test" v={rmse(te.map((p) => f(p.x)), te.map((p) => p.y)).toFixed(3)} color="var(--sl-color-accent)" />
				<Stat k="max |αᵢ|" v={Math.max(...alpha.map(Math.abs)).toFixed(2)} />
			</div>
			<div className="pg-note">
				{kind === 'lin' ? (
					<>Con K(x, x′) = x·x′ el kernel ridge es <b>exactamente</b> ridge lineal (sin intercepto): una recta por el origen que no puede seguir la onda. Nonlinealidad = cambiar una línea de código.</>
				) : (
					<>γ grande ⇒ campanas angostas: la curva pasa por cada punto y oscila entre ellos (overfit; mira el test). γ pequeño ⇒ campanas anchísimas, casi una recta. λ hace lo mismo que en ridge: encoge los αᵢ. Costo: la matriz K es n × n (memoria O(n²), resolver ∼O(n³)).</>
				)}
			</div>
		</div>
	);
}

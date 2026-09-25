import { useMemo, useState } from 'react';
import Plot, { useMounted, C0, C1, Slider, Stat, Legend } from '../ui/Plot';
import { heatmap, probColor, rng, sigmoid } from '../ui/math';
import { smo, linearK, polyK, rbfK } from '../ui/svm';

type DS = 'anillos' | 'lunas' | 'xor';
function makeData(ds: DS, seed: number) {
	const r = rng(seed);
	const X: number[][] = [],
		y: number[] = [];
	for (let i = 0; i < 90; i++) {
		const c = i % 2;
		let p: number[];
		if (ds === 'anillos') {
			const rad = c ? 0.3 + 0.9 * r.next() : 1.8 + 0.9 * r.next();
			const t = 2 * Math.PI * r.next();
			p = [rad * Math.cos(t), rad * Math.sin(t)];
		} else if (ds === 'lunas') {
			const t = Math.PI * r.next();
			p = c ? [1 - Math.cos(t) - 0.5, 0.5 - Math.sin(t) + 0.2] : [Math.cos(t) - 0.5, Math.sin(t) - 0.2];
			p = [p[0] * 1.8 + 0.25 * r.normal(), p[1] * 1.8 + 0.25 * r.normal()];
		} else {
			const q = [r.uniform(-2.8, 2.8), r.uniform(-2.8, 2.8)];
			p = q;
			y.push(q[0] * q[1] > 0 ? 1 : -1);
			X.push(p);
			continue;
		}
		X.push(p);
		y.push(c ? 1 : -1);
	}
	return { X, y };
}

/** SVM con kernel resuelto en el navegador: lineal, polinómico y RBF sobre datos no lineales. */
export default function KernelSVM() {
	const [ds, setDs] = useState<DS>('anillos');
	const [kern, setKern] = useState<'lin' | 'poly' | 'rbf'>('rbf');
	const [deg, setDeg] = useState(2);
	const [lg, setLg] = useState(0); // log10 γ
	const [lc, setLc] = useState(0); // log10 C
	const [seed, setSeed] = useState(3);
	const gamma = Math.pow(10, lg),
		C = Math.pow(10, lc);
	const { X, y } = useMemo(() => makeData(ds, seed), [ds, seed]);
	const K = kern === 'lin' ? linearK : kern === 'poly' ? polyK(deg, 1) : rbfK(gamma);
	const model = useMemo(() => smo(X, y, C, K, 1e-3, 8, seed), [X, y, C, kern, deg, gamma]);
	const mounted = useMounted();
	const img = useMemo(() => !mounted ? '' : heatmap((a, b) => sigmoid(2.2 * model.decision([a, b])), [-3.5, 3.5], [-3.5, 3.5], (p) => {
		const [r, g, bb, al] = probColor(p);
		// realza la frontera f = 0
		return Math.abs(p - 0.5) < 0.04 ? [240, 240, 240, 200] : [r, g, bb, Math.min(160, al + 25)];
	}, 96), [model, mounted]);
	const acc = X.filter((x, i) => Math.sign(model.decision(x)) === y[i]).length / X.length;
	const nsv = model.alpha.filter((a) => a > 1e-6).length;

	return (
		<div className="pg not-content">
			<h4>El mismo SVM, tres kernels</h4>
			<p className="pg-sub">Se resuelve el dual con K(xᵢ, xⱼ) en lugar de xᵢᵀxⱼ; la predicción es f(x) = Σ αᵢyᵢK(xᵢ, x) + b. El color es el signo (y la confianza) de f; la línea clara es f = 0. Los anillos marcan los vectores de soporte.</p>
			<div className="pg-row">
				<div className="pg-seg">
					{(['anillos', 'lunas', 'xor'] as DS[]).map((d) => (
						<button key={d} className={d === ds ? 'active' : ''} onClick={() => setDs(d)}>{d}</button>
					))}
				</div>
				<div className="pg-seg">
					<button className={kern === 'lin' ? 'active' : ''} onClick={() => setKern('lin')}>lineal</button>
					<button className={kern === 'poly' ? 'active' : ''} onClick={() => setKern('poly')}>polinómico</button>
					<button className={kern === 'rbf' ? 'active' : ''} onClick={() => setKern('rbf')}>RBF</button>
				</div>
				<button onClick={() => setSeed(seed + 1)}>Otros datos</button>
			</div>
			<div className="pg-row">
				{kern === 'poly' && <Slider label="grado p de (xᵀx′ + 1)ᵖ" value={deg} min={1} max={6} step={1} onChange={setDeg} />}
				{kern === 'rbf' && <Slider label="γ (ancho del bump)" value={lg} min={-2} max={2} step={0.1} onChange={setLg} show={gamma < 1 ? gamma.toFixed(3) : gamma.toFixed(1)} />}
				<Slider label="C" value={lc} min={-2} max={3} step={0.1} onChange={setLc} show={C < 1 ? C.toFixed(3) : C.toFixed(1)} />
			</div>
			<Plot x={[-3.5, 3.5]} y={[-3.5, 3.5]} h={452} w={460} xlabel="x₁" ylabel="x₂">
				{(s) => (
					<>
						{img && <image href={img} x={s.X(-3.5)} y={s.Y(3.5)} width={s.X(3.5) - s.X(-3.5)} height={s.Y(-3.5) - s.Y(3.5)} preserveAspectRatio="none" />}
						{X.map((x, i) => (
							<g key={i}>
								{model.alpha[i] > 1e-6 && <circle cx={s.X(x[0])} cy={s.Y(x[1])} r={8} fill="none" stroke="var(--sl-color-white)" strokeWidth={1.2} opacity={0.8} />}
								<circle cx={s.X(x[0])} cy={s.Y(x[1])} r={4.3} fill={y[i] === 1 ? C1 : C0} stroke="var(--pg-surface)" strokeWidth={1.2} />
							</g>
						))}
					</>
				)}
			</Plot>
			<Legend items={[[C1, 'y = +1'], [C0, 'y = −1'], ['var(--sl-color-white)', 'vector de soporte (αᵢ > 0)']]} />
			<div className="pg-stats">
				<Stat k="accuracy de entrenamiento" v={`${Math.round(acc * 100)}%`} />
				<Stat k="vectores de soporte" v={`${nsv} / ${X.length}`} color={nsv > 0.7 * X.length ? 'var(--pg-warn)' : undefined} />
			</div>
			<div className="pg-note">
				{kern === 'lin' && <>El kernel lineal solo puede trazar una recta: en anillos o XOR es inútil (~50%). Cambia a RBF.</>}
				{kern === 'poly' && <>Grado 2 ya separa los anillos (el círculo es una cuadrática) y el XOR (término x₁x₂). Grados altos: fronteras más retorcidas; alcance <b>global</b>.</>}
				{kern === 'rbf' && (
					<>γ controla el ancho de cada «bump»: γ pequeño ⇒ frontera casi lineal (underfit); γ grande ⇒ islas alrededor de cada punto y casi todos son vectores de soporte (overfit). Ajusta γ y C <b>juntos</b> por validación cruzada, nunca por accuracy de entrenamiento.</>
				)}
			</div>
		</div>
	);
}

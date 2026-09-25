import { useState } from 'react';
import Plot, { Path, CA, C0, C1, CR, CM, Slider, Stat, Legend } from '../ui/Plot';
import Tex from '../ui/Tex';
import { range, sigmoid, fmt } from '../ui/math';

const DATA: [number, number][] = [
	[-3.6, 0], [-2.9, 0], [-2.3, 0], [-1.7, 0], [-1.1, 0], [-0.4, 0], [0.6, 0],
	[-0.8, 1], [0.2, 1], [0.9, 1], [1.5, 1], [2.1, 1], [2.8, 1], [3.5, 1],
];

function fitMLE() {
	let w = 0,
		b = 0;
	for (let it = 0; it < 3000; it++) {
		let gw = 0,
			gb = 0;
		for (const [x, y] of DATA) {
			const p = sigmoid(w * x + b);
			gw += (p - y) * x;
			gb += p - y;
		}
		w -= (0.5 * gw) / DATA.length;
		b -= (0.5 * gb) / DATA.length;
	}
	return { w, b };
}

/** Sigmoide en 1-D: frontera x* = −b/w, barras de verosimilitud y cross-entropy. */
export default function Sigmoid() {
	const [w, setW] = useState(0.6);
	const [b, setB] = useState(-1);
	const [pq, setPq] = useState(0.75);
	const xs = range(-5, 5, 200);
	const probs = DATA.map(([x, y]) => {
		const p = sigmoid(w * x + b);
		return y === 1 ? p : 1 - p;
	});
	const ce = -probs.reduce((s, v) => s + Math.log(Math.max(v, 1e-12)), 0) / DATA.length;
	const acc = DATA.filter(([x, y]) => (w * x + b >= 0 ? 1 : 0) === y).length / DATA.length;
	const xstar = w !== 0 ? -b / w : NaN;
	const odds = pq / (1 - pq);

	return (
		<div className="pg not-content">
			<h4>La sigmoide y su frontera</h4>
			<p className="pg-sub">
				<Tex>{'P(y=1\\mid x)=\\sigma(wx+b)'}</Tex>. Cada barra vertical es la probabilidad que el modelo le da a la etiqueta <b>verdadera</b> de ese punto: el likelihood es el producto de las barras y la cross-entropy es −log de ese producto, promediado.
			</p>
			<div className="pg-row">
				<Slider label="w (pendiente)" value={w} min={-3} max={5} step={0.05} onChange={setW} />
				<Slider label="b (sesgo)" value={b} min={-5} max={5} step={0.05} onChange={setB} />
				<button className="primary" onClick={() => { const f = fitMLE(); setW(+f.w.toFixed(2)); setB(+f.b.toFixed(2)); }}>Máxima verosimilitud</button>
			</div>
			<Plot x={[-5, 5]} y={[-0.08, 1.08]} h={320} xlabel="feature x" ylabel="P(y = 1 | x)" yticks={[0, 0.25, 0.5, 0.75, 1]}>
				{(s) => (
					<>
						<line x1={s.x0} x2={s.x1} y1={s.Y(0.5)} y2={s.Y(0.5)} stroke={CM} strokeDasharray="4 4" />
						{Number.isFinite(xstar) && <line x1={s.X(xstar)} x2={s.X(xstar)} y1={s.y0} y2={s.y1} stroke={CA} strokeDasharray="6 4" strokeWidth={1.5} />}
						{DATA.map(([x, y], i) => {
							const p = sigmoid(w * x + b);
							return <line key={`b${i}`} x1={s.X(x)} x2={s.X(x)} y1={s.Y(y)} y2={s.Y(p)} stroke={probs[i] < 0.5 ? CR : 'var(--pg-ok)'} strokeWidth={4} opacity={0.45} />;
						})}
						<Path pts={xs.map((x) => [x, sigmoid(w * x + b)])} s={s} color={CA} width={2.8} />
						{DATA.map(([x, y], i) => (
							<circle key={i} cx={s.X(x)} cy={s.Y(y)} r={6} fill={y ? C1 : C0} stroke="var(--pg-surface)" strokeWidth={2} />
						))}
					</>
				)}
			</Plot>
			<Legend items={[[C0, 'clase 0'], [C1, 'clase 1'], [CA, 'σ(wx + b) y frontera x* = −b/w'], ['var(--pg-ok)', 'barra = P(etiqueta verdadera)']]} />
			<div className="pg-stats">
				<Stat k="frontera x*" v={Number.isFinite(xstar) ? fmt(xstar, 2) : '—'} />
				<Stat k="cross-entropy J" v={fmt(ce, 3)} />
				<Stat k="accuracy (umbral 0.5)" v={`${Math.round(acc * 100)}%`} />
				<Stat k="odds ratio eʷ" v={fmt(Math.exp(w), 2)} />
			</div>
			<div className="pg-note">
				Mueve w: con <b>w grande</b> la sigmoide se vuelve un escalón (confianza extrema); con <b>w &lt; 0</b> se invierte. Si las clases fueran separables, la máxima verosimilitud empujaría w → ∞: por eso se regulariza con λ‖w‖². Cada unidad extra de x multiplica los odds por e<sup>w</sup> = {fmt(Math.exp(w), 2)}.
			</div>
			<hr style={{ border: 'none', borderTop: '1px solid var(--pg-border)', width: '100%' }} />
			<h4>Probabilidad → odds → log-odds</h4>
			<Slider label="probabilidad p" value={pq} min={0.01} max={0.99} step={0.01} onChange={setPq} />
			<div className="pg-stats">
				<Stat k="p ∈ (0, 1)" v={pq.toFixed(2)} />
				<Stat k="odds p/(1−p) ∈ (0, ∞)" v={`${fmt(odds, 2)} : 1`} />
				<Stat k="log-odds ∈ (−∞, ∞)" v={fmt(Math.log(odds), 3)} color="var(--sl-color-accent)" />
			</div>
			<div className="pg-note">
				Dividir por 1−p quita el <b>techo</b> en 1; tomar log quita el <b>piso</b> en 0 y lo vuelve simétrico (p = 0.5 ↔ 0). Como el log-odds recorre todo ℝ, igual que <Tex>{'z=\\mathbf{w}^\\top\\mathbf{x}+b'}</Tex>, lo modelamos como lineal; despejando p sale forzosamente la sigmoide.
			</div>
		</div>
	);
}

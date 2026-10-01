import { useState } from 'react';
import Plot, { Path, CA, C0, C1, CV, CR, Slider, Stat, Legend } from '../ui/Plot';
import { gauss, range, fmt } from '../ui/math';

const PTS: [number, number][] = [
	[1, 2.3], [2, 2.9], [3, 4.6], [4, 4.4], [5, 6.1], [6, 6.3], [7, 7.9],
];
const n = PTS.length;
const xm = PTS.reduce((s, p) => s + p[0], 0) / n;
const ym = PTS.reduce((s, p) => s + p[1], 0) / n;
const wOpt = PTS.reduce((s, p) => s + (p[0] - xm) * (p[1] - ym), 0) / PTS.reduce((s, p) => s + (p[0] - xm) ** 2, 0);
const bOpt = ym - wOpt * xm;

/** Máxima verosimilitud con ruido gaussiano = mínimos cuadrados, visto en vivo. */
export default function MLELine() {
	const [w, setW] = useState(0.5);
	const [b, setB] = useState(2.5);
	const [sig, setSig] = useState(0.7);
	const sse = (ww: number, bb: number) => PTS.reduce((s, [x, y]) => s + (y - ww * x - bb) ** 2, 0);
	const logL = (ww: number, bb: number) => -n * Math.log(Math.sqrt(2 * Math.PI) * sig) - sse(ww, bb) / (2 * sig * sig);
	const ws = range(-0.2, 2, 120);
	const Ls = ws.map((ww) => logL(ww, b));
	const Ss = ws.map((ww) => sse(ww, b));
	const lmin = Math.min(...Ls),
		lmax = Math.max(...Ls);
	const smax = Math.max(...Ss);
	const bestW = ws[Ls.indexOf(lmax)];

	return (
		<div className="pg not-content">
			<h4>Cada punto es una muestra de una campana centrada en la recta</h4>
			<p className="pg-sub">
				Suponemos <span className="mono">yᵢ = w·xᵢ + b + εᵢ</span> con ε ∼ 𝒩(0, σ²). Junto a cada punto se dibuja su campana; el segmento grueso es la <b>altura de la campana en yᵢ</b> (su verosimilitud). La verosimilitud total es el producto de esas alturas. Mueve la recta: cuando las alturas son grandes, los cuadrados son chicos.
			</p>
			<div className="pg-row">
				<Slider label="w" value={w} min={-0.2} max={2} step={0.01} onChange={setW} />
				<Slider label="b" value={b} min={-1} max={5} step={0.02} onChange={setB} />
				<Slider label="σ del ruido" value={sig} min={0.3} max={2} step={0.05} onChange={setSig} />
				<button className="primary" onClick={() => { setW(+wOpt.toFixed(3)); setB(+bOpt.toFixed(3)); }}>Máxima verosimilitud</button>
			</div>
			<div className="pg-grid-2">
				<Plot x={[0, 8]} y={[0, 10]} w={420} h={340} xlabel="x" ylabel="y">
					{(s) => (
						<>
							<Path pts={[[0, b], [8, 8 * w + b]]} s={s} color={CA} width={2.6} />
							{PTS.map(([x, y], i) => {
								const mu = w * x + b;
								const ys = range(mu - 3 * sig, mu + 3 * sig, 40);
								const k = 0.9 * sig; // escala horizontal de la campana
								const h = gauss(y, mu, sig) * k * 2.4;
								return (
									<g key={i}>
										<Path pts={ys.map((yy) => [x + gauss(yy, mu, sig) * k * 2.4, yy])} s={s} color={CV} width={1.3} opacity={0.75} />
										<line x1={s.X(x)} x2={s.X(x)} y1={s.Y(mu - 3 * sig)} y2={s.Y(mu + 3 * sig)} stroke={CV} strokeOpacity={0.3} />
										<line x1={s.X(x)} x2={s.X(x + h)} y1={s.Y(y)} y2={s.Y(y)} stroke={h < 0.08 ? CR : 'var(--pg-ok)'} strokeWidth={4} />
										<circle cx={s.X(x)} cy={s.Y(y)} r={5} fill={C0} stroke="var(--pg-surface)" strokeWidth={1.5} />
									</g>
								);
							})}
						</>
					)}
				</Plot>
				<Plot x={[-0.2, 2]} y={[0, 1.05]} w={420} h={340} xlabel="pendiente w (b fijo)" ylabel="valor normalizado" yticks={[]}>
					{(s) => (
						<>
							<Path pts={ws.map((ww, i) => [ww, (Ls[i] - lmin) / (lmax - lmin || 1)])} s={s} color={CV} width={2.4} />
							<Path pts={ws.map((ww, i) => [ww, Ss[i] / smax])} s={s} color={C1} width={2.4} />
							<line x1={s.X(w)} x2={s.X(w)} y1={s.y0} y2={s.y1} stroke={CA} strokeDasharray="4 4" />
							<line x1={s.X(bestW)} x2={s.X(bestW)} y1={s.y0} y2={s.y1} stroke="var(--pg-ok)" strokeWidth={1.5} />
						</>
					)}
				</Plot>
			</div>
			<Legend items={[[CV, 'log-verosimilitud log L(w)'], [C1, 'suma de cuadrados SSE(w)'], ['var(--pg-ok)', 'máximo de log L = mínimo de SSE']]} />
			<div className="pg-stats">
				<Stat k="SSE = Σ rᵢ²" v={fmt(sse(w, b), 3)} />
				<Stat k="log L" v={fmt(logL(w, b), 3)} color={CV} />
				<Stat k="óptimo (w, b)" v={`(${wOpt.toFixed(2)}, ${bOpt.toFixed(2)})`} />
			</div>
			<div className="pg-note">
				<span className="mono">log L = −n·log(σ√2π) − SSE/(2σ²)</span>. El primer término no depende de la recta, así que <b>maximizar log L ⇔ minimizar SSE</b>, para cualquier σ (mueve σ: las curvas cambian de altura pero el óptimo en w no se mueve). Por eso los mínimos cuadrados son «lo que implica» el ruido gaussiano.
			</div>
		</div>
	);
}

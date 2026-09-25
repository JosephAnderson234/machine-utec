import { useState } from 'react';
import Plot, { Path, CA, C0, CR, CV, Slider, Stat, Legend } from '../ui/Plot';
import Tex from '../ui/Tex';
import { clamp, fmt, mean } from '../ui/math';

type P = [number, number];
const BASE: P[] = [
	[1, 2.1],
	[2, 2.6],
	[3, 4.2],
	[4, 4.1],
	[5, 5.6],
	[6, 5.9],
	[7, 7.4],
	[8, 7.6],
];

function ols(pts: P[]) {
	const xm = mean(pts.map((p) => p[0]));
	const ym = mean(pts.map((p) => p[1]));
	let sxy = 0,
		sxx = 0;
	for (const [x, y] of pts) {
		sxy += (x - xm) * (y - ym);
		sxx += (x - xm) ** 2;
	}
	const w = sxx ? sxy / sxx : 0;
	return { w, b: ym - w * xm };
}

/** Ajuste de una recta: residuales como cuadrados, costo y R², con puntos arrastrables. */
export default function LinearFit() {
	const [pts, setPts] = useState<P[]>(BASE);
	const [w, setW] = useState(0.4);
	const [b, setB] = useState(3);
	const [drag, setDrag] = useState<number | null>(null);
	const [sq, setSq] = useState(true);
	const [ghost, setGhost] = useState<{ w: number; b: number } | null>(null);

	const pred = pts.map(([x]) => w * x + b);
	const res = pts.map(([, y], i) => y - pred[i]);
	const J = res.reduce((s, r) => s + r * r, 0);
	const ym = mean(pts.map((p) => p[1]));
	const sst = pts.reduce((s, [, y]) => s + (y - ym) ** 2, 0);
	const r2 = 1 - J / (sst || 1);
	const opt = ols(pts);
	const Jopt = pts.reduce((s, [x, y]) => s + (y - opt.w * x - opt.b) ** 2, 0);
	const hasOutlier = pts.length > BASE.length;

	return (
		<div className="pg not-content">
			<h4>Mínimos cuadrados con tus manos</h4>
			<p className="pg-sub">Mueve la pendiente w y el intercepto b hasta que el área total de los cuadrados (los residuales al cuadrado) sea mínima. Puedes arrastrar los puntos. Luego compara con la solución exacta de las ecuaciones normales.</p>
			<div className="pg-row">
				<Slider label="pendiente w" value={w} min={-1} max={2} step={0.01} onChange={setW} />
				<Slider label="intercepto b" value={b} min={-3} max={8} step={0.05} onChange={setB} />
			</div>
			<div className="pg-row">
				<button className="primary" onClick={() => { setW(+opt.w.toFixed(3)); setB(+opt.b.toFixed(3)); }}>Resolver (ecuaciones normales)</button>
				<button onClick={() => { if (hasOutlier) { setPts(BASE); setGhost(null); } else { setGhost(ols(pts)); setPts([...pts, [9.3, 0.6]]); } }}>{hasOutlier ? 'Quitar outlier' : 'Agregar un outlier'}</button>
				<label style={{ margin: 0 }}>
					<input type="checkbox" checked={sq} onChange={(e) => setSq(e.target.checked)} /> ver cuadrados
				</label>
				<button onClick={() => { setPts(BASE); setGhost(null); }}>Datos originales</button>
			</div>
			<Plot
				x={[0, 10]}
				y={[-1, 10]}
				h={360}
				xlabel="feature x"
				ylabel="target y"
				onPointerDown={(e, s) => {
					const [x, y] = s.toData(e);
					let best = -1,
						bd = 0.6;
					pts.forEach(([px, py], i) => {
						const d = Math.hypot(px - x, (py - y) * 0.9);
						if (d < bd) { bd = d; best = i; }
					});
					if (best >= 0) {
						setDrag(best);
						(e.target as Element).setPointerCapture?.(e.pointerId);
					}
				}}
				onPointerMove={(e, s) => {
					if (drag === null) return;
					const [x, y] = s.toData(e);
					setPts(pts.map((p, i) => (i === drag ? [clamp(+x.toFixed(2), 0.2, 9.8), clamp(+y.toFixed(2), -0.8, 9.8)] : p)));
				}}
				onPointerUp={() => setDrag(null)}
			>
				{(s) => (
					<>
						{sq &&
							pts.map(([x, y], i) => {
								const py = s.Y(y),
									pp = s.Y(pred[i]);
								const side = Math.abs(py - pp);
								return <rect key={`s${i}`} x={s.X(x)} y={Math.min(py, pp)} width={side} height={side} fill={CR} opacity={0.13} stroke={CR} strokeOpacity={0.4} />;
							})}
						{ghost && <Path pts={[[0, ghost.b], [10, ghost.w * 10 + ghost.b]]} s={s} color={CV} dash="6 5" width={1.8} />}
						<Path pts={[[0, b], [10, w * 10 + b]]} s={s} color={CA} width={2.6} />
						{pts.map(([x, y], i) => (
							<line key={`r${i}`} x1={s.X(x)} x2={s.X(x)} y1={s.Y(y)} y2={s.Y(pred[i])} stroke={CR} strokeWidth={1.5} />
						))}
						{pts.map(([x, y], i) => (
							<circle key={i} className="drag" cx={s.X(x)} cy={s.Y(y)} r={i >= BASE.length ? 8 : 6.5} fill={i >= BASE.length ? CR : C0} stroke="var(--pg-surface)" strokeWidth={2} />
						))}
					</>
				)}
			</Plot>
			<Legend items={[[CA, 'tu recta ŷ = wx + b'], [CR, 'residual rᵢ = yᵢ − ŷᵢ (y su cuadrado)'], ...(ghost ? ([[CV, 'recta OLS sin el outlier', 'd']] as [string, string, string][]) : [])]} />
			<div className="pg-stats">
				<Stat k="J(w,b) = Σ rᵢ²" v={fmt(J, 2)} color={J <= Jopt * 1.01 ? 'var(--pg-ok)' : undefined} />
				<Stat k="mínimo posible" v={fmt(Jopt, 2)} />
				<Stat k="RMSE" v={fmt(Math.sqrt(J / pts.length), 3)} />
				<Stat k="MAE" v={fmt(mean(res.map(Math.abs)), 3)} />
				<Stat k="R²" v={fmt(r2, 3)} color={r2 < 0 ? CR : undefined} />
			</div>
			<div className="formula">
				<Tex block>{`w^\\star = \\frac{\\sum (x_i-\\bar x)(y_i-\\bar y)}{\\sum (x_i-\\bar x)^2} = ${opt.w.toFixed(3)},\\qquad b^\\star = \\bar y - w^\\star \\bar x = ${opt.b.toFixed(3)}`}</Tex>
			</div>
			<div className={`pg-note ${hasOutlier ? 'warn' : ''}`}>
				{hasOutlier ? (
					<>Un solo outlier con residual grande pesa <b>al cuadrado</b>: la recta óptima se inclina hacia él (compara con la línea violeta). Por eso RMSE ≥ MAE y la brecha crece con outliers.</>
				) : (
					<>Si R² &lt; 0 tu recta es <b>peor que predecir siempre la media</b> ȳ = {ym.toFixed(2)}. Con 1 feature, las ecuaciones normales <Tex>{'\\mathbf{X}^\\top\\mathbf{X}\\mathbf{w}=\\mathbf{X}^\\top\\mathbf{y}'}</Tex> se reducen a la fórmula de arriba.</>
				)}
			</div>
		</div>
	);
}

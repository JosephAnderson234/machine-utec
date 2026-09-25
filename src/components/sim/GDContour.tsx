import { useMemo, useState } from 'react';
import Plot, { CA, CM, CR, Slider, Stat } from '../ui/Plot';
import { rng } from '../ui/math';

const TH = (30 * Math.PI) / 180;
const c = Math.cos(TH),
	sn = Math.sin(TH);

/** Descenso de gradiente sobre las curvas de nivel: escalado de features y batch/SGD/mini-batch. */
export default function GDContour() {
	const [kappa, setKappa] = useState(8); // curvatura del eje «malo» (features sin escalar)
	const [eta, setEta] = useState(0.2);
	const [mode, setMode] = useState<'batch' | 'mini' | 'sgd'>('batch');
	const [seed, setSeed] = useState(1);
	// H = R diag(kappa,1) Rᵀ
	const H = [
		[kappa * c * c + sn * sn, (kappa - 1) * c * sn],
		[(kappa - 1) * c * sn, kappa * sn * sn + c * c],
	];
	const J = (w: number[]) => 0.5 * (w[0] * (H[0][0] * w[0] + H[0][1] * w[1]) + w[1] * (H[1][0] * w[0] + H[1][1] * w[1]));
	const noise = mode === 'batch' ? 0 : mode === 'mini' ? 0.35 : 1.1;

	const path = useMemo(() => {
		const r = rng(seed * 97 + 3);
		let w = [-3.4, 2.2];
		const out = [w];
		for (let i = 0; i < 80; i++) {
			const g = [H[0][0] * w[0] + H[0][1] * w[1], H[1][0] * w[0] + H[1][1] * w[1]];
			const gn = Math.hypot(g[0], g[1]) + 1;
			const gg = [g[0] + noise * gn * r.normal() * 0.6, g[1] + noise * gn * r.normal() * 0.6];
			w = [w[0] - eta * gg[0], w[1] - eta * gg[1]];
			if (!w.every(Number.isFinite) || Math.hypot(w[0], w[1]) > 1e4) break;
			out.push(w);
		}
		return out;
	}, [kappa, eta, noise, seed]);

	const reach = path.findIndex((w) => J(w) < 0.01);
	const diverged = Math.hypot(...path[path.length - 1]) > 20;
	const levels = [0.05, 0.3, 1, 2.5, 5, 9, 15, 24];
	const limit = 2 / kappa;

	return (
		<div className="pg not-content">
			<h4>Curvas de nivel: por qué estandarizar</h4>
			<p className="pg-sub">
				La forma del bowl la fija <span className="mono">XᵀX</span>. Con features en escalas muy distintas el valle es largo y fino (curvatura κ alta): un mismo η no sirve para ambas direcciones y el descenso zigzaguea. Con κ = 1 (features estandarizados) el bowl es redondo.
			</p>
			<div className="pg-row">
				<Slider label="Alargamiento κ (1 = estandarizado)" value={kappa} min={1} max={20} step={0.5} onChange={setKappa} />
				<Slider label="Tasa η" value={eta} min={0.01} max={1.2} step={0.01} onChange={setEta} />
			</div>
			<div className="pg-row">
				<div className="pg-seg">
					<button className={mode === 'batch' ? 'active' : ''} onClick={() => setMode('batch')}>Batch (n puntos)</button>
					<button className={mode === 'mini' ? 'active' : ''} onClick={() => setMode('mini')}>Mini-batch</button>
					<button className={mode === 'sgd' ? 'active' : ''} onClick={() => setMode('sgd')}>Estocástico (1 punto)</button>
				</div>
				{mode !== 'batch' && <button onClick={() => setSeed(seed + 1)}>Otro muestreo</button>}
			</div>
			<Plot x={[-4, 4]} y={[-3, 3]} h={397} xlabel="w₁" ylabel="w₂">
				{(s) => {
					const u = s.X(1) - s.X(0);
					return (
						<>
							{levels.map((L) => (
								<ellipse
									key={L}
									cx={s.X(0)}
									cy={s.Y(0)}
									rx={Math.sqrt((2 * L) / kappa) * u}
									ry={Math.sqrt(2 * L) * u}
									transform={`rotate(${-30} ${s.X(0)} ${s.Y(0)})`}
									fill="none"
									stroke={CM}
									strokeOpacity={0.5}
								/>
							))}
							<polyline points={path.map((w) => `${s.X(w[0])},${s.Y(w[1])}`).join(' ')} fill="none" stroke={diverged ? CR : CA} strokeWidth={1.8} strokeLinejoin="round" />
							{path.map((w, i) => (
								<circle key={i} cx={s.X(w[0])} cy={s.Y(w[1])} r={i === 0 ? 5 : 2.4} fill={i === 0 ? CR : CA} />
							))}
							<text x={s.X(0) + 8} y={s.Y(0) - 8} fill="var(--pg-ok)" fontSize={16}>★</text>
						</>
					);
				}}
			</Plot>
			<div className="pg-stats">
				<Stat k="pasos hasta J < 0.01" v={diverged ? 'diverge' : reach >= 0 ? reach : '> 80'} color={diverged ? CR : undefined} />
				<Stat k="η máximo estable ≈ 2/κ" v={limit.toFixed(3)} />
				<Stat k="J final" v={diverged ? '∞' : J(path[path.length - 1]).toFixed(4)} />
			</div>
			<div className={`pg-note ${diverged ? 'bad' : ''}`}>
				{diverged ? (
					<>η supera 2/κ: en la dirección empinada cada paso sobrepasa el valle y la distancia crece. Baja η… o <b>estandariza</b> (baja κ) y podrás usar un η más grande.</>
				) : mode === 'batch' ? (
					<>Con κ alto, η debe ser &lt; 2/κ por la dirección empinada, pero entonces la dirección plana avanza lentísimo. Pon κ = 1: el mismo descenso va casi recto al ★. La solución cerrada no se entera del escalado; <b>todo método iterativo sí</b>.</>
				) : (
					<>Cada paso usa una muestra, así que el gradiente es <b>ruidoso</b>: el camino tiembla y oscila alrededor del mínimo. A cambio cada paso es barato (un mini-batch es una sola multiplicación de matrices en la GPU).</>
				)}
			</div>
		</div>
	);
}

import { useMemo, useState } from 'react';
import Plot, { Path, CA, C0, C1, CM, CV, Slider, Stat, Legend } from '../ui/Plot';
import { polyEval, polyRow, range, ridge, rmse, sineData, fmt } from '../ui/math';

const MAXD = 12;

/** Ajuste polinómico: grado, λ de ridge, curva de error train/validación y tamaño de los pesos. */
export default function PolyFit({ showLambda = true, initDeg = 3 }: { showLambda?: boolean; initDeg?: number }) {
	const [deg, setDeg] = useState(initDeg);
	const [logL, setLogL] = useState(-9); // -9 = λ = 0
	const [seed, setSeed] = useState(4);
	const [n, setN] = useState(14);
	const lambda = logL <= -8.9 ? 0 : Math.pow(10, logL);

	const { train, val } = useMemo(() => ({ train: sineData(n, 0.22, seed), val: sineData(40, 0.22, seed + 1000) }), [n, seed]);

	const fitDeg = (d: number) => ridge(train.map((p) => polyRow(p.x, d)), train.map((p) => p.y), lambda);
	const w = useMemo(() => fitDeg(deg), [deg, lambda, train]);
	const curve = useMemo(() => {
		const out: { d: number; tr: number; va: number }[] = [];
		for (let d = 0; d <= MAXD; d++) {
			const wd = fitDeg(d);
			out.push({ d, tr: rmse(train.map((p) => polyEval(wd, p.x)), train.map((p) => p.y)), va: rmse(val.map((p) => polyEval(wd, p.x)), val.map((p) => p.y)) });
		}
		return out;
	}, [lambda, train, val]);

	const cur = curve[deg];
	const best = curve.reduce((a, b) => (b.va < a.va ? b : a));
	const xs = range(0, 1, 240);
	const maxW = Math.max(...w.map(Math.abs));
	const verdict = cur.tr > 0.35 && cur.va > 0.35 ? 'underfit' : cur.va > 1.8 * cur.tr + 0.08 ? 'overfit' : 'bien';

	return (
		<div className="pg not-content">
			<h4>Sube el grado… y mira la validación</h4>
			<p className="pg-sub">
				Datos de <span className="mono">sin(2πx) + ruido</span>. El modelo sigue siendo <b>lineal en los pesos</b>: solo añadimos columnas x², x³… a la matriz de diseño. Los puntos llenos entrenan; los huecos validan.
			</p>
			<div className="pg-row">
				<Slider label="grado del polinomio" value={deg} min={0} max={MAXD} step={1} onChange={setDeg} />
				{showLambda && <Slider label="λ (ridge)" value={logL} min={-9} max={2} step={0.25} onChange={setLogL} show={lambda === 0 ? '0' : `10^${logL}`} />}
				<Slider label="n de entrenamiento" value={n} min={8} max={60} step={1} onChange={setN} />
			</div>
			<div className="pg-row">
				<button onClick={() => setSeed(seed + 1)}>Nuevos datos</button>
				<button onClick={() => setDeg(best.d)}>Ir al mejor grado según validación</button>
			</div>
			<div className="pg-grid-2">
				<Plot x={[0, 1]} y={[-2, 2]} w={420} h={320} xlabel="x">
					{(s) => (
						<>
							<Path pts={xs.map((x) => [x, Math.sin(2 * Math.PI * x)])} s={s} color={CM} dash="5 5" width={1.6} />
							<Path pts={xs.map((x) => [x, polyEval(w, x)])} s={s} color={CA} width={2.6} />
							{val.map((p, i) => (
								<circle key={`v${i}`} cx={s.X(p.x)} cy={s.Y(p.y)} r={3.6} fill="none" stroke={C1} strokeWidth={1.4} />
							))}
							{train.map((p, i) => (
								<circle key={`t${i}`} cx={s.X(p.x)} cy={s.Y(p.y)} r={4.4} fill={C0} stroke="var(--pg-surface)" strokeWidth={1.4} />
							))}
						</>
					)}
				</Plot>
				<Plot x={[0, MAXD]} y={[0, 1.2]} w={420} h={320} xlabel="grado (complejidad)" ylabel="RMSE" xticks={[0, 2, 4, 6, 8, 10, 12]}>
					{(s) => (
						<>
							<Path pts={curve.map((c) => [c.d, c.tr])} s={s} color={C0} width={2.2} />
							<Path pts={curve.map((c) => [c.d, Math.min(c.va, 5)])} s={s} color={C1} width={2.2} />
							<line x1={s.X(deg)} x2={s.X(deg)} y1={s.y0} y2={s.y1} stroke={CA} strokeDasharray="4 4" />
							<circle cx={s.X(best.d)} cy={s.Y(best.va)} r={6} fill="none" stroke={CV} strokeWidth={2} />
							{curve.map((c) => (
								<g key={c.d}>
									<circle cx={s.X(c.d)} cy={s.Y(c.tr)} r={2.8} fill={C0} />
									<circle cx={s.X(c.d)} cy={s.Y(Math.min(c.va, 5))} r={2.8} fill={C1} />
								</g>
							))}
						</>
					)}
				</Plot>
			</div>
			<Legend items={[[CA, 'ajuste actual'], [CM, 'verdad sin(2πx)', 'd'], [C0, 'RMSE train'], [C1, 'RMSE validación'], [CV, 'mínimo de validación']]} />
			<div className="pg-stats">
				<Stat k="RMSE train" v={fmt(cur.tr)} />
				<Stat k="RMSE validación" v={fmt(cur.va)} />
				<Stat k="mayor |wⱼ|" v={fmt(maxW, 2)} />
				<Stat k="diagnóstico" v={verdict} color={verdict === 'bien' ? 'var(--pg-ok)' : 'var(--pg-warn)'} />
			</div>
			<div className="pg-scroll">
				<svg viewBox="0 0 520 70" style={{ width: '100%' }}>
					{w.map((wj, j) => {
						const hgt = Math.min(56, Math.max(1, (Math.log10(Math.abs(wj) + 1e-3) + 3) * 8));
						return (
							<g key={j}>
								<rect x={10 + j * 38} y={58 - hgt} width={26} height={hgt} rx={3} fill={CA} opacity={0.75} />
								<text x={23 + j * 38} y={68} textAnchor="middle" fontSize={9} fill="var(--pg-muted)">w{j}</text>
							</g>
						);
					})}
				</svg>
			</div>
			<div className={`pg-note ${verdict === 'bien' ? 'ok' : 'warn'}`}>
				{verdict === 'underfit' && <>Ambos errores altos: el modelo es demasiado <b>rígido</b> (alto sesgo). Los residuales aún trazan un patrón.</>}
				{verdict === 'overfit' && (
					<>Train muy bajo y validación alto: una <b>brecha grande</b> = memorizó el ruido (alta varianza). Mira las barras: los pesos crecen (escala log). {showLambda && <>Sube λ para encogerlos sin bajar el grado.</>}</>
				)}
				{verdict === 'bien' && <>Ambos errores bajos y cercanos: el punto dulce de la U. El error de entrenamiento siempre baja con el grado; el de validación tiene forma de <b>U</b>.</>}
			</div>
		</div>
	);
}

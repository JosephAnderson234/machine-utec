import { useState } from 'react';
import Plot, { Path, CA, C0, C1, CM, CV, Slider, Stat, Legend } from '../ui/Plot';
import { gauss, range } from '../ui/math';

// Φ normal estándar (aprox. de Abramowitz–Stegun)
function Phi(x: number) {
	const t = 1 / (1 + 0.2316419 * Math.abs(x));
	const d = 0.3989423 * Math.exp((-x * x) / 2);
	const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
	return x > 0 ? 1 - p : p;
}

/** Umbral → matriz de confusión, precision/recall/F1 y el punto en la curva ROC. */
export default function ThresholdROC() {
	const [prev, setPrev] = useState(1); // %
	const [d, setD] = useState(2.72);
	const [t, setT] = useState(1.88);
	const N = 10000;
	const P = (N * prev) / 100,
		Nn = N - P;
	const tpr = 1 - Phi(t - d);
	const fpr = 1 - Phi(t);
	const TP = Math.round(P * tpr),
		FN = Math.round(P) - TP,
		FP = Math.round(Nn * fpr),
		TN = Math.round(Nn) - FP;
	const prec = TP + FP ? TP / (TP + FP) : 0;
	const rec = P ? TP / Math.round(P) : 0;
	const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0;
	const acc = (TP + TN) / N;
	const auc = Phi(d / Math.SQRT2);
	const xs = range(-4, 7, 220);
	const ts = range(-5, 9, 120);
	const pct = (v: number) => `${(100 * v).toFixed(1)}%`;

	return (
		<div className="pg not-content">
			<h4>El umbral es una perilla</h4>
			<p className="pg-sub">El modelo produce un score (p. ej. la probabilidad). Todo lo que supera el umbral se declara positivo. Las curvas están escaladas por la prevalencia: con 1% de enfermos, la campana naranja es diminuta.</p>
			<div className="pg-row">
				<Slider label="umbral" value={t} min={-3} max={7} step={0.02} onChange={setT} />
				<Slider label="separación d′ (calidad del modelo)" value={d} min={0} max={5} step={0.02} onChange={setD} />
				<Slider label="prevalencia" value={prev} min={0.5} max={50} step={0.5} onChange={setPrev} show={`${prev}%`} />
			</div>
			<div className="pg-row">
				<button onClick={() => { setPrev(1); setD(2.72); setT(1.88); }}>Tamizaje de la slide (1%)</button>
				<button onClick={() => setT(7)}>«Siempre di sano»</button>
				<button onClick={() => { setPrev(50); setT(d / 2); }}>Clases balanceadas</button>
			</div>
			<div className="pg-grid-2">
				<Plot x={[-4, 7]} y={[0, 0.42]} w={420} h={300} xlabel="score del modelo" yticks={[]}>
					{(s) => {
						const neg = (x: number) => (gauss(x, 0, 1) * (100 - prev)) / 100;
						const pos = (x: number) => (gauss(x, d, 1) * prev) / 100;
						const area = (f: (x: number) => number, a: number, b: number, color: string) => {
							const pts = range(a, b, 80);
							return <path d={`M${s.X(a)},${s.Y(0)}` + pts.map((x) => `L${s.X(x)},${s.Y(f(x))}`).join('') + `L${s.X(b)},${s.Y(0)}Z`} fill={color} opacity={0.3} />;
						};
						return (
							<>
								{area(neg, Math.max(t, -4), 7, C0)}
								{area(pos, Math.max(t, -4), 7, C1)}
								<Path pts={xs.map((x) => [x, neg(x)])} s={s} color={C0} width={2.2} />
								<Path pts={xs.map((x) => [x, pos(x)])} s={s} color={C1} width={2.2} />
								<line x1={s.X(t)} x2={s.X(t)} y1={s.y0} y2={s.y1} stroke={CA} strokeWidth={2} />
								<text x={s.X(t) + 5} y={s.y1 + 14} fontSize={11} fill="var(--sl-color-accent)">predice + →</text>
							</>
						);
					}}
				</Plot>
				<Plot x={[0, 1]} y={[0, 1]} w={420} h={300} xlabel="FPR = FP/(FP+TN)" ylabel="TPR = recall">
					{(s) => (
						<>
							<Path pts={[[0, 0], [1, 1]]} s={s} color={CM} dash="5 5" />
							<path d={`M${s.X(0)},${s.Y(0)}` + ts.slice().reverse().map((u) => `L${s.X(1 - Phi(u))},${s.Y(1 - Phi(u - d))}`).join('') + `L${s.X(1)},${s.Y(0)}Z`} fill={CV} opacity={0.12} />
							<Path pts={ts.slice().reverse().map((u) => [1 - Phi(u), 1 - Phi(u - d)])} s={s} color={CV} width={2.4} />
							<circle cx={s.X(fpr)} cy={s.Y(tpr)} r={7} fill={CA} stroke="var(--pg-surface)" strokeWidth={2} />
						</>
					)}
				</Plot>
			</div>
			<Legend items={[[C0, 'sanos (negativos)'], [C1, 'enfermos (positivos)'], [CV, `ROC · AUC = ${auc.toFixed(3)}`], [CA, 'umbral actual']]} />
			<div className="pg-grid-2">
				<div className="cm">
					<div className="h" />
					<div className="h">predice −</div>
					<div className="h">predice +</div>
					<div className="h">real −</div>
					<div className="ok"><b>{TN.toLocaleString('es-PE')}</b>TN</div>
					<div className="bad"><b>{FP.toLocaleString('es-PE')}</b>FP · falsa alarma</div>
					<div className="h">real +</div>
					<div className="bad"><b>{FN.toLocaleString('es-PE')}</b>FN · se escapa</div>
					<div className="ok"><b>{TP.toLocaleString('es-PE')}</b>TP</div>
				</div>
				<div className="pg-stats">
					<Stat k="accuracy" v={pct(acc)} />
					<Stat k="precision TP/(TP+FP)" v={pct(prec)} />
					<Stat k="recall TP/(TP+FN)" v={pct(rec)} />
					<Stat k="F1 = 2PR/(P+R)" v={f1.toFixed(3)} color="var(--sl-color-accent)" />
				</div>
			</div>
			<div className={`pg-note ${acc > 0.9 && f1 < 0.4 ? 'warn' : ''}`}>
				{acc > 0.9 && f1 < 0.4 ? (
					<>Accuracy de {pct(acc)} pero F1 de {f1.toFixed(2)}: con clases desbalanceadas la accuracy <b>miente</b>. «Siempre di sano» saca 99% y recall 0.</>
				) : (
					<>Bajar el umbral atrapa más enfermos (recall ↑, FN ↓) a costa de más falsas alarmas (precision ↓). La ROC recorre todos los umbrales; el AUC mide la calidad del ranking, independiente del umbral (0.5 = azar, 1 = perfecto).</>
				)}
			</div>
		</div>
	);
}

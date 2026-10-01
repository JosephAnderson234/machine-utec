import { useState } from 'react';
import Tex from '../ui/Tex';
import { Stat } from '../ui/Plot';

const PRESETS: { n: string; d: string; v: [number, number, number, number]; foco: string }[] = [
	{ n: 'Tamizaje (slide)', d: '10 000 personas, 1% enfermas', v: [80, 300, 20, 9600], foco: 'Aquí un **FN** (enfermo que se escapa) es lo más caro: se prioriza el **recall** y los positivos se confirman con una segunda prueba.' },
	{ n: 'Cáncer de mama (slide)', d: 'test set de scikit-learn', v: [87, 3, 3, 50], foco: 'Clases relativamente balanceadas: accuracy, precision y recall cuentan la misma historia (≈0.96).' },
	{ n: 'Filtro de spam', d: '1 000 correos, 30% spam', v: [270, 5, 30, 695], foco: 'Un **FP** (correo legítimo enviado a spam) es lo más molesto: se prioriza la **precision**, aunque se escape algo de spam.' },
	{ n: 'Fraude con tarjeta', d: '100 000 transacciones, 0.2% fraude', v: [150, 900, 50, 98900], foco: 'Desbalance extremo: la accuracy es 99% pero solo 14% de las alertas son fraude real. Se miran precision/recall y la curva PR.' },
	{ n: '«Siempre negativo»', d: 'el clasificador perezoso', v: [0, 0, 100, 9900], foco: '99% de accuracy y **recall 0**: no detecta a nadie. Por esto la accuracy sola no sirve con clases raras.' },
];

const pct = (v: number) => (Number.isFinite(v) ? `${(100 * v).toFixed(1)}%` : '—');

/** Calculadora de métricas a partir de la matriz de confusión, con escenarios reales. */
export default function ConfusionCalc() {
	const [v, setV] = useState<[number, number, number, number]>(PRESETS[0].v);
	const [pi, setPi] = useState(0);
	const [TP, FP, FN, TN] = v;
	const N = TP + FP + FN + TN;
	const acc = (TP + TN) / N;
	const prec = TP / (TP + FP);
	const rec = TP / (TP + FN);
	const spec = TN / (TN + FP);
	const fpr = FP / (FP + TN);
	const f1 = (2 * prec * rec) / (prec + rec);
	const bal = (rec + spec) / 2;
	const set = (k: number, x: number) => {
		const nv = [...v] as [number, number, number, number];
		nv[k] = Math.max(0, Math.round(x));
		setV(nv);
		setPi(-1);
	};
	const cell = (k: number, lab: string, cls: string) => (
		<div className={cls}>
			<input className="num" type="number" min={0} value={v[k]} onChange={(e) => set(k, Number(e.target.value))} style={{ width: '6.5rem' }} />
			<div style={{ fontSize: '0.75rem', marginTop: 4 }}>{lab}</div>
		</div>
	);
	const bold = (t: string) => t.split(/(\*\*[^*]+\*\*)/).map((p, i) => (p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>));

	return (
		<div className="pg not-content">
			<h4>Calculadora de métricas: elige un escenario o escribe tu matriz</h4>
			<div className="pg-seg">
				{PRESETS.map((p, i) => (
					<button key={p.n} className={pi === i ? 'active' : ''} onClick={() => { setV(p.v); setPi(i); }}>
						{p.n}
					</button>
				))}
			</div>
			{pi >= 0 && <p className="pg-sub" style={{ marginTop: 0 }}>{PRESETS[pi].d}</p>}
			<div className="cm" style={{ maxWidth: 520 }}>
				<div className="h" />
				<div className="h">predice negativo</div>
				<div className="h">predice positivo</div>
				<div className="h">real negativo</div>
				{cell(3, 'TN · verdadero negativo', 'ok')}
				{cell(1, 'FP · falsa alarma', 'bad')}
				<div className="h">real positivo</div>
				{cell(2, 'FN · se escapó', 'bad')}
				{cell(0, 'TP · verdadero positivo', 'ok')}
			</div>
			<div className="pg-stats">
				<Stat k="accuracy" v={pct(acc)} />
				<Stat k="precision" v={pct(prec)} />
				<Stat k="recall (sensibilidad, TPR)" v={pct(rec)} />
				<Stat k="especificidad (TNR)" v={pct(spec)} />
				<Stat k="FPR = 1 − especificidad" v={pct(fpr)} />
				<Stat k="F1" v={Number.isFinite(f1) ? f1.toFixed(3) : '—'} color="var(--sl-color-accent)" />
				<Stat k="accuracy balanceada" v={pct(bal)} />
				<Stat k="prevalencia real" v={pct((TP + FN) / N)} />
			</div>
			<div className="matrix-wrap">
				<Tex block>{`\\text{prec} = \\tfrac{${TP}}{${TP}+${FP}} = ${Number.isFinite(prec) ? prec.toFixed(3) : '-'},\\quad \\text{rec} = \\tfrac{${TP}}{${TP}+${FN}} = ${Number.isFinite(rec) ? rec.toFixed(3) : '-'},\\quad F_1 = \\tfrac{2PR}{P+R} = ${Number.isFinite(f1) ? f1.toFixed(3) : '-'}`}</Tex>
			</div>
			{pi >= 0 && <div className="pg-note">{bold(PRESETS[pi].foco)}</div>}
			<div className="pg-note warn">
				Regla para elegir: si un <b>FN</b> es caro (enfermedad, fraude que se escapa) ⇒ prioriza recall y baja el umbral. Si un <b>FP</b> es caro (bloquear a un cliente legítimo, mandar un correo importante a spam) ⇒ prioriza precision y sube el umbral. F1 equilibra ambos cuando los dos importan.
			</div>
		</div>
	);
}

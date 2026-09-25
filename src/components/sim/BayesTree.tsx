import { useState } from 'react';
import Tex from '../ui/Tex';
import { Slider, Stat } from '../ui/Plot';

/** Bayes con frecuencias naturales: 10 000 personas, prior, sensibilidad y falsas alarmas. */
export default function BayesTree({ prior0 = 1, sens0 = 80, fpr0 = 3 }: { prior0?: number; sens0?: number; fpr0?: number }) {
	const [prior, setPrior] = useState(prior0); // %
	const [sens, setSens] = useState(sens0); // %
	const [fpr, setFpr] = useState(fpr0); // %
	const N = 10000;
	const sick = Math.round((N * prior) / 100);
	const healthy = N - sick;
	const tp = Math.round((sick * sens) / 100);
	const fn = sick - tp;
	const fp = Math.round((healthy * fpr) / 100);
	const tn = healthy - fp;
	const post = tp + fp ? tp / (tp + fp) : 0;
	const exact = (prior / 100) * (sens / 100) / ((prior / 100) * (sens / 100) + (1 - prior / 100) * (fpr / 100) || 1);

	const W = 640;
	const node = (x: number, y: number, label: string, n: number, cls: string, sub?: string) => (
		<g>
			<rect x={x - 62} y={y - 22} width={124} height={44} rx={10} className={cls} />
			<text x={x} y={y - 3} textAnchor="middle" className="t-b" style={{ fontSize: 13 }}>
				{label}
			</text>
			<text x={x} y={y + 14} textAnchor="middle" className="t-s">
				{n.toLocaleString('es-PE')} {sub ?? ''}
			</text>
		</g>
	);
	const edge = (x1: number, y1: number, x2: number, y2: number, lab: string, hl = false) => (
		<g>
			<path d={`M${x1},${y1 + 22} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2 - 22}`} className={hl ? 'ln-a' : 'ln'} />
			<text x={(x1 + x2) / 2 + (x2 > x1 ? 10 : -10)} y={(y1 + y2) / 2} textAnchor={x2 > x1 ? 'start' : 'end'} className="t-s">
				{lab}
			</text>
		</g>
	);

	return (
		<div className="pg not-content">
			<h4>Bayes contando personas</h4>
			<p className="pg-sub">Mueve el prior (prevalencia), la sensibilidad del test y su tasa de falsas alarmas. La pregunta del paciente es siempre la misma: dado que salí positivo, ¿qué tan probable es que esté enfermo?</p>
			<div className="pg-row">
				<Slider label="Prevalencia (prior)" value={prior} min={0.1} max={50} step={0.1} onChange={setPrior} show={`${prior}%`} />
				<Slider label="Sensibilidad p(+|enfermo)" value={sens} min={1} max={100} step={1} onChange={setSens} show={`${sens}%`} />
				<Slider label="Falsa alarma p(+|sano)" value={fpr} min={0} max={50} step={0.5} onChange={setFpr} show={`${fpr}%`} />
			</div>
			<figure className="diagram" style={{ margin: 0, padding: '0.5rem', boxShadow: 'none' }}>
				<svg viewBox={`0 0 ${W} 250`}>
					{edge(320, 34, 170, 118, `${prior}%`)}
					{edge(320, 34, 470, 118, `${(100 - prior).toFixed(1)}%`)}
					{edge(170, 118, 90, 210, `${sens}%`, true)}
					{edge(170, 118, 250, 210, `${100 - sens}%`)}
					{edge(470, 118, 390, 210, `${fpr}%`, true)}
					{edge(470, 118, 550, 210, `${(100 - fpr).toFixed(1)}%`)}
					{node(320, 34, 'Población', N, 'box')}
					{node(170, 118, 'Enfermos', sick, 'box-o')}
					{node(470, 118, 'Sanos', healthy, 'box')}
					{node(90, 210, 'Test + (TP)', tp, 'box-a')}
					{node(250, 210, 'Test − (FN)', fn, 'box')}
					{node(390, 210, 'Test + (FP)', fp, 'box-a')}
					{node(550, 210, 'Test − (TN)', tn, 'box')}
				</svg>
			</figure>
			<div className="pg-stats">
				<Stat k="positivos totales" v={(tp + fp).toLocaleString('es-PE')} />
				<Stat k="de ellos, enfermos" v={tp.toLocaleString('es-PE')} />
				<Stat k="P(enfermo | +)" v={`${(100 * post).toFixed(1)}%`} color="var(--sl-color-accent)" />
				<Stat k="likelihood p(+|enfermo)" v={`${sens}%`} />
			</div>
			<div className="formula">
				<Tex block>{`P(\\text{enf}\\mid +) = \\frac{\\pi\\,p(+\\mid\\text{enf})}{\\pi\\,p(+\\mid\\text{enf}) + (1-\\pi)\\,p(+\\mid\\text{sano})} = \\frac{${(prior / 100).toFixed(3)}\\cdot ${(sens / 100).toFixed(2)}}{${(prior / 100).toFixed(3)}\\cdot ${(sens / 100).toFixed(2)} + ${(1 - prior / 100).toFixed(3)}\\cdot ${(fpr / 100).toFixed(3)}} \\approx ${exact.toFixed(3)}`}</Tex>
			</div>
			<div className={`pg-note ${post < 0.5 ? 'warn' : 'ok'}`}>
				{post < 0.5 ? (
					<>La mayoría de positivos son <b>falsas alarmas</b>: la tasa base (prior) domina. Nota que {`P(+|enfermo) = ${sens}%`} pero {`P(enfermo|+) = ${(100 * post).toFixed(0)}%`}: invertir la barra «|» cambia la pregunta.</>
				) : (
					<>Con una prevalencia alta o un test muy específico, el posterior ya supera 50%. Este mismo número es la <b>precision</b> del test (sesión 04).</>
				)}
			</div>
		</div>
	);
}

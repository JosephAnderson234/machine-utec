import { useMemo, useState } from 'react';
import Plot, { Path, CA, CM, CV, CR, Slider, Legend } from '../ui/Plot';
import { polyEval, polyRow, range, ridge, sineData, mean } from '../ui/math';

const XS = range(0.02, 0.98, 60);
const truth = (x: number) => Math.sin(2 * Math.PI * x);
const SIG = 0.25;

/** Experimento mental hecho real: re-muestrear, re-ajustar y medir sesgo² y varianza. */
export default function BiasVariance() {
	const [deg, setDeg] = useState(1);
	const [K, setK] = useState(30);
	const [n, setN] = useState(15);

	const { fits, avg, bias2, vari } = useMemo(() => {
		const fits: number[][] = [];
		for (let k = 0; k < K; k++) {
			const d = sineData(n, SIG, 500 + k);
			const w = ridge(d.map((p) => polyRow(p.x, deg)), d.map((p) => p.y), 1e-9);
			fits.push(XS.map((x) => polyEval(w, x)));
		}
		const avg = XS.map((_, i) => mean(fits.map((f) => f[i])));
		const bias2 = mean(XS.map((x, i) => (avg[i] - truth(x)) ** 2));
		const vari = mean(XS.map((_, i) => mean(fits.map((f) => (f[i] - avg[i]) ** 2))));
		return { fits, avg, bias2, vari };
	}, [deg, K, n]);

	const total = bias2 + vari + SIG * SIG;
	const bar = (v: number, c: string) => <i style={{ width: `${Math.min(100, (100 * v) / Math.max(total, 0.2))}%`, background: c }} />;

	return (
		<div className="pg not-content">
			<h4>Re-muestrear y re-ajustar: sesgo y varianza medidos</h4>
			<p className="pg-sub">Cada línea gris es el mismo modelo entrenado con un training set distinto (otra muestra del mismo proceso). La línea violeta es su promedio f̄. Sesgo = distancia de f̄ a la verdad; varianza = cuánto se dispersan las grises.</p>
			<div className="pg-row">
				<Slider label="grado (flexibilidad)" value={deg} min={0} max={10} step={1} onChange={setDeg} />
				<Slider label="nº de training sets" value={K} min={5} max={60} step={1} onChange={setK} />
				<Slider label="n por training set" value={n} min={8} max={80} step={1} onChange={setN} />
			</div>
			<Plot x={[0, 1]} y={[-2.2, 2.2]} h={330} xlabel="x">
				{(s) => (
					<>
						{fits.map((f, k) => (
							<Path key={k} pts={XS.map((x, i) => [x, f[i]])} s={s} color={CM} width={1} opacity={0.35} />
						))}
						<Path pts={XS.map((x) => [x, truth(x)])} s={s} color={CA} width={2.4} dash="6 4" />
						<Path pts={XS.map((x, i) => [x, avg[i]])} s={s} color={CV} width={2.8} />
					</>
				)}
			</Plot>
			<Legend items={[[CM, 'un ajuste (un training set)'], [CV, 'promedio f̄ = E[ŷ]'], [CA, 'verdad f(x)', 'd']]} />
			<div className="kv" style={{ gridTemplateColumns: '9rem 1fr 4.5rem', alignItems: 'center' }}>
				<span>sesgo²</span>
				<div className="bar-h">{bar(bias2, CV)}</div>
				<span>{bias2.toFixed(3)}</span>
				<span>varianza</span>
				<div className="bar-h">{bar(vari, CR)}</div>
				<span>{vari.toFixed(3)}</span>
				<span>ruido σ²</span>
				<div className="bar-h">{bar(SIG * SIG, CM)}</div>
				<span>{(SIG * SIG).toFixed(3)}</span>
				<span>
					<b>error esperado</b>
				</span>
				<div className="bar-h">{bar(total, CA)}</div>
				<span>{total.toFixed(3)}</span>
			</div>
			<div className={`pg-note ${bias2 > vari ? 'warn' : 'bad'}`}>
				{bias2 > vari ? (
					<>Domina el <b>sesgo</b>: las grises están juntas (baja varianza) pero lejos de la verdad. Es underfitting: el estudiante que siempre responde «C».</>
				) : (
					<>Domina la <b>varianza</b>: cada training set da una curva muy distinta, aunque en promedio se acercan a la verdad. Es overfitting. Remedios: más datos (sube n), regularizar, o bajar el grado.</>
				)}{' '}
				El piso σ² = {(SIG * SIG).toFixed(4)} no lo baja ningún modelo.
			</div>
		</div>
	);
}

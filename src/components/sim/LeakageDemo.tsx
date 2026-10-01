import { useMemo, useState } from 'react';
import Plot, { CA, CR, CM, Slider, Stat, Legend } from '../ui/Plot';
import { rng } from '../ui/math';

/**
 * La maldición del ganador: con etiquetas de PURO RUIDO, probamos M «modelos» al azar,
 * elegimos el mejor en validación y luego lo medimos en un test nuevo.
 */
export default function LeakageDemo() {
	const [M, setM] = useState(100);
	const [nVal, setNVal] = useState(50);
	const [seed, setSeed] = useState(1);

	const { accs, best, testAcc } = useMemo(() => {
		const r = rng(seed * 7919 + M + nVal);
		const yVal = Array.from({ length: nVal }, () => (r.next() < 0.5 ? 1 : 0));
		const yTest = Array.from({ length: 500 }, () => (r.next() < 0.5 ? 1 : 0));
		const accs: number[] = [];
		let best = 0;
		for (let m = 0; m < M; m++) {
			// un «modelo» sin información real: predicciones aleatorias
			let ok = 0;
			for (let i = 0; i < nVal; i++) ok += (r.next() < 0.5 ? 1 : 0) === yVal[i] ? 1 : 0;
			accs.push(ok / nVal);
			if (ok / nVal > accs[best]) best = m;
		}
		// el ganador aplicado a datos nuevos: sigue siendo una moneda
		let ok = 0;
		for (let i = 0; i < yTest.length; i++) ok += (r.next() < 0.5 ? 1 : 0) === yTest[i] ? 1 : 0;
		return { accs, best, testAcc: ok / yTest.length };
	}, [M, nVal, seed]);

	// histograma
	const bins = 20;
	const counts = new Array(bins).fill(0);
	accs.forEach((a) => (counts[Math.min(bins - 1, Math.floor(a * bins))] += 1));
	const maxC = Math.max(...counts, 1);
	const bestAcc = accs[best];

	return (
		<div className="pg not-content">
			<h4>La maldición del ganador (y por qué el test se usa una vez)</h4>
			<p className="pg-sub">Las etiquetas son <b>puro ruido</b>: ningún modelo puede superar 50% de verdad. Aun así, si pruebas muchos modelos y te quedas con el mejor en validación, su score de validación sale inflado. En el test nuevo vuelve a ~50%.</p>
			<div className="pg-row">
				<Slider label="modelos (o hiperparámetros) probados" value={M} min={1} max={1000} step={1} onChange={setM} />
				<Slider label="tamaño del conjunto de validación" value={nVal} min={10} max={500} step={10} onChange={setNVal} />
				<button onClick={() => setSeed(seed + 1)}>Repetir experimento</button>
			</div>
			<Plot x={[0, 1]} y={[0, maxC * 1.15]} h={260} xlabel="accuracy en validación" yticks={[]}>
				{(s) => (
					<>
						{counts.map((c, i) => (
							<rect key={i} x={s.X(i / bins) + 1} y={s.Y(c)} width={s.X(1 / bins) - s.X(0) - 2} height={s.Y(0) - s.Y(c)} fill={CM} opacity={0.55} rx={2} />
						))}
						<line x1={s.X(0.5)} x2={s.X(0.5)} y1={s.y0} y2={s.y1} stroke={CM} strokeDasharray="4 4" />
						<line x1={s.X(bestAcc)} x2={s.X(bestAcc)} y1={s.y0} y2={s.y1} stroke={CR} strokeWidth={2.5} />
						<line x1={s.X(testAcc)} x2={s.X(testAcc)} y1={s.y0} y2={s.y1} stroke={CA} strokeWidth={2.5} />
					</>
				)}
			</Plot>
			<Legend items={[[CM, 'accuracy de validación de cada modelo'], [CR, 'el «ganador» en validación'], [CA, 'el ganador en un test nuevo']]} />
			<div className="pg-stats">
				<Stat k="mejor accuracy en validación" v={`${(100 * bestAcc).toFixed(1)}%`} color={CR} />
				<Stat k="ese modelo en test nuevo" v={`${(100 * testAcc).toFixed(1)}%`} color={CA} />
				<Stat k="optimismo (sesgo de selección)" v={`+${(100 * (bestAcc - testAcc)).toFixed(1)} pts`} />
			</div>
			<div className="pg-note warn">
				Con {M} intentos y {nVal} puntos de validación, el mejor «acierta» {(100 * bestAcc).toFixed(0)}% por pura suerte. Más intentos o menos datos de validación ⇒ más optimismo. Por eso: (1) el score que usaste para <b>elegir</b> no es una estimación honesta; (2) el <b>test</b> se reserva y se usa <b>una sola vez</b>; (3) K-fold reduce el ruido de la validación, y la CV anidada mide el procedimiento completo de selección.
			</div>
		</div>
	);
}

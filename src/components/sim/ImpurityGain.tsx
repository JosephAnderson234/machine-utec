import { useState } from 'react';
import Plot, { Path, CA, C0, C1, CM, CV, Slider, Stat, Legend } from '../ui/Plot';
import { range } from '../ui/math';

const gini = (p: number) => 2 * p * (1 - p);
const ent = (p: number) => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)));
const err = (p: number) => Math.min(p, 1 - p);
const CRIT = { gini: { f: gini, n: 'Gini', c: CA }, ent: { f: ent, n: 'entropía (bits)', c: CV }, err: { f: err, n: 'error', c: C1 } } as const;
type K = keyof typeof CRIT;

const PRESETS: { n: string; L: [number, number]; R: [number, number] }[] = [
	{ n: 'Raíz: x₁ ≤ 3.5', L: [3, 0], R: [2, 5] },
	{ n: 'Nodo B: x₂ ≤ 6.5 (hoja pura)', L: [2, 2], R: [0, 3] },
	{ n: 'Ganancia cero: x₂ ≤ 2.5', L: [1, 1], R: [4, 4] },
	{ n: 'Nodo D: x₂ ≤ 2.5', L: [0, 1], R: [2, 0] },
];

/** Impureza como curva cóncava y la ganancia como distancia de la curva a la cuerda. */
export default function ImpurityGain() {
	const [L, setL] = useState<[number, number]>([3, 0]);
	const [R, setR] = useState<[number, number]>([2, 5]);
	const [k, setK] = useState<K>('gini');
	const nL = L[0] + L[1],
		nR = R[0] + R[1],
		n = nL + nR;
	const pL = nL ? L[1] / nL : 0,
		pR = nR ? R[1] / nR : 0,
		p = n ? (L[1] + R[1]) / n : 0;
	const gain = (c: K) => CRIT[c].f(p) - (nL / n) * CRIT[c].f(pL) - (nR / n) * CRIT[c].f(pR);
	const F = CRIT[k].f;
	const chordAt = (nL / n) * F(pL) + (nR / n) * F(pR);
	const ps = range(0, 1, 200);

	const counter = (lab: string, v: [number, number], set: (v: [number, number]) => void) => (
		<div style={{ flex: '1 1 14rem' }}>
			<span className="lane-label">{lab}</span>
			<div className="pg-row">
				<Slider label="clase 0" value={v[0]} min={0} max={10} step={1} onChange={(x) => set([x, v[1]])} />
				<Slider label="clase 1" value={v[1]} min={0} max={10} step={1} onChange={(x) => set([v[0], x])} />
			</div>
		</div>
	);

	return (
		<div className="pg not-content">
			<h4>La ganancia es el hueco entre la curva y la cuerda</h4>
			<p className="pg-sub">Un split parte un nodo en dos hijos. La fracción del padre es un promedio ponderado de las de los hijos, así que la impureza ponderada de los hijos es la <b>cuerda</b>; si la impureza es cóncava, la curva queda encima y la ganancia ≥ 0.</p>
			<div className="pg-seg">
				{PRESETS.map((pr) => (
					<button key={pr.n} onClick={() => { setL(pr.L); setR(pr.R); }}>{pr.n}</button>
				))}
			</div>
			<div className="pg-row">
				{counter(`hijo izquierdo · n = ${nL}`, L, setL)}
				{counter(`hijo derecho · n = ${nR}`, R, setR)}
			</div>
			<div className="pg-seg">
				{(Object.keys(CRIT) as K[]).map((c) => (
					<button key={c} className={c === k ? 'active' : ''} onClick={() => setK(c)}>{CRIT[c].n}</button>
				))}
			</div>
			<Plot x={[0, 1]} y={[0, 1.05]} h={330} xlabel="fracción de clase 1 en el nodo, p̂" ylabel="impureza">
				{(s) => (
					<>
						{(Object.keys(CRIT) as K[]).map((c) => (
							<Path key={c} pts={ps.map((q) => [q, CRIT[c].f(q)])} s={s} color={CRIT[c].c} width={c === k ? 2.8 : 1.2} opacity={c === k ? 1 : 0.35} />
						))}
						{nL > 0 && nR > 0 && (
							<>
								<Path pts={[[pL, F(pL)], [pR, F(pR)]]} s={s} color="var(--sl-color-white)" width={1.6} dash="5 4" />
								<line x1={s.X(p)} x2={s.X(p)} y1={s.Y(F(p))} y2={s.Y(chordAt)} stroke={CA} strokeWidth={4} opacity={0.9} />
								<circle cx={s.X(pL)} cy={s.Y(F(pL))} r={6} fill={C0} />
								<circle cx={s.X(pR)} cy={s.Y(F(pR))} r={6} fill={C0} />
								<circle cx={s.X(p)} cy={s.Y(F(p))} r={6.5} fill={CA} stroke="var(--pg-surface)" strokeWidth={2} />
								<text x={s.X(pL)} y={s.Y(F(pL)) - 10} textAnchor="middle" fontSize={11} fill="var(--sl-color-white)">izq</text>
								<text x={s.X(pR)} y={s.Y(F(pR)) - 10} textAnchor="middle" fontSize={11} fill="var(--sl-color-white)">der</text>
								<text x={s.X(p) + 8} y={s.Y(F(p)) - 8} fontSize={11} fill="var(--sl-color-accent)">padre</text>
							</>
						)}
					</>
				)}
			</Plot>
			<Legend items={[[CA, 'Gini 1 − Σp̂²'], [CV, 'entropía −Σp̂ log₂p̂'], [C1, 'error 1 − max p̂'], [CM, 'cuerda (impureza ponderada de los hijos)', 'd']]} />
			<div className="pg-stats">
				<Stat k="ganancia Gini" v={gain('gini').toFixed(4)} color={CA} />
				<Stat k="ganancia entropía" v={gain('ent').toFixed(4)} color={CV} />
				<Stat k="ganancia error" v={gain('err').toFixed(4)} color={C1} />
				<Stat k="padre" v={`[${L[0] + R[0]}, ${L[1] + R[1]}]`} />
			</div>
			<div className={`pg-note ${Math.abs(gain('err')) < 1e-9 && gain('gini') > 1e-9 ? 'warn' : ''}`}>
				{Math.abs(gain('gini')) < 1e-9 && nL && nR ? (
					<>Los dos hijos tienen <b>la misma proporción</b> que el padre: la cuerda toca la curva y la ganancia es 0 con los tres criterios. El split separó puntos pero no aprendió nada.</>
				) : Math.abs(gain('err')) < 1e-9 ? (
					<>El error rate da ganancia <b>0</b> aunque el split produce una hoja pura: ambos hijos mantienen la misma clase mayoritaria y, en ese tramo, la curva del error es una <b>recta</b> (la cuerda cae sobre ella). Un algoritmo codicioso con error rate se detendría aquí. Por eso se crece con Gini o entropía.</>
				) : (
					<>Los pesos nL/n y nR/n no son decorativos: sin ellos, una hojita pura podría «ganarle» a un hijo grande y mezclado. Gini y entropía son <b>estrictamente cóncavas</b>, así que la ganancia es &gt; 0 siempre que p̂L ≠ p̂R.</>
				)}
			</div>
		</div>
	);
}

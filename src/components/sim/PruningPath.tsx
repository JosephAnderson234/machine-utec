import { useState } from 'react';
import Plot, { Path, CA, CM, Slider, Stat } from '../ui/Plot';

const TREES = [
	{ L: 4, R: 0, desc: 'árbol completo: A, C, E, F', rules: ['x₁ ≤ 3.5 → 0', 'x₁ > 3.5, x₂ > 5.5 → 1', 'x₁ > 3.5, 2.5 < x₂ ≤ 5.5 → 0', 'x₁ > 3.5, x₂ ≤ 2.5 → 1'] },
	{ L: 3, R: 2 / 15, desc: 'se colapsa D (E y F)', rules: ['x₁ ≤ 3.5 → 0', 'x₁ > 3.5, x₂ > 5.5 → 1', 'x₁ > 3.5, x₂ ≤ 5.5 → 0 (D = [2,1])'] },
	{ L: 2, R: 2 / 7, desc: 'se colapsa B', rules: ['x₁ ≤ 3.5 → 0', 'x₁ > 3.5 → 1 (B = [2,5])'] },
	{ L: 1, R: 1 / 2, desc: 'solo la raíz', rules: ['todo → empate [5,5]'] },
];
const COLS = ['var(--pg-c1)', 'var(--pg-c3)', 'var(--pg-c2)', 'var(--pg-c5)'];
const BREAKS = [2 / 15, 16 / 105, 3 / 14];

/** Poda por costo-complejidad: cada subárbol es una recta R(T) + α|T|; gana la más baja. */
export default function PruningPath() {
	const [a, setA] = useState(0.1);
	const costs = TREES.map((t) => t.R + a * t.L);
	const win = costs.indexOf(Math.min(...costs));
	return (
		<div className="pg not-content">
			<h4>α compra hojas: la ruta de poda de los 10 puntos</h4>
			<p className="pg-sub">R(T) es el riesgo de entrenamiento (impureza de Gini ponderada de las hojas). Cada hoja cuesta α. Mueve α y observa qué subárbol tiene el menor costo: solo cuatro pueden ganar.</p>
			<Slider label="α (precio por hoja)" value={a} min={0} max={0.28} step={0.002} onChange={setA} show={a.toFixed(3)} />
			<Plot x={[0, 0.28]} y={[0, 1]} h={320} xlabel="α" ylabel="C_α(T) = R(T) + α|T|">
				{(s) => (
					<>
						{BREAKS.map((b) => (
							<line key={b} x1={s.X(b)} x2={s.X(b)} y1={s.y0} y2={s.y1} stroke={CM} strokeDasharray="3 4" />
						))}
						{TREES.map((t, i) => (
							<Path key={i} pts={[[0, t.R], [0.28, t.R + 0.28 * t.L]]} s={s} color={COLS[i]} width={i === win ? 3.2 : 1.5} opacity={i === win ? 1 : 0.55} />
						))}
						<line x1={s.X(a)} x2={s.X(a)} y1={s.y0} y2={s.y1} stroke={CA} strokeWidth={2} />
						<circle cx={s.X(a)} cy={s.Y(costs[win])} r={6} fill={COLS[win]} stroke="var(--pg-surface)" strokeWidth={2} />
					</>
				)}
			</Plot>
			<div className="legend">
				{TREES.map((t, i) => (
					<span key={i}>
						<i style={{ background: COLS[i] }} />
						{t.L} hojas: {t.R.toFixed(3)} + {t.L}α
					</span>
				))}
			</div>
			<div className="pg-stats">
				<Stat k="subárbol ganador" v={`${TREES[win].L} hojas`} color={COLS[win]} />
				<Stat k="R(T)" v={TREES[win].R.toFixed(4)} />
				<Stat k="costo C_α" v={costs[win].toFixed(4)} />
			</div>
			<div className="pg-note">
				<b>{TREES[win].desc}.</b> Reglas: {TREES[win].rules.join(' · ')}. Los cortes ocurren en α = 2/15 ≈ 0.133, 16/105 ≈ 0.152 y 3/14 ≈ 0.214 (exactamente lo que devuelve <span className="mono">cost_complexity_pruning_path</span>). Aunque α es continuo, la ruta es una escalera finita: se busca en una lista corta, eligiendo α por validación cruzada.
			</div>
		</div>
	);
}

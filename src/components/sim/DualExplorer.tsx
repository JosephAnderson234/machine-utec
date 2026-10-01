import { useState } from 'react';
import Plot, { CA, CV, Slider, Stat } from '../ui/Plot';
import Tex from '../ui/Tex';

// ejemplo de la clase: x1=(2,0)+, x2=(0,2)+, x3=(0,0)−
const X = [
	[2, 0],
	[0, 2],
	[0, 0],
];
const Y = [1, 1, -1];

/** El dual del ejemplo de tres puntos: busca a mano los α que maximizan W(α). */
export default function DualExplorer() {
	const [a1, setA1] = useState(0.2);
	const [a2, setA2] = useState(0.7);
	const a3 = a1 + a2; // Σ αᵢyᵢ = 0  ⇒  α₃ = α₁ + α₂
	const al = [a1, a2, a3];
	const w = [0, 0];
	al.forEach((a, i) => {
		w[0] += a * Y[i] * X[i][0];
		w[1] += a * Y[i] * X[i][1];
	});
	const W = (p: number, q: number) => {
		const A = [p, q, p + q];
		let quad = 0;
		for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) quad += A[i] * A[j] * Y[i] * Y[j] * (X[i][0] * X[j][0] + X[i][1] * X[j][1]);
		return A[0] + A[1] + A[2] - 0.5 * quad;
	};
	const val = W(a1, a2);
	// mapa de calor de W en la caja [0,1]²
	const N = 40;
	const cells: { p: number; q: number; v: number }[] = [];
	for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cells.push({ p: (i + 0.5) / N, q: (j + 0.5) / N, v: W((i + 0.5) / N, (j + 0.5) / N) });
	const vmin = Math.min(...cells.map((c) => c.v)),
		vmax = Math.max(...cells.map((c) => c.v));

	return (
		<div className="pg not-content">
			<h4>Encuentra el óptimo del dual a mano</h4>
			<p className="pg-sub">
				Puntos (2,0)⁺, (0,2)⁺ y (0,0)⁻. La restricción Σαᵢyᵢ = 0 obliga a α₃ = α₁ + α₂, así que el dual depende de dos números. Mueve α₁ y α₂ hasta maximizar W(α); el mapa muestra W (color más intenso = mayor).
			</p>
			<div className="pg-row">
				<Slider label="α₁" value={a1} min={0} max={1} step={0.01} onChange={setA1} />
				<Slider label="α₂" value={a2} min={0} max={1} step={0.01} onChange={setA2} />
			</div>
			<div className="pg-grid-2" style={{ alignItems: 'center' }}>
				<Plot x={[0, 1]} y={[0, 1]} w={360} h={340} xlabel="α₁" ylabel="α₂">
					{(s) => (
						<>
							{cells.map((c, k) => (
								<rect key={k} x={s.X(c.p - 0.5 / N)} y={s.Y(c.q + 0.5 / N)} width={s.X(1 / N) - s.X(0) + 0.5} height={s.Y(0) - s.Y(1 / N) + 0.5} fill={CA} opacity={0.05 + 0.85 * ((c.v - vmin) / (vmax - vmin)) ** 2} />
							))}
							<circle cx={s.X(0.5)} cy={s.Y(0.5)} r={6} fill="none" stroke="var(--sl-color-white)" strokeWidth={1.5} strokeDasharray="3 2" />
							<circle cx={s.X(a1)} cy={s.Y(a2)} r={7} fill={CV} stroke="var(--pg-surface)" strokeWidth={2} />
						</>
					)}
				</Plot>
				<div>
					<div className="pg-stats">
						<Stat k="α = (α₁, α₂, α₃)" v={`(${a1.toFixed(2)}, ${a2.toFixed(2)}, ${a3.toFixed(2)})`} />
						<Stat k="W(α)" v={val.toFixed(4)} color={CA} />
						<Stat k="w = Σ αᵢyᵢxᵢ" v={`(${w[0].toFixed(2)}, ${w[1].toFixed(2)})`} />
						<Stat k="½‖w‖² (primal)" v={(0.5 * (w[0] ** 2 + w[1] ** 2)).toFixed(4)} />
					</div>
				</div>
			</div>
			<div className="matrix-wrap">
				<Tex block>{`W(\\alpha) = \\sum_i\\alpha_i - \\tfrac12\\|\\textstyle\\sum_i\\alpha_iy_i\\mathbf{x}_i\\|^2 = 2(\\alpha_1+\\alpha_2) - \\tfrac12\\big[(2\\alpha_1)^2 + (2\\alpha_2)^2\\big] = ${val.toFixed(4)}`}</Tex>
			</div>
			<div className={`pg-note ${Math.abs(val - 1) < 0.005 ? 'ok' : ''}`}>
				{Math.abs(val - 1) < 0.005 ? (
					<>¡Óptimo! α = (½, ½, 1), W = 1 = ½‖w‖² con w = (1, 1): <b>dualidad fuerte</b>, brecha cero. Y Σαᵢ = 2 = ‖w‖².</>
				) : (
					<>
						Como W = 2α₁ − 2α₁² + 2α₂ − 2α₂², cada término es una parábola con máximo en ½. Fuera del óptimo, el valor dual W(α) queda <b>por debajo</b> del primal ½‖w*‖² = 1 (dualidad débil): todo α factible da una cota inferior.
					</>
				)}
			</div>
		</div>
	);
}

import { useState } from 'react';
import Plot, { Path, CA, CM, CV, CR, Slider, Stat } from '../ui/Plot';
import Tex from '../ui/Tex';
import { range } from '../ui/math';

/** El multiplicador como precio: min (x−3)² s.a. x ≤ c. Primal, J*(c) y la función dual. */
export default function LagrangeWall() {
	const [c, setC] = useState(1);
	const xstar = Math.min(c, 3);
	const Jstar = (xstar - 3) ** 2;
	const alpha = Math.max(0, 2 * (3 - c));
	const g = c - xstar; // holgura de la regla g(x) = c − x ≥ 0
	const q = (a: number) => -(a * a) / 4 - a * (c - 3);
	const xs = range(-0.5, 5.5, 200);
	const cs = range(0, 5, 120);
	const as = range(0, 8, 160);

	return (
		<div className="pg not-content">
			<h4>¿Cuánto cuesta una regla? El multiplicador α</h4>
			<p className="pg-sub">
				Minimiza <Tex>{'J(x)=(x-3)^2'}</Tex> sujeto a <Tex>{'g(x)=c-x\\ge 0'}</Tex> (una pared en x = c). Mueve la pared y mira tres lecturas del mismo número α: <b>precio</b>, <b>tasa</b> y <b>fuerza</b>.
			</p>
			<Slider label="posición de la pared c" value={c} min={0} max={5} step={0.05} onChange={setC} />
			<div className="pg-grid-2">
				<div>
					<span className="lane-label">Primal: el óptimo se pega a la pared</span>
					<Plot x={[-0.5, 5.5]} y={[-0.5, 10]} w={400} h={290} xlabel="x" ylabel="J(x)">
						{(s) => (
							<>
								<rect x={s.X(c)} y={s.y1} width={Math.max(0, s.x1 - s.X(c))} height={s.y0 - s.y1} fill={CR} opacity={0.1} />
								<line x1={s.X(c)} x2={s.X(c)} y1={s.y0} y2={s.y1} stroke={CR} strokeWidth={2} />
								<Path pts={xs.map((x) => [x, (x - 3) ** 2])} s={s} color={CM} width={2.2} />
								<circle cx={s.X(3)} cy={s.Y(0)} r={5} fill="none" stroke={CM} strokeWidth={1.5} />
								<circle cx={s.X(xstar)} cy={s.Y(Jstar)} r={7} fill={CA} stroke="var(--pg-surface)" strokeWidth={2} />
								{alpha > 0 && <line x1={s.X(xstar)} y1={s.Y(Jstar)} x2={s.X(xstar) - 8 * alpha} y2={s.Y(Jstar)} stroke={CV} strokeWidth={3} />}
							</>
						)}
					</Plot>
				</div>
				<div>
					<span className="lane-label">Mejor valor J*(c): su pendiente es −α</span>
					<Plot x={[0, 5]} y={[-0.5, 10]} w={400} h={290} xlabel="posición de la pared c" ylabel="J*(c)">
						{(s) => (
							<>
								<Path pts={cs.map((cc) => [cc, Math.min(cc - 3, 0) ** 2])} s={s} color={CA} width={2.4} />
								<Path pts={[[c - 1.2, Jstar + 1.2 * alpha], [c + 1.2, Jstar - 1.2 * alpha]]} s={s} color={CV} width={1.8} dash="5 4" />
								<circle cx={s.X(c)} cy={s.Y(Jstar)} r={6} fill={CV} />
							</>
						)}
					</Plot>
				</div>
			</div>
			<div>
				<span className="lane-label">Dual: q(α) = minₓ L(x, α) = −α²/4 − α(c − 3). Su máximo coincide con el primal (brecha cero)</span>
				<Plot x={[0, 8]} y={[-6, 10]} h={250} xlabel="α" ylabel="q(α)">
					{(s) => (
						<>
							<Path pts={as.map((a) => [a, q(a)])} s={s} color={CV} width={2.4} />
							<line x1={s.x0} x2={s.x1} y1={s.Y(Jstar)} y2={s.Y(Jstar)} stroke={CA} strokeDasharray="5 4" />
							<circle cx={s.X(alpha)} cy={s.Y(q(alpha))} r={6.5} fill={CV} stroke="var(--pg-surface)" strokeWidth={2} />
						</>
					)}
				</Plot>
			</div>
			<div className="pg-stats">
				<Stat k="x*" v={xstar.toFixed(2)} />
				<Stat k="J* (primal)" v={Jstar.toFixed(3)} />
				<Stat k="α* = 2(3 − c)₊" v={alpha.toFixed(2)} color={CV} />
				<Stat k="q(α*) (dual)" v={q(alpha).toFixed(3)} />
				<Stat k="α*·g(x*)" v={(alpha * g).toFixed(3)} />
			</div>
			<div className={`pg-note ${alpha > 0 ? '' : 'ok'}`}>
				{alpha > 0 ? (
					<>La pared <b>aprieta</b> (restricción activa, g = 0) y α = {alpha.toFixed(2)} &gt; 0: empujar la pared ε hacia fuera mejora J* en ≈ {alpha.toFixed(2)}ε. En x*, J′ = {(2 * (xstar - 3)).toFixed(2)} ≠ 0, pero ∂L/∂x = J′ + α = 0: α es la <b>fuerza</b> que falta.</>
				) : (
					<>La pared está en c ≥ 3: el óptimo libre x = 3 ya es legal, la regla <b>no presiona</b> y α = 0. Holgura estricta ⇒ precio cero: eso es la <b>holgura complementaria</b> α·g = 0, la misma que dice que los puntos lejos del margen tienen αᵢ = 0.</>
				)}
			</div>
		</div>
	);
}

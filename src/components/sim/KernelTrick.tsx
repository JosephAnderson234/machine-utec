import { useMemo, useState } from 'react';
import { C0, C1, CA, Slider, Stat } from '../ui/Plot';
import Tex from '../ui/Tex';
import { rng } from '../ui/math';

function rings(seed: number) {
	const r = rng(seed);
	return Array.from({ length: 90 }, (_, i) => {
		const inner = i % 2 === 0;
		const rad = inner ? 0.2 + 0.7 * r.next() : 1.5 + 0.6 * r.next();
		const t = 2 * Math.PI * r.next();
		return { x: [rad * Math.cos(t), rad * Math.sin(t)], y: inner ? 1 : 0 };
	});
}

/** El truco del kernel: dos rutas al mismo número y el «levantamiento» de los anillos a 3-D. */
export default function KernelTrick() {
	const [x, setX] = useState([1, 2]);
	const [z, setZ] = useState([3, -1]);
	const [kind, setKind] = useState<'h' | 'nh'>('h');
	const [az, setAz] = useState(35);
	const [el, setEl] = useState(22);
	const [h, setH] = useState(1.3);
	const data = useMemo(() => rings(4), []);

	const dot = x[0] * z[0] + x[1] * z[1];
	const s2 = Math.SQRT2;
	const phi = (v: number[]) => (kind === 'h' ? [v[0] ** 2, s2 * v[0] * v[1], v[1] ** 2] : [1, s2 * v[0], s2 * v[1], v[0] ** 2, s2 * v[0] * v[1], v[1] ** 2]);
	const px = phi(x),
		pz = phi(z);
	const viaPhi = px.reduce((s, v, i) => s + v * pz[i], 0);
	const viaK = kind === 'h' ? dot ** 2 : (1 + dot) ** 2;
	const names = kind === 'h' ? ['x_1^2', '\\sqrt2 x_1x_2', 'x_2^2'] : ['1', '\\sqrt2 x_1', '\\sqrt2 x_2', 'x_1^2', 'x_2^2', '\\sqrt2 x_1x_2'];
	const phiFix = (v: number[]) => (kind === 'h' ? v : [v[0], v[1], v[2], v[3], v[5], v[4]]);

	// proyección 3-D → 2-D (ortográfica)
	const A = (az * Math.PI) / 180,
		E = (el * Math.PI) / 180;
	const proj = (p: number[]) => {
		const xr = p[0] * Math.cos(A) - p[1] * Math.sin(A);
		const yr = p[0] * Math.sin(A) + p[1] * Math.cos(A);
		const zz = p[2];
		return [200 + 60 * xr, 270 - 50 * (zz * Math.cos(E) - yr * Math.sin(E))];
	};
	const lifted = data.map((d) => ({ ...d, p: [d.x[0], d.x[1], d.x[0] ** 2 + d.x[1] ** 2] }));
	const sep = lifted.every((d) => (d.p[2] < h) === (d.y === 1));
	const plane = [[-2.3, -2.3, h], [2.3, -2.3, h], [2.3, 2.3, h], [-2.3, 2.3, h]].map(proj);
	const order = [...lifted].sort((a, b) => a.p[0] * Math.sin(A) + a.p[1] * Math.cos(A) - (b.p[0] * Math.sin(A) + b.p[1] * Math.cos(A)));

	return (
		<div className="pg not-content">
			<h4>Dos rutas, un mismo número</h4>
			<p className="pg-sub">Elige x y z. La ruta cara construye φ(x) y φ(z) y hace su producto punto; la ruta del kernel hace un producto punto en 2-D y lo eleva al cuadrado.</p>
			<div className="pg-row">
				<div className="pg-seg">
					<button className={kind === 'h' ? 'active' : ''} onClick={() => setKind('h')}>K = (xᵀz)² · φ en 3-D</button>
					<button className={kind === 'nh' ? 'active' : ''} onClick={() => setKind('nh')}>K = (1 + xᵀz)² · φ en 6-D</button>
				</div>
			</div>
			<div className="pg-row">
				<Slider label="x₁" value={x[0]} min={-3} max={3} step={0.5} onChange={(v) => setX([v, x[1]])} />
				<Slider label="x₂" value={x[1]} min={-3} max={3} step={0.5} onChange={(v) => setX([x[0], v])} />
				<Slider label="z₁" value={z[0]} min={-3} max={3} step={0.5} onChange={(v) => setZ([v, z[1]])} />
				<Slider label="z₂" value={z[1]} min={-3} max={3} step={0.5} onChange={(v) => setZ([z[0], v])} />
			</div>
			<div className="pg-grid-2">
				<div className="pg-note">
					<b>Ruta del kernel</b> ({kind === 'h' ? 3 : 4} operaciones)
					<Tex block>{`\\mathbf{x}^\\top\\mathbf{z} = ${x[0]}\\cdot${z[0]} + ${x[1]}\\cdot${z[1]} = ${dot}`}</Tex>
					<Tex block>{kind === 'h' ? `(\\mathbf{x}^\\top\\mathbf{z})^2 = ${viaK}` : `(1+\\mathbf{x}^\\top\\mathbf{z})^2 = ${viaK}`}</Tex>
				</div>
				<div className="pg-note warn">
					<b>Ruta del mapa φ</b> ({kind === 'h' ? 9 : 16}+ operaciones)
					<Tex block>{`\\phi(\\mathbf{x}) = (${phiFix(px).map((v) => +v.toFixed(3)).join(',\\,')})`}</Tex>
					<Tex block>{`\\phi(\\mathbf{z}) = (${phiFix(pz).map((v) => +v.toFixed(3)).join(',\\,')})`}</Tex>
					<Tex block>{`\\phi(\\mathbf{x})^\\top\\phi(\\mathbf{z}) = ${+viaPhi.toFixed(6)}`}</Tex>
				</div>
			</div>
			<p className="pg-sub" style={{ marginTop: 0 }}>
				Coordenadas de φ: <Tex>{`(${names.join(',\\;')})`}</Tex>. Mismo resultado, pero la ruta del kernel nunca construye φ. Con grado p en d dimensiones, φ tiene ∼dᵖ coordenadas; el kernel sigue costando O(d).
			</p>
			<hr style={{ border: 'none', borderTop: '1px solid var(--pg-border)', width: '100%' }} />
			<h4>Levantar los anillos hasta que un plano los separe</h4>
			<p className="pg-sub">
				En 2-D ninguna recta separa los anillos. Con <Tex>{'\\phi(\\mathbf{x}) = (x_1, x_2, x_1^2 + x_2^2)'}</Tex> el anillo interior queda abajo. Gira la vista y sube o baja el plano.
			</p>
			<div className="pg-row">
				<Slider label="giro (azimut)" value={az} min={-180} max={180} step={1} onChange={setAz} />
				<Slider label="elevación" value={el} min={0} max={80} step={1} onChange={setEl} />
				<Slider label="altura del plano" value={h} min={0.1} max={4} step={0.05} onChange={setH} />
			</div>
			<svg className="plot" viewBox="0 0 400 380" style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
				<polygon points={plane.map((p) => p.join(',')).join(' ')} fill={CA} opacity={0.18} stroke={CA} />
				{order.map((d, i) => {
					const [sx, sy] = proj(d.p);
					const [bx, by] = proj([d.p[0], d.p[1], 0]);
					return (
						<g key={i}>
							<line x1={bx} y1={by} x2={sx} y2={sy} stroke="var(--pg-muted)" strokeOpacity={0.18} />
							<circle cx={sx} cy={sy} r={4} fill={d.y ? C1 : C0} stroke="var(--pg-surface)" strokeWidth={1} />
						</g>
					);
				})}
			</svg>
			<div className="pg-stats">
				<Stat k="¿el plano separa?" v={sep ? 'sí' : 'no'} color={sep ? 'var(--pg-ok)' : 'var(--pg-bad)'} />
				<Stat k="plano en 3-D" v={`φ₃ = ${h.toFixed(2)}`} />
				<Stat k="de vuelta en 2-D" v={`círculo r = ${Math.sqrt(h).toFixed(2)}`} />
			</div>
			<div className="pg-note">
				El SVM nunca aprende nada curvo: traza un <b>plano</b> en el espacio levantado, y ese plano, visto desde casa, es el círculo x₁² + x₂² = {h.toFixed(2)}. Todo método con kernel funciona así.
			</div>
		</div>
	);
}

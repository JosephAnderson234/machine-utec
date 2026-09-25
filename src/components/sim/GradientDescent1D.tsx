import { useEffect, useMemo, useState } from 'react';
import Plot, { Path, CA, CM, CR, Slider, Stat } from '../ui/Plot';
import { range, fmt } from '../ui/math';

type Fn = { name: string; f: (w: number) => number; g: (w: number) => number; xd: [number, number]; yd: [number, number] };
const FNS: Record<string, Fn> = {
	convexa: { name: 'Convexa: J(w) = (w − 1)²', f: (w) => (w - 1) ** 2, g: (w) => 2 * (w - 1), xd: [-3, 5], yd: [-0.5, 12] },
	noconvexa: {
		name: 'No convexa: dos valles',
		f: (w) => 0.15 * w ** 4 - 1.2 * w ** 2 + 0.4 * w + 3,
		g: (w) => 0.6 * w ** 3 - 2.4 * w + 0.4,
		xd: [-3.4, 3.4],
		yd: [-0.5, 8],
	},
};

/** Descenso de gradiente en 1-D: la tasa de aprendizaje y la convexidad, en vivo. */
export default function GradientDescent1D() {
	const [fk, setFk] = useState<keyof typeof FNS>('convexa');
	const [eta, setEta] = useState(0.3);
	const [w0, setW0] = useState(-2.5);
	const [steps, setSteps] = useState(0);
	const [play, setPlay] = useState(false);
	const F = FNS[fk];

	const path = useMemo(() => {
		const out = [w0];
		let w = w0;
		for (let i = 0; i < steps; i++) {
			w = w - eta * F.g(w);
			if (!Number.isFinite(w) || Math.abs(w) > 1e6) break;
			out.push(w);
		}
		return out;
	}, [w0, steps, eta, F]);

	useEffect(() => {
		if (!play) return;
		const id = setInterval(() => setSteps((s) => (s >= 40 ? s : s + 1)), 420);
		return () => clearInterval(id);
	}, [play]);
	useEffect(() => {
		if (steps >= 40) setPlay(false);
	}, [steps]);

	const reset = () => {
		setSteps(0);
		setPlay(false);
	};
	const cur = path[path.length - 1];
	const diverged = Math.abs(cur) > 50 || path.length < steps + 1;
	const xs = range(F.xd[0], F.xd[1], 200);
	const regime = fk === 'convexa' ? (eta < 0.1 ? 'demasiado pequeña: se arrastra' : eta < 0.5 ? 'buena: baja directo' : eta < 1 ? 'grande: oscila de lado a lado' : 'demasiado grande: diverge') : '';

	return (
		<div className="pg not-content">
			<h4>Rueda cuesta abajo: descenso de gradiente</h4>
			<p className="pg-sub">
				Regla: <span className="mono">w ← w − η·J′(w)</span>. Arrastra el punto de inicio con el slider y observa qué hace la tasa de aprendizaje η. Prueba los valores de la slide: 0.04, 0.3, 0.9 y 1.04.
			</p>
			<div className="pg-row">
				<div className="pg-seg">
					{Object.entries(FNS).map(([k, v]) => (
						<button key={k} className={k === fk ? 'active' : ''} onClick={() => { setFk(k as keyof typeof FNS); reset(); setW0(k === 'convexa' ? -2.5 : 2.8); }}>
							{v.name}
						</button>
					))}
				</div>
			</div>
			<div className="pg-row">
				<Slider label="Tasa de aprendizaje η" value={eta} min={0.01} max={1.1} step={0.01} onChange={(v) => { setEta(v); reset(); }} />
				<Slider label="Inicio w₀" value={w0} min={F.xd[0] + 0.2} max={F.xd[1] - 0.2} step={0.1} onChange={(v) => { setW0(v); reset(); }} />
			</div>
			<div className="pg-row">
				<button className="primary" onClick={() => setPlay(!play)}>{play ? 'Pausa' : 'Reproducir'}</button>
				<button onClick={() => setSteps((s) => s + 1)}>Un paso</button>
				<button onClick={reset}>Reiniciar</button>
			</div>
			<Plot x={F.xd} y={F.yd} xlabel="parámetro w" ylabel="costo J(w)">
				{(s) => (
					<>
						<Path pts={xs.map((w) => [w, F.f(w)])} s={s} color={CM} width={2.2} />
						{path.slice(1).map((w, i) => (
							<line key={i} x1={s.X(path[i])} y1={s.Y(F.f(path[i]))} x2={s.X(w)} y2={s.Y(F.f(w))} stroke={CA} strokeWidth={1.6} strokeDasharray="4 3" opacity={0.8} />
						))}
						{path.map((w, i) => (
							<circle key={i} cx={s.X(w)} cy={s.Y(F.f(w))} r={i === path.length - 1 ? 7 : 3.5} fill={i === path.length - 1 ? CA : 'var(--pg-surface)'} stroke={CA} strokeWidth={1.5} />
						))}
						{Number.isFinite(cur) && Math.abs(cur) < 50 && (
							<line x1={s.X(cur - 0.8)} x2={s.X(cur + 0.8)} y1={s.Y(F.f(cur) - 0.8 * F.g(cur))} y2={s.Y(F.f(cur) + 0.8 * F.g(cur))} stroke={CR} strokeWidth={2} />
						)}
					</>
				)}
			</Plot>
			<div className="pg-stats">
				<Stat k="iteración" v={steps} />
				<Stat k="w actual" v={diverged ? 'diverge' : fmt(cur)} color={diverged ? CR : undefined} />
				<Stat k="J(w)" v={diverged ? '∞' : fmt(F.f(cur))} />
				<Stat k="pendiente J′(w)" v={diverged ? '—' : fmt(F.g(cur))} />
			</div>
			{fk === 'convexa' ? (
				<div className={`pg-note ${eta >= 1 ? 'bad' : eta >= 0.5 || eta < 0.1 ? 'warn' : 'ok'}`}>
					η = {eta}: <b>{regime}</b>. Aquí cada paso multiplica la distancia al mínimo por <span className="mono">(1 − 2η) = {(1 - 2 * eta).toFixed(2)}</span>: converge si |1 − 2η| &lt; 1, es decir 0 &lt; η &lt; 1. La línea roja es la tangente: su pendiente es el gradiente.
				</div>
			) : (
				<div className="pg-note warn">
					Función <b>no convexa</b>: según dónde empieces, el descenso termina en el valle izquierdo (mínimo global) o se queda atrapado en el derecho (mínimo local). Por eso importa tanto que la regresión lineal y la logística tengan costos <b>convexos</b>.
				</div>
			)}
		</div>
	);
}

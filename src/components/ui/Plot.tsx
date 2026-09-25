import { useEffect, useId, useRef, useState, type ReactNode, type PointerEvent as RPE } from 'react';

/** true solo tras montar en el cliente (evita desajustes de hidratación con canvas/heatmaps). */
export function useMounted() {
	const [m, setM] = useState(false);
	useEffect(() => setM(true), []);
	return m;
}

export type Scales = {
	X: (v: number) => number;
	Y: (v: number) => number;
	/** coordenadas de datos desde un evento de puntero */
	toData: (e: { clientX: number; clientY: number }) => [number, number];
	xd: [number, number];
	yd: [number, number];
	x0: number;
	x1: number;
	y0: number;
	y1: number;
};

type Props = {
	x: [number, number];
	y: [number, number];
	w?: number;
	h?: number;
	xticks?: number[];
	yticks?: number[];
	xlabel?: string;
	ylabel?: string;
	grid?: boolean;
	onPointerDown?: (e: RPE<SVGSVGElement>, s: Scales) => void;
	onPointerMove?: (e: RPE<SVGSVGElement>, s: Scales) => void;
	onPointerUp?: (e: RPE<SVGSVGElement>, s: Scales) => void;
	children: (s: Scales) => ReactNode;
	ariaLabel?: string;
};

export function niceTicks(a: number, b: number, n = 5): number[] {
	const span = b - a;
	const raw = span / n;
	const mag = Math.pow(10, Math.floor(Math.log10(raw)));
	const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= n + 1) ?? raw;
	const out: number[] = [];
	for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : +v.toFixed(10));
	return out;
}

const tickLabel = (v: number) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(0) : String(+v.toFixed(2)));

/** Marco de gráfico SVG con ejes, rejilla y escalas. */
export default function Plot({ x, y, w = 520, h = 340, xticks, yticks, xlabel, ylabel, grid = true, children, onPointerDown, onPointerMove, onPointerUp, ariaLabel }: Props) {
	const ref = useRef<SVGSVGElement>(null);
	const pad = { l: ylabel ? 46 : 36, r: 12, t: 12, b: xlabel ? 38 : 26 };
	const x0 = pad.l,
		x1 = w - pad.r,
		y0 = h - pad.b,
		y1 = pad.t;
	const X = (v: number) => x0 + ((v - x[0]) / (x[1] - x[0])) * (x1 - x0);
	const Y = (v: number) => y0 - ((v - y[0]) / (y[1] - y[0])) * (y0 - y1);
	const toData = (e: { clientX: number; clientY: number }): [number, number] => {
		const svg = ref.current;
		if (!svg) return [0, 0];
		const m = svg.getScreenCTM();
		if (!m) return [0, 0];
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [x[0] + ((p.x - x0) / (x1 - x0)) * (x[1] - x[0]), y[0] + ((y0 - p.y) / (y0 - y1)) * (y[1] - y[0])];
	};
	const s: Scales = { X, Y, toData, xd: x, yd: y, x0, x1, y0, y1 };
	const xt = xticks ?? niceTicks(x[0], x[1], 6);
	const yt = yticks ?? niceTicks(y[0], y[1], 5);
	const clipId = 'c' + useId().replace(/[^a-zA-Z0-9]/g, '');
	return (
		<svg
			ref={ref}
			className="plot"
			viewBox={`0 0 ${w} ${h}`}
			role="img"
			aria-label={ariaLabel}
			onPointerDown={onPointerDown && ((e) => onPointerDown(e, s))}
			onPointerMove={onPointerMove && ((e) => onPointerMove(e, s))}
			onPointerUp={onPointerUp && ((e) => onPointerUp(e, s))}
			onPointerLeave={onPointerUp && ((e) => onPointerUp(e, s))}
		>
			<defs>
				<clipPath id={clipId}>
					<rect x={x0} y={y1} width={x1 - x0} height={y0 - y1} />
				</clipPath>
			</defs>
			{grid && (
				<g className="grid">
					{xt.map((v) => (
						<line key={`gx${v}`} x1={X(v)} x2={X(v)} y1={y0} y2={y1} />
					))}
					{yt.map((v) => (
						<line key={`gy${v}`} x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} />
					))}
				</g>
			)}
			<g className="axis">
				<line x1={x0} x2={x1} y1={y0} y2={y0} />
				<line x1={x0} x2={x0} y1={y0} y2={y1} />
			</g>
			<g className="tick">
				{xt.map((v) => (
					<text key={`tx${v}`} x={X(v)} y={y0 + 15} textAnchor="middle">
						{tickLabel(v)}
					</text>
				))}
				{yt.map((v) => (
					<text key={`ty${v}`} x={x0 - 6} y={Y(v) + 3.5} textAnchor="end">
						{tickLabel(v)}
					</text>
				))}
			</g>
			{xlabel && (
				<text className="alabel" x={(x0 + x1) / 2} y={h - 6} textAnchor="middle">
					{xlabel}
				</text>
			)}
			{ylabel && (
				<text className="alabel" transform={`translate(12 ${(y0 + y1) / 2}) rotate(-90)`} textAnchor="middle">
					{ylabel}
				</text>
			)}
			<g clipPath={`url(#${clipId})`}>{children(s)}</g>
		</svg>
	);
}

/** Polilínea a partir de puntos de datos. */
export function Path({ pts, s, color, width = 2, dash, opacity = 1 }: { pts: [number, number][]; s: Scales; color: string; width?: number; dash?: string; opacity?: number }) {
	const d = pts
		.filter(([, v]) => Number.isFinite(v))
		.map(([a, b], i) => `${i ? 'L' : 'M'}${s.X(a).toFixed(1)},${s.Y(b).toFixed(1)}`)
		.join('');
	return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} opacity={opacity} strokeLinejoin="round" strokeLinecap="round" />;
}

export const C0 = 'var(--pg-c1)';
export const C1 = 'var(--pg-c2)';
export const CA = 'var(--sl-color-accent)';
export const CV = 'var(--pg-violet)';
export const CM = 'var(--pg-muted)';
export const CG = 'var(--pg-ok)';
export const CR = 'var(--pg-bad)';

/** Slider etiquetado. */
export function Slider({ label, value, min, max, step, onChange, show }: { label: ReactNode; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show?: string }) {
	return (
		<label className="pg-field">
			<span>
				{label} <b>{show ?? value}</b>
			</span>
			<input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
		</label>
	);
}

export function Stat({ k, v, color }: { k: ReactNode; v: ReactNode; color?: string }) {
	return (
		<div className="pg-stat">
			<span className="k">{k}</span>
			<span className="v" style={color ? { color } : undefined}>
				{v}
			</span>
		</div>
	);
}

export function Legend({ items }: { items: [string, string, string?][] }) {
	return (
		<div className="legend">
			{items.map(([c, t, dash]) => (
				<span key={t}>
					<i style={{ background: dash ? `repeating-linear-gradient(90deg, ${c} 0 4px, transparent 4px 7px)` : c }} />
					{t}
				</span>
			))}
		</div>
	);
}

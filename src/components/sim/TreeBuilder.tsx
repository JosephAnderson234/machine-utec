import { useMemo, useState, type ReactNode } from 'react';
import Plot, { C0, C1, CA, CV, CM } from '../ui/Plot';

type Pt = { x: number[]; y: 0 | 1 };
const DIEZ: Pt[] = [
	{ x: [1, 4], y: 0 }, { x: [2, 1], y: 0 }, { x: [3, 9], y: 0 }, { x: [6, 5], y: 0 }, { x: [8, 3], y: 0 },
	{ x: [4, 8], y: 1 }, { x: [5, 10], y: 1 }, { x: [7, 2], y: 1 }, { x: [9, 6], y: 1 }, { x: [10, 7], y: 1 },
];
const XOR: Pt[] = [
	{ x: [3, 3], y: 0 }, { x: [8, 8], y: 0 }, { x: [3, 8], y: 1 }, { x: [8, 3], y: 1 },
	{ x: [2, 2], y: 0 }, { x: [9, 9], y: 0 }, { x: [2, 9], y: 1 }, { x: [9, 2], y: 1 },
];

type Node = { id: string; idx: number[]; box: number[]; split?: { j: number; t: number }; l?: Node; r?: Node };
type Crit = 'gini' | 'ent';
const imp = (n0: number, n1: number, c: Crit) => {
	const n = n0 + n1;
	if (!n) return 0;
	const p = n1 / n;
	if (c === 'gini') return 1 - p * p - (1 - p) * (1 - p);
	return p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
};
const counts = (idx: number[], d: Pt[]) => [idx.filter((i) => d[i].y === 0).length, idx.filter((i) => d[i].y === 1).length];

function candidates(node: Node, d: Pt[], c: Crit) {
	const out: { j: number; t: number; gain: number }[] = [];
	const [a, b] = counts(node.idx, d);
	const parent = imp(a, b, c);
	for (const j of [0, 1]) {
		const vals = [...new Set(node.idx.map((i) => d[i].x[j]))].sort((u, v) => u - v);
		for (let k = 0; k + 1 < vals.length; k++) {
			const t = (vals[k] + vals[k + 1]) / 2;
			const L = node.idx.filter((i) => d[i].x[j] <= t),
				R = node.idx.filter((i) => d[i].x[j] > t);
			const [l0, l1] = counts(L, d),
				[r0, r1] = counts(R, d);
			const n = node.idx.length;
			out.push({ j, t, gain: parent - (L.length / n) * imp(l0, l1, c) - (R.length / n) * imp(r0, r1, c) });
		}
	}
	return out;
}
function applySplit(node: Node, id: string, j: number, t: number, d: Pt[]): Node {
	if (node.id === id) {
		const L = node.idx.filter((i) => d[i].x[j] <= t),
			R = node.idx.filter((i) => d[i].x[j] > t);
		const bl = [...node.box],
			br = [...node.box];
		if (j === 0) { bl[1] = t; br[0] = t; } else { bl[3] = t; br[2] = t; }
		return { ...node, split: { j, t }, l: { id: id + 'L', idx: L, box: bl }, r: { id: id + 'R', idx: R, box: br } };
	}
	if (!node.split) return node;
	return { ...node, l: applySplit(node.l!, id, j, t, d), r: applySplit(node.r!, id, j, t, d) };
}
const leaves = (n: Node): Node[] => (n.split ? [...leaves(n.l!), ...leaves(n.r!)] : [n]);
const depth = (n: Node): number => (n.split ? 1 + Math.max(depth(n.l!), depth(n.r!)) : 0);

/** CART paso a paso sobre el ejemplo de 10 puntos: barrido de umbrales, ganancia y crecimiento codicioso. */
export default function TreeBuilder() {
	const [ds, setDs] = useState<'diez' | 'xor'>('diez');
	const [data, setData] = useState<Pt[]>(DIEZ);
	const [crit, setCrit] = useState<Crit>('gini');
	const root0: Node = useMemo(() => ({ id: 'r', idx: data.map((_, i) => i), box: [0, 11, 0, 11] }), [data]);
	const [tree, setTree] = useState<Node>(root0);
	const [sel, setSel] = useState('r');

	const reset = (d: Pt[] = data) => { setTree({ id: 'r', idx: d.map((_, i) => i), box: [0, 11, 0, 11] }); setSel('r'); };
	const lv = leaves(tree);
	const selNode = lv.find((n) => n.id === sel) ?? lv[0];
	const cands = candidates(selNode, data, crit);
	const best = cands.reduce<{ j: number; t: number; gain: number } | null>((a, b) => (!a || b.gain > a.gain + 1e-12 ? b : a), null);
	const acc = lv.reduce((s, n) => s + Math.max(...counts(n.idx, data)), 0) / data.length;

	const growBest = () => {
		// divide la hoja impura con la mayor ganancia ponderada
		let bestAll: { id: string; j: number; t: number; g: number } | null = null;
		for (const n of lv) {
			const [a, b] = counts(n.idx, data);
			if (!a || !b) continue;
			for (const c of candidates(n, data, crit)) {
				const g = (c.gain * n.idx.length) / data.length;
				if (!bestAll || g > bestAll.g + 1e-12) bestAll = { id: n.id, j: c.j, t: c.t, g };
			}
		}
		if (bestAll) { const t2 = applySplit(tree, bestAll.id, bestAll.j, bestAll.t, data); setTree(t2); setSel(bestAll.id + 'L'); }
	};
	const growAll = () => {
		let t = tree;
		for (let it = 0; it < 30; it++) {
			const imp1 = leaves(t).find((n) => { const [a, b] = counts(n.idx, data); return a && b && candidates(n, data, crit).length; });
			if (!imp1) break;
			const c = candidates(imp1, data, crit).reduce((a, b) => (b.gain > a.gain + 1e-12 ? b : a));
			t = applySplit(t, imp1.id, c.j, c.t, data);
		}
		setTree(t);
	};
	const toggle = (i: number) => {
		const d = data.map((p, k) => (k === i ? { ...p, y: (1 - p.y) as 0 | 1 } : p));
		setData(d);
		reset(d);
	};

	const render = (n: Node): ReactNode => {
		const [a, b] = counts(n.idx, data);
		const g = imp(a, b, crit);
		const isLeaf = !n.split;
		return (
			<li key={n.id}>
				<span
					className={`sim-proc ${n.id === sel && isLeaf ? 'run' : ''}`}
					style={{ cursor: isLeaf ? 'pointer' : 'default', borderColor: isLeaf ? (b > a ? C1 : a > b ? C0 : undefined) : undefined }}
					onClick={() => isLeaf && setSel(n.id)}
				>
					{isLeaf ? '🍃 hoja' : `x${n.split!.j + 1} ≤ ${n.split!.t}?`} · n={n.idx.length} · [{a}, {b}] · {crit === 'gini' ? 'Gini' : 'H'}={g.toFixed(3)}
					{isLeaf && ` → predice ${b > a ? 1 : a > b ? 0 : '¿empate?'}`}
				</span>
				{n.split && (
					<ul>
						<li style={{ listStyle: 'none' }}>
							<span style={{ fontSize: '0.72rem', color: 'var(--pg-muted)' }}>sí ↓</span>
						</li>
						{render(n.l!)}
						<li style={{ listStyle: 'none' }}>
							<span style={{ fontSize: '0.72rem', color: 'var(--pg-muted)' }}>no ↓</span>
						</li>
						{render(n.r!)}
					</ul>
				)}
			</li>
		);
	};

	// gráfico de ganancia vs umbral para la hoja seleccionada
	const gmax = Math.max(0.05, ...cands.map((c) => c.gain));

	return (
		<div className="pg not-content">
			<h4>Construye el árbol tú mismo</h4>
			<p className="pg-sub">Elige una hoja (en el diagrama de flujo), mira la ganancia de cada umbral candidato (los puntos medios entre valores ordenados) y haz clic en una barra para aplicar ese split. O deja que CART elija de forma codiciosa. Clic en un punto cambia su clase.</p>
			<div className="pg-row">
				<div className="pg-seg">
					<button className={ds === 'diez' ? 'active' : ''} onClick={() => { setDs('diez'); setData(DIEZ); reset(DIEZ); }}>10 puntos de la clase</button>
					<button className={ds === 'xor' ? 'active' : ''} onClick={() => { setDs('xor'); setData(XOR); reset(XOR); }}>XOR</button>
				</div>
				<div className="pg-seg">
					<button className={crit === 'gini' ? 'active' : ''} onClick={() => setCrit('gini')}>Gini</button>
					<button className={crit === 'ent' ? 'active' : ''} onClick={() => setCrit('ent')}>Entropía</button>
				</div>
			</div>
			<div className="pg-row">
				<button className="primary" onClick={growBest}>Siguiente split (codicioso)</button>
				<button onClick={growAll}>Crecer hasta hojas puras</button>
				<button onClick={() => reset()}>Reiniciar árbol</button>
			</div>
			<div className="pg-grid-2">
				<Plot x={[0, 11]} y={[0, 11]} w={400} h={390} xlabel="x₁" ylabel="x₂" xticks={[0, 2, 4, 6, 8, 10]} yticks={[0, 2, 4, 6, 8, 10]}>
					{(s) => (
						<>
							{lv.map((n) => {
								const [a, b] = counts(n.idx, data);
								const col = b > a ? C1 : a > b ? C0 : CM;
								return (
									<rect
										key={n.id}
										x={s.X(n.box[0])}
										y={s.Y(n.box[3])}
										width={s.X(n.box[1]) - s.X(n.box[0])}
										height={s.Y(n.box[2]) - s.Y(n.box[3])}
										fill={col}
										opacity={n.id === sel ? 0.28 : 0.13}
										stroke={n.id === sel ? CA : 'var(--pg-border)'}
										strokeWidth={n.id === sel ? 2 : 1}
										onClick={() => setSel(n.id)}
										style={{ cursor: 'pointer' }}
									/>
								);
							})}
							{data.map((p, i) => (
								<g key={i} onClick={() => toggle(i)} style={{ cursor: 'pointer' }}>
									<circle cx={s.X(p.x[0])} cy={s.Y(p.x[1])} r={7} fill={p.y ? C1 : C0} stroke="var(--pg-surface)" strokeWidth={2} />
									<text x={s.X(p.x[0]) + 9} y={s.Y(p.x[1]) - 7} fontSize={9.5} fill="var(--pg-muted)">({p.x[0]},{p.x[1]})</text>
								</g>
							))}
						</>
					)}
				</Plot>
				<div>
					<span className="lane-label">Barrido de umbrales en la hoja seleccionada · ganancia de {crit === 'gini' ? 'Gini' : 'entropía'}</span>
					<svg className="plot" viewBox="0 0 400 250" style={{ width: '100%' }}>
						{[0, 1].map((j) => {
							const cs = cands.filter((c) => c.j === j);
							const x0 = 14 + j * 196;
							const bw = cs.length ? Math.min(20, 170 / cs.length - 3) : 0;
							return (
								<g key={j}>
									<text x={x0 + 85} y={238} textAnchor="middle" fontSize={11} fill="var(--pg-muted)">feature x{j + 1}</text>
									<line x1={x0} x2={x0 + 175} y1={200} y2={200} stroke="var(--pg-border)" />
									{cs.map((c, k) => {
										const h = (170 * Math.max(c.gain, 0)) / gmax;
										const isBest = best && c.j === best.j && c.t === best.t;
										return (
											<g key={k} style={{ cursor: 'pointer' }} onClick={() => { setTree(applySplit(tree, selNode.id, c.j, c.t, data)); setSel(selNode.id + 'L'); }}>
												<rect x={x0 + k * (bw + 3)} y={200 - h} width={bw} height={Math.max(h, 1.5)} rx={3} fill={isBest ? CA : CV} opacity={isBest ? 0.95 : 0.55} />
												<text x={x0 + k * (bw + 3) + bw / 2} y={214} textAnchor="middle" fontSize={8} fill="var(--pg-muted)">{c.t}</text>
												{isBest && <text x={x0 + k * (bw + 3) + bw / 2} y={194 - h} textAnchor="middle" fontSize={9.5} fill="var(--sl-color-accent)">{c.gain.toFixed(3)}</text>}
											</g>
										);
									})}
									{!cs.length && <text x={x0 + 85} y={120} textAnchor="middle" fontSize={11} fill="var(--pg-muted)">sin candidatos</text>}
								</g>
							);
						})}
					</svg>
					<div className="pg-stats" style={{ marginTop: '0.6rem' }}>
						<div className="pg-stat"><span className="k">mejor split de la hoja</span><span className="v" style={{ fontSize: '1rem' }}>{best ? `x${best.j + 1} ≤ ${best.t} · ${best.gain.toFixed(4)}` : '—'}</span></div>
						<div className="pg-stat"><span className="k">hojas |T| · profundidad</span><span className="v">{lv.length} · {depth(tree)}</span></div>
						<div className="pg-stat"><span className="k">accuracy de entrenamiento</span><span className="v">{Math.round(acc * 100)}%</span></div>
					</div>
				</div>
			</div>
			<div className="tree mono" style={{ fontSize: '0.78rem' }}>
				<ul>{render(tree)}</ul>
			</div>
			<div className={`pg-note ${ds === 'xor' ? 'warn' : ''}`}>
				{ds === 'xor' ? (
					<>En XOR <b>todos</b> los candidatos de la raíz tienen ganancia ≈ 0 (cada mitad sigue 50/50). Un criterio de parada tipo min_impurity_decrease se detendría en la raíz con 50% de accuracy… pero si fuerzas un primer corte (clic en cualquier barra), el segundo nivel es perfecto. La búsqueda codiciosa es <b>miope</b>: por eso se crece primero y se poda después.</>
				) : (
					<>Con Gini, CART reproduce la slide: raíz x₁ ≤ 3.5 (ganancia 3/14 ≈ 0.2143), luego x₂ ≤ 5.5 en B y x₂ ≤ 2.5 en D ⇒ 4 hojas, 10/10. Solo importa el <b>orden</b> de cada feature (no hace falta escalar). Prueba cambiar la clase de un punto: la primera pregunta puede cambiar por completo (inestabilidad).</>
				)}
			</div>
		</div>
	);
}

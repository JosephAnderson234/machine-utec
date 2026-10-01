import { useEffect, useState } from 'react';
import Rich from '../ui/Rich';
import { rng, sigmoid } from '../ui/math';
import { load, save } from '../ui/storage';

type Ej = { tema: string; href: string; enunciado: string; pregunta: string; respuesta: number; tol: number; pasos: string[] };
type R = ReturnType<typeof rng>;

const n = (v: number, d = 3) => {
	const s = (+v.toFixed(d)).toString();
	return s === '-0' ? '0' : s;
};
/** número entre paréntesis si es negativo (para productos y sumas legibles) */
const pv = (v: number) => (v < 0 ? `(${n(v)})` : n(v));
const int = (r: R, a: number, b: number) => a + Math.floor(r.next() * (b - a + 1));
const pick = <T,>(r: R, xs: T[]) => xs[Math.floor(r.next() * xs.length)];

export const GEN: Record<string, { nombre: string; f: (r: R) => Ej }> = {
	normal: {
		nombre: 'Ecuaciones normales',
		f: (r) => {
			let xs: number[];
			do xs = [int(r, 0, 4), int(r, 0, 4), int(r, 0, 4)];
			while (new Set(xs).size < 2);
			const ys = xs.map(() => int(r, 0, 9));
			const N = 3,
				sx = xs.reduce((a, b) => a + b, 0),
				sxx = xs.reduce((a, b) => a + b * b, 0),
				sy = ys.reduce((a, b) => a + b, 0),
				sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
			const det = N * sxx - sx * sx;
			const w1 = (N * sxy - sx * sy) / det;
			const w0 = (sy - w1 * sx) / N;
			const pts = xs.map((x, i) => `(${x}, ${ys[i]})`).join(', ');
			return {
				tema: 'Regresión lineal',
				href: '/regresion/modelo/',
				enunciado: `Ajusta $\\hat y = w_0 + w_1x$ por mínimos cuadrados a los puntos ${pts}.`,
				pregunta: 'Pendiente $w_1$',
				respuesta: w1,
				tol: 0.01,
				pasos: [
					`Sumas: $n = 3$, $\\sum x_i = ${sx}$, $\\sum x_i^2 = ${sxx}$, $\\sum y_i = ${sy}$, $\\sum x_iy_i = ${sxy}$.`,
					`$\\mathbf{X}^\\top\\mathbf{X} = \\begin{bmatrix}3 & ${sx}\\\\ ${sx} & ${sxx}\\end{bmatrix}$, $\\ \\mathbf{X}^\\top\\mathbf{y} = \\begin{bmatrix}${sy}\\\\ ${sxy}\\end{bmatrix}$.`,
					`Determinante: $3\\cdot${sxx} - ${sx}^2 = ${det}$.`,
					`$w_1 = \\dfrac{n\\sum x_iy_i - \\sum x_i\\sum y_i}{\\det} = \\dfrac{3\\cdot${sxy} - ${sx}\\cdot${sy}}{${det}} = ${n(w1)}$.`,
					`$w_0 = \\bar y - w_1\\bar x = ${n(sy / 3)} - ${n(w1)}\\cdot${n(sx / 3)} = ${n(w0)}$. Recta: $\\hat y = ${n(w0)} + ${n(w1)}x$.`,
				],
			};
		},
	},
	gd: {
		nombre: 'Un paso de descenso de gradiente',
		f: (r) => {
			const xs = [1, 2, 3];
			const ys = xs.map((x) => x * int(r, 1, 3) + int(r, -1, 2));
			const w = pick(r, [0, 0.5, 1]);
			const eta = pick(r, [0.02, 0.05, 0.1]);
			const res = xs.map((x, i) => ys[i] - w * x);
			const sxr = xs.reduce((a, x, i) => a + x * res[i], 0);
			const g = (-2 / 3) * sxr;
			const w2 = w - eta * g;
			return {
				tema: 'Descenso de gradiente',
				href: '/regresion/gradiente/',
				enunciado: `Modelo $\\hat y = wx$ (sin sesgo) con datos $(1, ${ys[0]}), (2, ${ys[1]}), (3, ${ys[2]})$ y costo $J(w) = \\frac13\\sum_i (y_i - wx_i)^2$. Partes de $w = ${w}$ con $\\eta = ${eta}$.`,
				pregunta: 'Valor de $w$ después de un paso',
				respuesta: w2,
				tol: 0.005,
				pasos: [
					`Residuales $r_i = y_i - wx_i$: $(${res.map((v) => n(v)).join(',\\ ')})$.`,
					`$\\sum x_ir_i = ${n(sxr)}$, así que $J'(w) = -\\frac23\\sum x_ir_i = ${n(g)}$.`,
					`$w \\leftarrow w - \\eta J'(w) = ${w} - ${eta}\\cdot(${n(g)}) = ${n(w2)}$.`,
				],
			};
		},
	},
	ridge: {
		nombre: 'Ridge y lasso en 1-D',
		f: (r) => {
			const a = pick(r, [-1, 1]) * (int(r, 2, 30) / 10);
			const lam = pick(r, [0.5, 1, 2, 3]);
			const g = lam / 2;
			const lasso = Math.sign(a) * Math.max(Math.abs(a) - g, 0);
			return {
				tema: 'Ridge y lasso',
				href: '/regularizacion/ridge-lasso/',
				enunciado: `Con features no correlacionadas, un peso tiene $w_{\\text{OLS}} = a = ${a}$. Se penaliza con $\\lambda = ${lam}$ en $\\min_w (w-a)^2 + \\lambda\\Omega(w)$.`,
				pregunta: 'Peso del **lasso**',
				respuesta: lasso,
				tol: 0.005,
				pasos: [
					`Ridge: $w = a/(1+\\lambda) = ${pv(a)}/${1 + lam} = ${n(a / (1 + lam))}$ (nunca 0).`,
					`Lasso: umbral $\\gamma = \\lambda/2 = ${g}$. Soft-threshold $w = \\operatorname{sign}(a)\\max(|a| - \\gamma, 0)$.`,
					Math.abs(a) <= g ? `$|a| = ${Math.abs(a)} \\le ${g}$: cae en la **zona muerta** ⇒ $w = 0$ (feature eliminada).` : `$|a| - \\gamma = ${n(Math.abs(a) - g)}$ ⇒ $w = ${n(lasso)}$.`,
				],
			};
		},
	},
	bayes: {
		nombre: 'Posterior con Bayes',
		f: (r) => {
			const prior = pick(r, [0.5, 1, 2, 5, 10, 20]);
			const sens = int(r, 70, 99);
			const fpr = pick(r, [1, 2, 3, 5, 8, 10]);
			const p = prior / 100,
				s = sens / 100,
				f = fpr / 100;
			const a = p * s,
				b = (1 - p) * f;
			const post = (100 * a) / (a + b);
			return {
				tema: 'Bayes y MAP',
				href: '/generativos/bayes/',
				enunciado: `Una enfermedad tiene prevalencia ${prior}%. El test detecta al ${sens}% de los enfermos y da positivo en el ${fpr}% de los sanos. Un paciente sale positivo.`,
				pregunta: '$P(\\text{enfermo}\\mid +)$ en %',
				respuesta: post,
				tol: 0.15,
				pasos: [
					`Prior $\\pi = ${p}$, likelihood $p(+\\mid\\text{enf}) = ${s}$, falsa alarma $p(+\\mid\\text{sano}) = ${f}$.`,
					`Scores: enfermo $${p}\\cdot${s} = ${n(a, 5)}$; sano $${n(1 - p, 3)}\\cdot${f} = ${n(b, 5)}$.`,
					`Normalizar: $P = \\dfrac{${n(a, 5)}}{${n(a, 5)} + ${n(b, 5)}} = ${n(post / 100, 4)}$ ⇒ **${n(post, 2)}%**.`,
					`Con 10 000 personas: ${Math.round(10000 * a)} positivos verdaderos y ${Math.round(10000 * b)} falsas alarmas.`,
				],
			};
		},
	},
	logit: {
		nombre: 'Logística: probabilidad y gradiente',
		f: (r) => {
			const x = pick(r, [-2, -1, 0.5, 1, 2, 3]);
			const y = int(r, 0, 1);
			const w = pick(r, [-1, -0.5, 0.5, 1, 1.5]);
			const b = pick(r, [-1, -0.5, 0, 0.5]);
			const eta = pick(r, [0.5, 1]);
			const z = w * x + b,
				p = sigmoid(z);
			const gw = (p - y) * x;
			const w2 = w - eta * gw;
			return {
				tema: 'Cross-entropy',
				href: '/clasificacion/entrenamiento/',
				enunciado: `Un punto $x = ${x}$, $y = ${y}$. Modelo $p = \\sigma(wx + b)$ con $w = ${w}$, $b = ${b}$. Un paso de gradiente sobre la cross-entropy con $\\eta = ${eta}$.`,
				pregunta: 'Nuevo $w$',
				respuesta: w2,
				tol: 0.005,
				pasos: [
					`$z = ${w}\\cdot${pv(x)} + ${pv(b)} = ${n(z)}$, $p = \\sigma(z) = ${n(p, 4)}$.`,
					`Pérdida: $-\\log ${y ? 'p' : '(1-p)'} = ${n(-Math.log(y ? p : 1 - p), 4)}$.`,
					`$\\partial\\ell/\\partial w = (p - y)x = (${n(p, 4)} - ${y})\\cdot${pv(x)} = ${n(gw, 4)}$.`,
					`$w \\leftarrow ${w} - ${eta}\\cdot(${n(gw, 4)}) = ${n(w2, 4)}$.`,
				],
			};
		},
	},
	metricas: {
		nombre: 'Métricas de clasificación',
		f: (r) => {
			const TP = int(r, 10, 90),
				FP = int(r, 2, 60),
				FN = int(r, 2, 40),
				TN = int(r, 100, 900);
			const P = TP / (TP + FP),
				Rc = TP / (TP + FN),
				F1 = (2 * P * Rc) / (P + Rc);
			return {
				tema: 'Métricas',
				href: '/clasificacion/metricas/',
				enunciado: `Matriz de confusión: TP = ${TP}, FP = ${FP}, FN = ${FN}, TN = ${TN}.`,
				pregunta: '$F_1$',
				respuesta: F1,
				tol: 0.003,
				pasos: [
					`Precision $= ${TP}/(${TP}+${FP}) = ${n(P, 4)}$.`,
					`Recall $= ${TP}/(${TP}+${FN}) = ${n(Rc, 4)}$.`,
					`$F_1 = \\dfrac{2PR}{P+R} = \\dfrac{2\\cdot${n(P, 4)}\\cdot${n(Rc, 4)}}{${n(P + Rc, 4)}} = ${n(F1, 4)}$.`,
					`Para comparar: accuracy $= ${n((TP + TN) / (TP + FP + FN + TN), 4)}$ (inflada por los ${TN} TN).`,
				],
			};
		},
	},
	lda: {
		nombre: 'Frontera LDA en 1-D',
		f: (r) => {
			const m0 = int(r, 0, 4),
				m1 = m0 + int(r, 2, 6);
			const s2 = pick(r, [1, 2, 4]);
			const p1 = pick(r, [0.2, 0.25, 0.5, 0.75]);
			const lr = Math.log(p1 / (1 - p1));
			const x = (m0 + m1) / 2 - (s2 / (m1 - m0)) * lr;
			return {
				tema: 'LDA',
				href: '/generativos/lda-qda/',
				enunciado: `Dos clases gaussianas con varianza compartida $\\sigma^2 = ${s2}$, medias $\\mu_0 = ${m0}$ y $\\mu_1 = ${m1}$, y prior $\\pi_1 = ${p1}$.`,
				pregunta: 'Frontera $x^*$',
				respuesta: x,
				tol: 0.01,
				pasos: [
					`Punto medio: $(\\mu_0+\\mu_1)/2 = ${(m0 + m1) / 2}$.`,
					`$\\log(\\pi_1/\\pi_0) = \\log(${p1}/${1 - p1}) = ${n(lr, 4)}$.`,
					`$x^* = ${(m0 + m1) / 2} - \\dfrac{${s2}}{${m1 - m0}}\\cdot(${n(lr, 4)}) = ${n(x, 4)}$.`,
					p1 < 0.5 ? 'La clase 1 es rara: la frontera se corre hacia $\\mu_1$.' : p1 > 0.5 ? 'La clase 1 es común: la frontera se corre hacia $\\mu_0$.' : 'Priors iguales: la frontera es el punto medio.',
				],
			};
		},
	},
	svm: {
		nombre: 'Distancia y margen (SVM)',
		f: (r) => {
			const [a, c] = pick(r, [
				[3, 4],
				[4, 3],
				[1, 1],
				[6, 8],
				[5, 12],
				[2, 0],
			]);
			const b = int(r, -6, 2);
			const x = [int(r, -2, 4), int(r, -2, 4)];
			const nw = Math.hypot(a, c);
			const f = a * x[0] + c * x[1] + b;
			return {
				tema: 'SVM',
				href: '/svm/geometria/',
				enunciado: `Frontera $\\mathbf{w}^\\top\\mathbf{x} + b = 0$ con $\\mathbf{w} = (${a}, ${c})$, $b = ${b}$, y el punto $\\mathbf{x} = (${x[0]}, ${x[1]})$.`,
				pregunta: 'Distancia con signo $r$ del punto a la frontera',
				respuesta: f / nw,
				tol: 0.005,
				pasos: [
					`$\\|\\mathbf{w}\\| = \\sqrt{${a}^2 + ${c}^2} = ${n(nw, 4)}$.`,
					`Score: $f(\\mathbf{x}) = ${a}\\cdot${pv(x[0])} + ${c}\\cdot${pv(x[1])} + ${pv(b)} = ${f}$.`,
					`$r = f/\\|\\mathbf{w}\\| = ${n(f / nw, 4)}$ (${f > 0 ? 'lado positivo' : f < 0 ? 'lado negativo' : 'sobre la frontera'}).`,
					`Si $(\\mathbf{w}, b)$ estuviera en forma canónica, la banda mediría $2/\\|\\mathbf{w}\\| = ${n(2 / nw, 4)}$.`,
				],
			};
		},
	},
	kernel: {
		nombre: 'Evaluar kernels',
		f: (r) => {
			const x = [int(r, -2, 3), int(r, -2, 3)],
				z = [int(r, -2, 3), int(r, -2, 3)];
			const dot = x[0] * z[0] + x[1] * z[1];
			const d2 = (x[0] - z[0]) ** 2 + (x[1] - z[1]) ** 2;
			const g = pick(r, [0.1, 0.25, 0.5]);
			return {
				tema: 'Kernels',
				href: '/kernels/practica/',
				enunciado: `$\\mathbf{x} = (${x[0]}, ${x[1]})$, $\\mathbf{z} = (${z[0]}, ${z[1]})$. Calcula $K(\\mathbf{x},\\mathbf{z}) = (1 + \\mathbf{x}^\\top\\mathbf{z})^2$.`,
				pregunta: 'Valor del kernel polinómico',
				respuesta: (1 + dot) ** 2,
				tol: 0.001,
				pasos: [
					`$\\mathbf{x}^\\top\\mathbf{z} = ${pv(x[0])}\\cdot${pv(z[0])} + ${pv(x[1])}\\cdot${pv(z[1])} = ${dot}$.`,
					`$(1 + ${pv(dot)})^2 = ${(1 + dot) ** 2}$: el mismo número que $\\phi(\\mathbf{x})^\\top\\phi(\\mathbf{z})$ con el $\\phi$ de 6 dimensiones, sin construirlo.`,
					`Extra: RBF con $\\gamma = ${g}$: $\\|\\mathbf{x}-\\mathbf{z}\\|^2 = ${d2}$, $K = e^{-${g}\\cdot${d2}} = ${n(Math.exp(-g * d2), 4)}$.`,
				],
			};
		},
	},
	gini: {
		nombre: 'Ganancia de Gini',
		f: (r) => {
			let L: number[], Rr: number[];
			do {
				L = [int(r, 0, 8), int(r, 0, 8)];
				Rr = [int(r, 0, 8), int(r, 0, 8)];
			} while (L[0] + L[1] === 0 || Rr[0] + Rr[1] === 0);
			const gi = (a: number, b: number) => 1 - (a / (a + b)) ** 2 - (b / (a + b)) ** 2;
			const nL = L[0] + L[1],
				nR = Rr[0] + Rr[1],
				N = nL + nR;
			const gp = gi(L[0] + Rr[0], L[1] + Rr[1]),
				gl = gi(L[0], L[1]),
				gr = gi(Rr[0], Rr[1]);
			const w = (nL / N) * gl + (nR / N) * gr;
			return {
				tema: 'Árboles',
				href: '/arboles/impureza/',
				enunciado: `Un nodo $[${L[0] + Rr[0]}, ${L[1] + Rr[1]}]$ se parte en hijos $[${L[0]}, ${L[1]}]$ y $[${Rr[0]}, ${Rr[1]}]$ (conteos por clase).`,
				pregunta: 'Ganancia de Gini $\\Delta I$',
				respuesta: gp - w,
				tol: 0.003,
				pasos: [
					`Padre: $1 - (${L[0] + Rr[0]}/${N})^2 - (${L[1] + Rr[1]}/${N})^2 = ${n(gp, 4)}$.`,
					`Izquierdo ($n=${nL}$): Gini $= ${n(gl, 4)}$. Derecho ($n=${nR}$): Gini $= ${n(gr, 4)}$.`,
					`Ponderado: $\\tfrac{${nL}}{${N}}\\cdot${n(gl, 4)} + \\tfrac{${nR}}{${N}}\\cdot${n(gr, 4)} = ${n(w, 4)}$.`,
					`$\\Delta I = ${n(gp, 4)} - ${n(w, 4)} = ${n(gp - w, 4)}$.`,
				],
			};
		},
	},
	poda: {
		nombre: 'Poda: eslabón más débil',
		f: (r) => {
			const n0 = int(r, 1, 6),
				n1 = int(r, 1, 6),
				N = pick(r, [10, 20, 40]);
			const nm = n0 + n1;
			const gin = 1 - (n0 / nm) ** 2 - (n1 / nm) ** 2;
			const Rm = (nm / N) * gin;
			const leaves = int(r, 2, 4);
			const RT = Rm * pick(r, [0, 0.25, 0.5]);
			const g = (Rm - RT) / (leaves - 1);
			return {
				tema: 'Poda',
				href: '/arboles/poda/',
				enunciado: `En un árbol entrenado con $n = ${N}$ puntos, el nodo $m$ tiene $[${n0}, ${n1}]$. Su subárbol $T_m$ tiene ${leaves} hojas y riesgo $R(T_m) = ${n(RT, 4)}$ (Gini ponderado).`,
				pregunta: 'Precio de equilibrio $g(m)$',
				respuesta: g,
				tol: 0.0005,
				pasos: [
					`Gini del nodo: $1 - (${n0}/${nm})^2 - (${n1}/${nm})^2 = ${n(gin, 4)}$.`,
					`$R(m) = \\tfrac{n_m}{n}\\,\\text{Gini} = \\tfrac{${nm}}{${N}}\\cdot${n(gin, 4)} = ${n(Rm, 4)}$.`,
					`$g(m) = \\dfrac{R(m) - R(T_m)}{|T_m| - 1} = \\dfrac{${n(Rm, 4)} - ${n(RT, 4)}}{${leaves - 1}} = ${n(g, 4)}$.`,
					`Para $\\alpha > ${n(g, 4)}$ conviene colapsar el subárbol en una hoja.`,
				],
			};
		},
	},
};

type Stats = Record<string, { ok: number; total: number }>;

/** Generador infinito de ejercicios numéricos con solución paso a paso. */
export default function ExerciseGenerator() {
	const keys = Object.keys(GEN);
	const [tipo, setTipo] = useState<string>('aleatorio');
	const [seed, setSeed] = useState(1);
	const [ej, setEj] = useState<Ej | null>(null);
	const [resp, setResp] = useState('');
	const [estado, setEstado] = useState<'nuevo' | 'ok' | 'mal' | 'visto'>('nuevo');
	const [verPasos, setVerPasos] = useState(0);
	const [stats, setStats] = useState<Stats>({});

	const nuevo = (t = tipo, s = seed + 1) => {
		const r = rng(s * 7919 + 13);
		const k = t === 'aleatorio' ? keys[Math.floor(r.next() * keys.length)] : t;
		setEj(GEN[k].f(r));
		setSeed(s);
		setResp('');
		setEstado('nuevo');
		setVerPasos(0);
	};
	useEffect(() => {
		setStats(load<Stats>('ejercicios:v1', {}));
		nuevo('aleatorio', Math.floor(Math.random() * 1e6));
	}, []);

	const registrar = (ok: boolean) => {
		if (!ej) return;
		const s = { ...stats, [ej.tema]: { ok: (stats[ej.tema]?.ok ?? 0) + (ok ? 1 : 0), total: (stats[ej.tema]?.total ?? 0) + 1 } };
		setStats(s);
		save('ejercicios:v1', s);
	};
	const comprobar = () => {
		if (!ej || estado !== 'nuevo') return;
		const v = Number(resp.replace(',', '.'));
		const ok = Number.isFinite(v) && Math.abs(v - ej.respuesta) <= ej.tol;
		setEstado(ok ? 'ok' : 'mal');
		registrar(ok);
		if (!ok) setVerPasos(1);
	};
	const totOk = Object.values(stats).reduce((a, s) => a + s.ok, 0);
	const tot = Object.values(stats).reduce((a, s) => a + s.total, 0);

	return (
		<div className="pg not-content">
			<div className="pg-row" style={{ justifyContent: 'space-between' }}>
				<h4>Generador de ejercicios</h4>
				<span style={{ color: 'var(--pg-muted)' }}>
					{totOk}/{tot} correctos{' '}
					<button onClick={() => { setStats({}); save('ejercicios:v1', {}); }}>Reiniciar</button>
				</span>
			</div>
			<p className="pg-sub">Cada ejercicio es nuevo (números aleatorios). Resuélvelo en papel, escribe tu respuesta (usa 3 o 4 decimales; se acepta un margen pequeño de redondeo) y compruébala. Si fallas, la solución se abre paso a paso.</p>
			<div className="pg-row">
				<label className="pg-field" style={{ maxWidth: '22rem' }}>
					<span>tipo de ejercicio</span>
					<select value={tipo} onChange={(e) => { setTipo(e.target.value); nuevo(e.target.value); }}>
						<option value="aleatorio">🎲 Aleatorio (todos los temas)</option>
						{keys.map((k) => (
							<option key={k} value={k}>{GEN[k].nombre}</option>
						))}
					</select>
				</label>
				<button className="primary" onClick={() => nuevo()}>Nuevo ejercicio</button>
			</div>
			{ej && (
				<div className="card-item">
					<div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
						<span className="chip">{ej.tema}</span>
						<a href={ej.href} style={{ fontSize: '0.8rem' }}>repasar la teoría →</a>
					</div>
					<p style={{ margin: '0.7rem 0', color: 'var(--sl-color-gray-1)', fontSize: '1rem' }}>
						<Rich text={ej.enunciado} />
					</p>
					<div className="pg-row" style={{ alignItems: 'center' }}>
						<span style={{ color: 'var(--sl-color-white)', fontWeight: 600 }}>
							<Rich text={ej.pregunta} /> =
						</span>
						<input
							type="text"
							inputMode="decimal"
							value={resp}
							placeholder="tu respuesta"
							onChange={(e) => setResp(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && comprobar()}
							disabled={estado !== 'nuevo'}
							style={{ width: '9rem' }}
						/>
						<button onClick={comprobar} disabled={estado !== 'nuevo' || !resp.trim()}>Comprobar</button>
						<button onClick={() => { if (estado === 'nuevo') { setEstado('visto'); registrar(false); } setVerPasos(ej.pasos.length); }}>Ver solución</button>
					</div>
					{estado === 'ok' && <div className="pg-note ok" style={{ marginTop: '0.7rem' }}>✔ ¡Correcto! Respuesta: {n(ej.respuesta, 4)}</div>}
					{estado === 'mal' && <div className="pg-note bad" style={{ marginTop: '0.7rem' }}>✘ No es. La respuesta es {n(ej.respuesta, 4)}. Revisa los pasos:</div>}
					{verPasos > 0 && (
						<ol style={{ marginTop: '0.8rem', paddingLeft: '1.3rem' }}>
							{ej.pasos.slice(0, verPasos).map((p, i) => (
								<li key={i} style={{ margin: '0.45rem 0', animation: 'fade-up .35s both' }}>
									<Rich text={p} />
								</li>
							))}
						</ol>
					)}
					{verPasos > 0 && verPasos < ej.pasos.length && (
						<button onClick={() => setVerPasos(verPasos + 1)} style={{ marginTop: '0.4rem' }}>Siguiente paso →</button>
					)}
					{estado === 'nuevo' && verPasos === 0 && (
						<button onClick={() => setVerPasos(1)} style={{ marginTop: '0.7rem' }}>Dame una pista</button>
					)}
				</div>
			)}
			{tot > 0 && (
				<div className="pg-stats">
					{Object.entries(stats).map(([t, s]) => (
						<div key={t} className="pg-stat">
							<span className="k">{t}</span>
							<span className="v" style={{ color: s.ok / s.total >= 0.7 ? 'var(--pg-ok)' : 'var(--pg-warn)' }}>
								{s.ok}/{s.total}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

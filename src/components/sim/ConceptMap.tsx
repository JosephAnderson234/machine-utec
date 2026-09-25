import { useState } from 'react';
import Rich from '../ui/Rich';

type N = { id: string; t: string; x: number; y: number; href: string; g: 0 | 1 | 2 | 3 | 4 | 5; d: string };
const NODES: N[] = [
	{ id: 'datos', t: 'Datos, T/P/E y particiones', x: 120, y: 80, href: '/fundamentos/intro/', g: 0, d: 'Aprender = mejorar la medida P en la tarea T con la experiencia E. Train ajusta, validación elige, test se usa una vez. La meta es **generalizar**.' },
	{ id: 'mates', t: 'Álgebra, probabilidad, cálculo', x: 120, y: 280, href: '/fundamentos/matematicas/', g: 0, d: 'Álgebra lineal escribe el modelo ($\\hat y = Xw$), la probabilidad mide la incertidumbre y la optimización ajusta los parámetros.' },
	{ id: 'bv', t: 'Sesgo–varianza', x: 120, y: 470, href: '/regularizacion/sesgo-varianza/', g: 1, d: 'Error esperado = sesgo² + varianza + σ². Explica la curva en U de validación y es la brújula de todo el curso.' },
	{ id: 'cv', t: 'Validación cruzada', x: 150, y: 660, href: '/regularizacion/validacion-cruzada/', g: 1, d: 'Rota el bloque de validación y promedia: elige **todo hiperparámetro** (λ, grado, C, γ, α de poda) sin tocar el test.' },
	{ id: 'linreg', t: 'Regresión lineal', x: 350, y: 110, href: '/regresion/modelo/', g: 1, d: 'Modelo $\\hat y = Xw$, costo convexo $\\|y - Xw\\|^2$, solución $(X^\\top X)^{-1}X^\\top y$ = proyección sobre el espacio columna.' },
	{ id: 'gd', t: 'Descenso de gradiente', x: 350, y: 290, href: '/regresion/gradiente/', g: 0, d: '$w \\leftarrow w - \\eta\\nabla J$. El motor para todo modelo sin forma cerrada. η, escalado y batch/SGD.' },
	{ id: 'reg', t: 'Ridge y lasso', x: 350, y: 470, href: '/regularizacion/ridge-lasso/', g: 1, d: 'Pérdida + λ·penalización. Ridge encoge (ℓ2), lasso anula pesos (ℓ1, esquinas del rombo).' },
	{ id: 'mle', t: 'Máxima verosimilitud', x: 590, y: 50, href: '/clasificacion/entrenamiento/', g: 0, d: 'Elegir los parámetros que hacen más probables los datos. Da el MSE (ruido gaussiano), la cross-entropy (Bernoulli) y los conteos de NB/LDA.' },
	{ id: 'logreg', t: 'Regresión logística', x: 590, y: 220, href: '/clasificacion/logistica/', g: 2, d: 'Log-odds lineal ⇒ $P(y=1|x) = \\sigma(w^\\top x + b)$. Frontera lineal, cross-entropy convexa.' },
	{ id: 'metricas', t: 'Métricas de clasificación', x: 570, y: 390, href: '/clasificacion/metricas/', g: 2, d: 'Matriz de confusión, precision, recall, F1, ROC/AUC. La accuracy miente con clases desbalanceadas.' },
	{ id: 'softmax', t: 'Softmax', x: 820, y: 100, href: '/clasificacion/softmax/', g: 2, d: 'Un score por clase normalizado. Con K = 2 es la sigmoide; gradiente otra vez $p - y$.' },
	{ id: 'bayes', t: 'Bayes y MAP', x: 830, y: 255, href: '/generativos/bayes/', g: 3, d: 'Posterior ∝ prior × likelihood. Regla: $\\hat y = \\arg\\max_k \\pi_k p(x|y=k)$.' },
	{ id: 'lda', t: 'LDA / QDA', x: 830, y: 420, href: '/generativos/lda-qda/', g: 3, d: 'Cada clase es una gaussiana. Σ compartida ⇒ frontera lineal; Σ propia ⇒ cuadrática.' },
	{ id: 'nb', t: 'Naive Bayes', x: 1070, y: 300, href: '/generativos/naive-bayes/', g: 3, d: 'Features independientes dada la clase: pocos parámetros, rápido, sobreconfiado. Suavizado de Laplace = MAP.' },
	{ id: 'hinge', t: 'Margen suave y hinge', x: 420, y: 640, href: '/svm/margen-suave/', g: 4, d: 'Holguras ξ y precio C. Equivale a hinge + ℓ2: la receta pérdida + penalización.' },
	{ id: 'svm', t: 'SVM: margen máximo', x: 650, y: 560, href: '/svm/geometria/', g: 4, d: 'La recta con más espacio vacío: $\\min \\tfrac12\\|w\\|^2$ s.a. $y_i(w^\\top x_i+b)\\ge 1$. Banda = $2/\\|w\\|$.' },
	{ id: 'dual', t: 'Lagrange, KKT y dual', x: 880, y: 580, href: '/svm/dual/', g: 4, d: 'Un precio $\\alpha_i$ por punto. Holgura complementaria ⇒ solo los vectores de soporte importan. El dual solo ve $x_i^\\top x_j$.' },
	{ id: 'kernels', t: 'Kernels', x: 1080, y: 500, href: '/kernels/truco/', g: 4, d: 'Cambia $x_i^\\top x_j$ por $K(x_i,x_j) = \\phi(x_i)^\\top\\phi(x_j)$: fronteras curvas sin construir φ.' },
	{ id: 'krr', t: 'Kernel ridge', x: 1080, y: 660, href: '/kernels/practica/', g: 4, d: 'Ridge en el espacio de features: $\\alpha = (K+\\lambda I)^{-1}y$. Teorema del representante.' },
	{ id: 'trees', t: 'Árboles de decisión', x: 640, y: 730, href: '/arboles/cart/', g: 5, d: 'Preguntas sí/no ⇒ cajas alineadas a los ejes. Impureza, ganancia, CART codicioso y poda por costo-complejidad.' },
	{ id: 'ens', t: 'Ensembles (siguiente)', x: 900, y: 730, href: '/arboles/poda/', g: 5, d: 'Promediar muchos árboles de alta varianza (bagging, random forest) baja la varianza sin subir el sesgo.' },
];
const EDGES: [string, string, string][] = [
	['datos', 'bv', 'generalizar = controlar sesgo y varianza'],
	['datos', 'cv', 'train / validación / test'],
	['mates', 'gd', 'derivada = pendiente; gradiente apunta cuesta arriba'],
	['mates', 'bayes', 'regla de Bayes y frecuencias naturales'],
	['linreg', 'gd', 'sin invertir XᵀX: descender el bowl convexo'],
	['linreg', 'mle', 'MSE = máxima verosimilitud con ruido gaussiano'],
	['linreg', 'reg', 'ridge = OLS + λ‖w‖², sumar λ a la diagonal'],
	['linreg', 'kernels', 'features x², x³… = un φ(x) explícito'],
	['reg', 'bv', 'cambia un poco de sesgo por mucha varianza'],
	['cv', 'reg', 'elige λ (regla de 1 SE)'],
	['cv', 'hinge', 'elige C y γ juntos'],
	['cv', 'trees', 'elige el α de poda'],
	['bv', 'trees', 'árboles profundos: sesgo bajo, varianza alta'],
	['logreg', 'mle', 'cross-entropy = −log-verosimilitud Bernoulli'],
	['logreg', 'gd', 'sin forma cerrada; gradiente Xᵀ(p − y)/n'],
	['logreg', 'reg', 'λ‖w‖² evita w → ∞ con clases separables'],
	['logreg', 'metricas', 'umbral sobre σ ⇒ matriz de confusión'],
	['logreg', 'softmax', 'softmax con K = 2 es la sigmoide'],
	['bayes', 'metricas', 'P(enfermo | +) es la precision'],
	['bayes', 'nb', 'likelihood = producto de factores por feature'],
	['bayes', 'lda', 'likelihood = gaussiana multivariada'],
	['nb', 'lda', 'NB gaussiano = QDA con Σₖ diagonal'],
	['lda', 'logreg', 'posterior LDA = σ(wᵀx + b): mismo modelo, derivado'],
	['svm', 'dual', 'Lagrangiano + KKT ⇒ problema dual'],
	['svm', 'hinge', 'datos no separables: pagar holguras'],
	['hinge', 'reg', 'C grande = λ pequeño (λ ∝ 1/C)'],
	['hinge', 'logreg', 'hinge vs pérdida logística'],
	['dual', 'kernels', 'el dual solo usa productos xᵢᵀxⱼ'],
	['kernels', 'krr', 'teorema del representante'],
	['krr', 'reg', 'ridge en el espacio de features'],
	['trees', 'ens', 'promediar árboles baja la varianza'],
];
const GC = ['var(--pg-muted)', 'var(--pg-c1)', 'var(--pg-c2)', 'var(--pg-c3)', 'var(--sl-color-accent)', 'var(--pg-c4)'];
const GN = ['Fundamentos', 'Regresión y regularización', 'Clasificación discriminativa', 'Generativos', 'SVM y kernels', 'Árboles'];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

/** Mapa conceptual clicable: cada arista dice CÓMO se relacionan dos temas. */
export default function ConceptMap() {
	const [sel, setSel] = useState<string>('logreg');
	const [hover, setHover] = useState<string | null>(null);
	const focus = hover ?? sel;
	const rel = EDGES.filter(([a, b]) => a === focus || b === focus);
	const neigh = new Set(rel.flatMap(([a, b]) => [a, b]));
	const S = byId[focus];

	const wrap = (t: string) => {
		const words = t.split(' ');
		const lines: string[] = [''];
		for (const w of words) {
			if ((lines[lines.length - 1] + ' ' + w).trim().length > 15) lines.push(w);
			else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim();
		}
		return lines;
	};

	return (
		<div className="pg not-content">
			<h4>Mapa conceptual del curso</h4>
			<p className="pg-sub">Haz clic en un tema (o pasa el mouse): se resaltan sus conexiones y abajo aparece <b>cómo</b> se relaciona con cada uno, con enlaces directos.</p>
			<div className="legend">
				{GN.map((g, i) => (
					<span key={g}>
						<i style={{ background: GC[i], height: 8, width: 8, borderRadius: 99 }} />
						{g}
					</span>
				))}
			</div>
			<div className="pg-scroll">
				<svg viewBox="0 0 1200 800" style={{ minWidth: 560, width: '100%' }} className="plot">
					{EDGES.map(([a, b], i) => {
						const A = byId[a],
							B = byId[b];
						const on = a === focus || b === focus;
						return (
							<g key={i}>
								<line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={on ? 'var(--pg-violet)' : 'var(--pg-border)'} strokeWidth={on ? 2.4 : 1.3} opacity={on ? 1 : 0.9} />
															</g>
						);
					})}
					{NODES.map((n) => {
						const lines = wrap(n.t);
						const w = 218,
							h = 26 + lines.length * 24;
						const dim = !neigh.has(n.id) && n.id !== focus;
						return (
							<g
								key={n.id}
								style={{ cursor: 'pointer', transition: 'opacity .25s' }}
								opacity={dim ? 0.4 : 1}
								onClick={() => setSel(n.id)}
								onMouseEnter={() => setHover(n.id)}
								onMouseLeave={() => setHover(null)}
							>
								<rect x={n.x - w / 2} y={n.y - h / 2} width={w} height={h} rx={12} fill="var(--pg-surface)" stroke={GC[n.g]} strokeWidth={n.id === sel ? 3 : 1.6} />
								<rect x={n.x - w / 2} y={n.y - h / 2} width={w} height={h} rx={12} fill={GC[n.g]} opacity={n.id === focus ? 0.22 : 0.08} />
								{lines.map((l, i) => (
									<text key={i} x={n.x} y={n.y - ((lines.length - 1) * 24) / 2 + i * 24 + 7} textAnchor="middle" fontSize={21} fontWeight={600} fill="var(--sl-color-white)">
										{l}
									</text>
								))}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="pg-note">
				<b style={{ fontSize: '1.05rem' }}>{S.t}</b> · <a href={S.href}>ir al tema →</a>
				<div style={{ marginTop: '0.4rem' }}>
					<Rich text={S.d} />
				</div>
				<ul>
					{EDGES.filter(([a, b]) => a === focus || b === focus).map(([a, b, lab], i) => {
						const other = byId[a === focus ? b : a];
						return (
							<li key={i}>
								<a href={other.href}>{other.t}</a>: {lab}
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}

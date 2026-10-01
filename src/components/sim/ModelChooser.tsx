import { useState } from 'react';

type Q = { id: string; q: string; opts: { v: string; t: string }[]; soloClf?: boolean };
const QS: Q[] = [
	{ id: 'tarea', q: '¿Qué predices?', opts: [{ v: 'reg', t: 'Un número (regresión)' }, { v: 'clf', t: 'Una categoría (clasificación)' }] },
	{ id: 'n', q: '¿Cuántos ejemplos etiquetados tienes?', opts: [{ v: 'poco', t: 'Pocos (decenas a cientos)' }, { v: 'medio', t: 'Miles' }, { v: 'mucho', t: 'Cientos de miles o más' }] },
	{ id: 'frontera', q: '¿Cómo esperas que sea la relación / frontera?', opts: [{ v: 'lineal', t: 'Aproximadamente lineal' }, { v: 'curva', t: 'Curva y suave' }, { v: 'reglas', t: 'Tipo reglas / umbrales / interacciones' }, { v: 'nose', t: 'No sé' }] },
	{ id: 'interp', q: '¿Necesitas explicar el modelo a una persona (médico, regulador)?', opts: [{ v: 'si', t: 'Sí, es clave' }, { v: 'no', t: 'No especialmente' }] },
	{ id: 'prob', q: '¿Necesitas probabilidades bien calibradas?', soloClf: true, opts: [{ v: 'si', t: 'Sí (decidir umbrales, riesgos)' }, { v: 'no', t: 'Me basta la etiqueta' }] },
	{ id: 'feat', q: '¿Cómo son tus features?', opts: [{ v: 'muchas', t: 'Muchísimas (texto, genes); quizá más que ejemplos' }, { v: 'mixtas', t: 'Mezcla de numéricas y categóricas, escalas distintas' }, { v: 'normales', t: 'Numéricas, pocas o moderadas' }] },
	{ id: 'sel', q: '¿Crees que solo unas pocas features importan?', opts: [{ v: 'si', t: 'Sí, quiero seleccionarlas' }, { v: 'no', t: 'No / no sé' }] },
];

type M = { n: string; href: string; tarea: 'reg' | 'clf' | 'ambas' };
const MODELS: M[] = [
	{ n: 'Regresión lineal (OLS)', href: '/regresion/modelo/', tarea: 'reg' },
	{ n: 'Ridge', href: '/regularizacion/ridge-lasso/', tarea: 'reg' },
	{ n: 'Lasso', href: '/regularizacion/ridge-lasso/', tarea: 'reg' },
	{ n: 'Kernel ridge (RBF)', href: '/kernels/practica/', tarea: 'reg' },
	{ n: 'Árbol de regresión', href: '/arboles/cart/', tarea: 'reg' },
	{ n: 'Regresión logística (+ L2)', href: '/clasificacion/logistica/', tarea: 'clf' },
	{ n: 'Naive Bayes', href: '/generativos/naive-bayes/', tarea: 'clf' },
	{ n: 'LDA', href: '/generativos/lda-qda/', tarea: 'clf' },
	{ n: 'QDA', href: '/generativos/lda-qda/', tarea: 'clf' },
	{ n: 'SVM lineal', href: '/svm/margen-suave/', tarea: 'clf' },
	{ n: 'SVM con kernel RBF', href: '/kernels/practica/', tarea: 'clf' },
	{ n: 'Árbol de decisión (podado)', href: '/arboles/poda/', tarea: 'clf' },
];

type A = Record<string, string>;
function score(m: string, a: A): { s: number; why: string[]; warn: string[] } {
	let s = 0;
	const why: string[] = [],
		warn: string[] = [];
	const add = (v: number, t: string) => {
		s += v;
		if (v > 0) why.push(t);
		else if (v < 0) warn.push(t);
	};
	const lin = a.frontera === 'lineal',
		curva = a.frontera === 'curva',
		reglas = a.frontera === 'reglas';
	switch (m) {
		case 'Regresión lineal (OLS)':
			if (lin) add(2, 'la relación es lineal: el modelo más simple que encaja');
			if (curva || reglas) add(-2, 'una recta no se dobla: necesitaría features polinómicas');
			if (a.interp === 'si') add(2, 'cada peso es «cambio por unidad»: muy interpretable');
			if (a.feat === 'muchas') add(-3, 'con p ≥ n, XᵀX es singular: OLS no tiene solución única');
			if (a.n === 'mucho') add(1, 'escala bien con SGD');
			break;
		case 'Ridge':
			if (lin || a.frontera === 'nose') add(2, 'lineal y con varianza controlada por λ');
			if (a.feat === 'muchas') add(2, 'XᵀX + λI siempre es invertible, incluso con p > n');
			if (a.sel === 'no') add(1, 'muchos efectos pequeños: ridge los reparte');
			if (a.interp === 'si') add(1, 'sigue siendo un modelo lineal legible');
			if (curva || reglas) add(-2, 'no captura curvas sin features extra');
			break;
		case 'Lasso':
			if (a.sel === 'si') add(3, 'pone pesos exactamente en 0: selección automática');
			if (a.feat === 'muchas') add(2, 'esparsidad útil con muchísimas features');
			if (a.interp === 'si') add(2, 'modelo lineal con pocas features: muy explicable');
			if (curva || reglas) add(-2, 'lineal: no captura curvas');
			break;
		case 'Kernel ridge (RBF)':
			if (curva) add(3, 'el RBF ajusta curvas suaves en forma cerrada');
			if (a.n === 'poco' || a.n === 'medio') add(1, 'n pequeño/mediano: la matriz n×n es manejable');
			if (a.n === 'mucho') add(-3, 'O(n²) memoria y O(n³) tiempo: no escala');
			if (a.interp === 'si') add(-2, 'difícil de explicar');
			if (a.feat === 'mixtas') add(-1, 'exige estandarizar y codificar categóricas');
			break;
		case 'Árbol de regresión':
		case 'Árbol de decisión (podado)':
			if (reglas) add(3, 'umbrales e interacciones son su forma natural');
			if (a.interp === 'si') add(3, 'se lee como reglas «si… entonces»');
			if (a.feat === 'mixtas') add(2, 'no necesita escalar; maneja tipos mixtos');
			if (curva) add(-1, 'aproxima curvas con escalones');
			if (lin) add(-1, 'una relación lineal le cuesta una escalera');
			if (a.prob === 'si') add(-1, 'probabilidades mal calibradas si es profundo');
			warn.push('alta varianza: pódalo (α por CV) o promedia árboles (ensembles)');
			break;
		case 'Regresión logística (+ L2)':
			if (lin || a.frontera === 'nose') add(2, 'frontera lineal, convexa, robusta');
			if (a.prob === 'si') add(3, 'entrega P(y=1|x) razonablemente calibrada');
			if (a.interp === 'si') add(2, 'cada peso es un odds ratio eʷ');
			if (a.n === 'mucho') add(1, 'escala con SGD/mini-batch');
			if (a.feat === 'muchas') add(1, 'con L2 funciona bien en alta dimensión (texto)');
			if (curva || reglas) add(-2, 'frontera lineal sin features extra');
			break;
		case 'Naive Bayes':
			if (a.n === 'poco') add(3, 'aprende con muy pocos datos (solo cuenta y promedia)');
			if (a.feat === 'muchas') add(2, 'el clásico para texto (bolsa de palabras)');
			if (a.n === 'mucho') add(1, 'entrenar es una sola pasada de conteos');
			if (a.prob === 'si') add(-2, 'probabilidades sobreconfiadas (independencia falsa)');
			warn.push('supone features independientes dada la clase');
			break;
		case 'LDA':
			if (a.n === 'poco') add(2, 'generativo: pocos parámetros, aprende rápido');
			if (lin) add(2, 'frontera lineal derivada de gaussianas');
			if (a.feat === 'normales') add(1, 'features continuas aproximadamente gaussianas');
			if (a.feat === 'muchas') add(-2, 'Σ de d×d inestable con muchas features');
			if (a.feat === 'mixtas') add(-2, 'supone features continuas gaussianas');
			break;
		case 'QDA':
			if (curva) add(2, 'frontera cuadrática: clases con formas distintas');
			if (a.n === 'poco') add(-2, 'una Σ por clase: muchos parámetros para pocos datos');
			if (a.feat === 'muchas') add(-3, 'd(d+1)/2 parámetros por clase: inviable');
			if (a.feat === 'normales') add(1, 'features continuas');
			break;
		case 'SVM lineal':
			if (lin || a.frontera === 'nose') add(2, 'frontera lineal de margen máximo, robusta');
			if (a.feat === 'muchas') add(2, 'excelente en alta dimensión (texto)');
			if (a.n === 'mucho') add(1, 'con SGD + hinge escala a millones');
			if (a.prob === 'si') add(-2, 'no da probabilidades (necesita Platt)');
			if (a.interp === 'si') add(-1, 'pesos legibles, pero menos que la logística');
			break;
		case 'SVM con kernel RBF':
			if (curva || a.frontera === 'nose') add(3, 'fronteras curvas arbitrarias con el truco del kernel');
			if (a.n === 'poco' || a.n === 'medio') add(1, 'n pequeño/mediano: el dual es manejable');
			if (a.n === 'mucho') add(-3, 'entrenar cuesta O(n²)–O(n³)');
			if (a.prob === 'si') add(-2, 'no da probabilidades nativas');
			if (a.interp === 'si') add(-3, 'caja negra para un humano');
			if (a.feat === 'mixtas') add(-1, 'exige estandarizar; categóricas codificadas');
			warn.push('ajusta C y γ juntos por validación cruzada');
			break;
	}
	return { s, why, warn };
}

/** Guía interactiva: responde preguntas sobre tu problema y recibe un ranking razonado de modelos del curso. */
export default function ModelChooser() {
	const [a, setA] = useState<A>({});
	const qs = QS.filter((q) => !(q.soloClf && a.tarea === 'reg'));
	const answered = qs.every((q) => a[q.id]);
	const ranked = answered
		? MODELS.filter((m) => m.tarea === a.tarea)
				.map((m) => ({ m, ...score(m.n, a) }))
				.sort((x, y) => y.s - x.s)
		: [];
	return (
		<div className="pg not-content">
			<div className="pg-row" style={{ justifyContent: 'space-between' }}>
				<h4>¿Qué modelo uso?</h4>
				<button onClick={() => setA({})}>Reiniciar</button>
			</div>
			<p className="pg-sub">Responde sobre tu problema. El ranking usa las ventajas y limitaciones que se ven en el curso; no reemplaza a la validación cruzada, pero te dice por dónde empezar y por qué.</p>
			{qs.map((q, i) => (
				<div key={q.id} className="card-item">
					<div style={{ color: 'var(--sl-color-white)', fontWeight: 600 }}>
						{i + 1}. {q.q}
					</div>
					<div className="pg-seg" style={{ marginTop: '0.55rem' }}>
						{q.opts.map((o) => (
							<button key={o.v} className={a[q.id] === o.v ? 'active' : ''} onClick={() => setA((prev) => ({ ...prev, [q.id]: o.v }))}>
								{o.t}
							</button>
						))}
					</div>
				</div>
			))}
			{!answered && <div className="pg-note">Faltan {qs.filter((q) => !a[q.id]).length} respuestas.</div>}
			{answered && (
				<div className="card-list">
					<span className="lane-label">Recomendación (de mejor a peor ajuste para tus respuestas)</span>
					{ranked.map((r, i) => (
						<div key={r.m.n} className="rank" style={{ opacity: i < 3 ? 1 : 0.55 }}>
							<span className="n">{i + 1}</span>
							<div>
								<a href={r.m.href} style={{ fontWeight: 650, color: 'var(--sl-color-white)' }}>
									{r.m.n}
								</a>
								{r.why.length > 0 && <div style={{ fontSize: '0.84rem', color: 'var(--pg-ok)' }}>+ {r.why.join(' · ')}</div>}
								{r.warn.length > 0 && <div style={{ fontSize: '0.84rem', color: 'var(--pg-warn)' }}>− {r.warn.join(' · ')}</div>}
							</div>
							<span className="chip">{r.s > 0 ? `+${r.s}` : r.s}</span>
						</div>
					))}
					<div className="pg-note warn">
						Siempre: empieza con el modelo simple (lineal/logística) como <b>baseline</b>, estandariza (salvo árboles), elige hiperparámetros por <b>validación cruzada</b> y reporta en el test <b>una sola vez</b>.
					</div>
				</div>
			)}
		</div>
	);
}

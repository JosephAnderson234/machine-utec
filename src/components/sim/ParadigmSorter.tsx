import { useState } from 'react';

const CATS = ['Regresión', 'Clasificación', 'Clustering', 'Reducción de dim.', 'Refuerzo'] as const;
type Cat = (typeof CATS)[number];

const ESCENARIOS: { s: string; ok: Cat; why: string }[] = [
	{ s: 'Una inmobiliaria quiere estimar el alquiler mensual (en soles) de un departamento a partir de su área, distrito y nº de cuartos.', ok: 'Regresión', why: 'El target es un **número continuo** y hay ejemplos con la respuesta (alquileres conocidos): supervisado, regresión.' },
	{ s: 'Un banco decide si aprobar o rechazar una tarjeta de crédito usando el historial de pagos de clientes pasados (que pagaron o no).', ok: 'Clasificación', why: 'Etiqueta discreta (paga / no paga) y ejemplos etiquetados: clasificación binaria (logística, árboles, SVM…).' },
	{ s: 'Una tienda online quiere agrupar a sus clientes en «tipos» según su comportamiento de compra, sin tener etiquetas previas.', ok: 'Clustering', why: 'No hay respuesta correcta conocida: descubrir grupos similares es no supervisado (clustering).' },
	{ s: 'Un laboratorio tiene 20 000 genes medidos por paciente y quiere visualizarlos en un mapa 2-D para ver estructura.', ok: 'Reducción de dim.', why: 'Comprimir muchas variables en pocas para visualizar o quitar ruido: reducción de dimensionalidad (PCA).' },
	{ s: 'Un robot aprende a caminar probando movimientos y recibiendo un puntaje según cuánto avanza sin caerse.', ok: 'Refuerzo', why: 'No hay dataset fijo de respuestas: el agente **actúa** y recibe recompensas. Aprendizaje por refuerzo.' },
	{ s: 'Un hospital quiere detectar si una radiografía muestra neumonía, con miles de imágenes ya diagnosticadas por radiólogos.', ok: 'Clasificación', why: 'Categoría (neumonía sí/no) con ejemplos etiquetados. Imagen = tensor, pero la lógica es la misma.' },
	{ s: 'Una empresa eléctrica predice la demanda de energía (MW) de mañana a partir del clima y la demanda de días anteriores.', ok: 'Regresión', why: 'Número continuo (MW). Ojo: es una serie de tiempo, la partición train/test debe respetar el orden temporal.' },
	{ s: 'Gmail decide si un correo entrante es spam o no.', ok: 'Clasificación', why: 'El ejemplo clásico de Mitchell: T = etiquetar spam/ham, P = % correcto, E = correos marcados por usuarios.' },
	{ s: 'Una tarjeta detecta transacciones «raras» sin tener ejemplos de fraude etiquetados, solo comparando con el comportamiento típico.', ok: 'Clustering', why: 'Sin etiquetas: es detección de anomalías, emparentada con clustering (puntos lejos de todos los grupos). Si tuvieras fraudes etiquetados, sería clasificación desbalanceada.' },
	{ s: 'Un programa de ajedrez mejora jugando millones de partidas contra sí mismo, recibiendo +1 al ganar y −1 al perder.', ok: 'Refuerzo', why: 'Recompensa al final de una secuencia de acciones: refuerzo (como AlphaGo).' },
	{ s: 'Una app de música comprime cada canción en un vector de 32 números que conserva lo esencial del estilo.', ok: 'Reducción de dim.', why: 'Representación compacta (embedding) de baja dimensión: reducción de dimensionalidad.' },
	{ s: 'Una aseguradora estima cuántos días de hospitalización tendrá un asegurado según su edad, IMC y antecedentes.', ok: 'Regresión', why: 'Cantidad numérica. Como en el dataset de diabetes del curso: features clínicas → un score continuo.' },
];

/** Juego: clasifica escenarios reales según el paradigma de aprendizaje. */
export default function ParadigmSorter() {
	const [ans, setAns] = useState<(Cat | null)[]>(() => ESCENARIOS.map(() => null));
	const score = ans.filter((a, i) => a === ESCENARIOS[i].ok).length;
	const done = ans.filter(Boolean).length;
	const bold = (t: string) => t.split(/(\*\*[^*]+\*\*)/).map((p, i) => (p.startsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>));
	return (
		<div className="pg not-content">
			<div className="pg-row" style={{ justifyContent: 'space-between' }}>
				<h4>¿Qué tipo de problema es?</h4>
				<span style={{ color: 'var(--pg-muted)' }}>
					{score}/{ESCENARIOS.length} correctas · {done} respondidas{' '}
					<button onClick={() => setAns(ESCENARIOS.map(() => null))}>Reiniciar</button>
				</span>
			</div>
			<p className="pg-sub">Doce situaciones reales. Para cada una, elige el paradigma. El primer paso de cualquier proyecto es identificar si hay etiquetas y de qué tipo son.</p>
			<div className="card-list">
				{ESCENARIOS.map((e, i) => {
					const a = ans[i];
					return (
						<div key={i} className={`card-item ${a ? (a === e.ok ? 'ok' : 'bad') : ''}`}>
							<div style={{ color: 'var(--sl-color-gray-1)' }}>
								<b>{i + 1}.</b> {e.s}
							</div>
							<div className="pg-seg" style={{ marginTop: '0.6rem' }}>
								{CATS.map((c) => (
									<button
										key={c}
										disabled={!!a}
										className={a && c === e.ok ? 'active' : ''}
										style={a === c && c !== e.ok ? { borderColor: 'var(--pg-bad)', color: 'var(--pg-bad)' } : undefined}
										onClick={() => setAns((prev) => prev.map((x, k) => (k === i ? c : x)))}
									>
										{c}
									</button>
								))}
							</div>
							{a && <div className={`pg-note ${a === e.ok ? 'ok' : 'bad'}`} style={{ marginTop: '0.6rem' }}>{a === e.ok ? '✔ ' : `✘ Era ${e.ok}. `}{bold(e.why)}</div>}
						</div>
					);
				})}
			</div>
		</div>
	);
}

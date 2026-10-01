// Recuadro «En simple» al inicio de cada página de teoría: la idea sin fórmulas ni jerga.
// frase = la idea en una oración; analogia = imagen cotidiana; llevate = lo mínimo que hay que recordar;
// palabras = términos técnicos de la página traducidos a lenguaje normal.
export type EnSimple = { frase: string; analogia: string; llevate: string[]; palabras: [string, string][] };

export const ENSIMPLE: Record<string, EnSimple> = {
	'fundamentos/intro': {
		frase: 'En vez de escribirle a la computadora las reglas a mano, le damos muchos ejemplos resueltos y ella misma descubre la regla.',
		analogia: 'Es como aprender a reconocer perros: nadie te dio una definición exacta de «perro»; viste cientos y tu cabeza armó la regla sola. Machine learning hace eso con números.',
		llevate: [
			'Hay tres grandes tipos: <b>supervisado</b> (con respuestas: «esta foto es un gato»), <b>no supervisado</b> (sin respuestas: «agrupa lo parecido») y <b>por refuerzo</b> (aprender a base de premios y castigos).',
			'Lo que importa no es acertar en los ejemplos que ya viste, sino en los <b>nuevos</b>. Memorizar no es aprender.',
			'Por eso se separan los datos: unos para aprender (train), otros para ajustar decisiones (validación) y otros solo para el examen final (test).',
		],
		palabras: [
			['feature', 'un dato que describe al ejemplo (edad, precio, tamaño…). Una columna de la tabla.'],
			['target / etiqueta', 'la respuesta que queremos predecir.'],
			['generalizar', 'acertar también con datos que el modelo nunca vio.'],
			['función de pérdida', 'un número que dice «qué tan mal» predijo el modelo. Aprender = hacerlo pequeño.'],
		],
	},
	'fundamentos/matematicas': {
		frase: 'Solo necesitas tres herramientas: vectores (para guardar datos), probabilidad (para la incertidumbre) y derivadas (para ir mejorando el modelo).',
		analogia: 'Piensa en una receta: el álgebra lineal son los ingredientes ordenados en la mesa, la probabilidad es saber que el horno no siempre calienta igual, y el cálculo es probar la sopa y ajustar la sal poco a poco.',
		llevate: [
			'Un <b>vector</b> es una lista de números; una <b>matriz</b>, una tabla. Cada ejemplo de tus datos es un vector.',
			'El <b>producto punto</b> mide qué tanto «apuntan en la misma dirección» dos vectores: es la operación más usada de todo el curso.',
			'El <b>gradiente</b> te dice hacia dónde sube más rápido una función; para bajar, caminas al revés.',
		],
		palabras: [
			['norma', 'el largo de un vector.'],
			['autovalor / autovector', 'direcciones en que una matriz solo estira (no gira) las cosas, y cuánto las estira.'],
			['convexo', 'una función con forma de tazón: un solo fondo, imposible perderse.'],
			['distribución normal (gaussiana)', 'la típica campana: la mayoría de valores cerca del promedio y pocos en los extremos.'],
		],
	},
	'regresion/modelo': {
		frase: 'Regresión lineal = trazar la recta (o plano) que pasa lo más cerca posible de todos los puntos, para predecir un número.',
		analogia: 'Imagina estimar el precio de una casa por su tamaño: pones los datos en un gráfico y tiras una regla encima buscando que quede lo más pegada posible a todos los puntos.',
		llevate: [
			'El <b>error</b> de cada punto es la distancia vertical entre el valor real y la recta.',
			'Elevamos cada error al cuadrado y los sumamos: castiga más los errores grandes y da una única mejor recta.',
			'Hay una fórmula directa (ecuaciones normales) que te da esa mejor recta sin tener que probar.',
		],
		palabras: [
			['peso / coeficiente (w)', 'cuánto influye cada dato en la predicción. «Por cada m² más, el precio sube w».'],
			['sesgo / intercepto (b)', 'el valor de partida cuando todo lo demás es cero.'],
			['residuo', 'real menos predicho: lo que la recta no logró explicar.'],
			['ecuaciones normales', 'la fórmula que da los mejores pesos de una sola vez.'],
			['proyección', 'la «sombra» de un vector sobre otro: lo más cerca que se puede llegar.'],
		],
	},
	'regresion/gradiente': {
		frase: 'Descenso de gradiente = ir bajando la montaña del error a pasitos, siempre hacia donde más baja, hasta llegar al fondo.',
		analogia: 'Estás en un cerro con neblina y quieres llegar al valle. No ves el camino, pero sí sientes la inclinación bajo tus pies: das un paso cuesta abajo, vuelves a sentir, otro paso… así hasta el fondo.',
		llevate: [
			'Se usa cuando no hay fórmula directa o cuando los datos son demasiados para usarla.',
			'La <b>tasa de aprendizaje</b> es el tamaño del paso: muy chica tarda una eternidad; muy grande te hace saltar de un lado a otro sin llegar.',
			'Si las variables están en escalas muy distintas (metros vs. millones), el valle queda alargado y bajar es lento: por eso se <b>escalan</b> los datos.',
		],
		palabras: [
			['gradiente', 'la flecha que apunta hacia donde la función sube más rápido.'],
			['tasa de aprendizaje (η)', 'el tamaño de cada paso.'],
			['época', 'una pasada completa por todos los datos.'],
			['estocástico / mini-batch', 'en vez de mirar todos los datos en cada paso, mirar uno o un grupito: más rápido, pero más «tembloroso».'],
		],
	},
	'regresion/evaluacion': {
		frase: 'Para saber si el modelo es bueno, medimos cuánto se equivoca en promedio; y si una recta no alcanza, podemos usar curvas.',
		analogia: 'Es como calificar a un pronosticador del clima: ¿por cuántos grados se equivoca en promedio? ¿Y es mejor que simplemente decir «hará la temperatura de siempre»?',
		llevate: [
			'<b>MSE / RMSE / MAE</b> miden el error típico (RMSE y MAE en las mismas unidades que lo que predices).',
			'<b>R²</b> responde: ¿qué tanto mejor que predecir siempre el promedio? 1 = perfecto, 0 = igual que el promedio.',
			'Con curvas (polinomios) puedes ajustar mejor, pero si te pasas el modelo empieza a «memorizar» el ruido.',
		],
		palabras: [
			['outlier', 'un dato raro, muy lejos del resto, que puede jalar la recta hacia él.'],
			['features polinómicas', 'agregar x², x³… como nuevas columnas para que la «recta» pueda curvarse.'],
			['overfitting (sobreajuste)', 'el modelo se aprende de memoria los datos de entrenamiento, incluido el ruido, y falla con datos nuevos.'],
			['underfitting', 'el modelo es demasiado simple y ni siquiera acierta en los datos de entrenamiento.'],
		],
	},
	'regularizacion/sesgo-varianza': {
		frase: 'Un modelo puede fallar de dos maneras: por ser demasiado simple (sesgo) o por ser demasiado nervioso y cambiar con cada dato (varianza).',
		analogia: 'Piensa en tiro al blanco. <b>Sesgo</b>: todos tus tiros caen juntos pero lejos del centro (apuntas mal). <b>Varianza</b>: tus tiros quedan dispersos por todos lados (pulso tembloroso). Lo ideal: juntos y en el centro.',
		llevate: [
			'Modelo muy simple → mucho sesgo (underfitting). Modelo muy complejo → mucha varianza (overfitting).',
			'Diagnóstico rápido: error alto en train <i>y</i> en test → sesgo. Error bajo en train pero alto en test → varianza.',
			'Más datos ayudan contra la varianza; un modelo más flexible ayuda contra el sesgo.',
		],
		palabras: [
			['sesgo', 'error sistemático: el modelo se equivoca siempre hacia el mismo lado porque es muy rígido.'],
			['varianza', 'qué tanto cambiaría el modelo si lo entrenaras con otros datos parecidos.'],
			['ruido irreducible', 'la parte del error que ningún modelo puede eliminar (azar real en los datos).'],
			['trade-off', 'compromiso: bajar uno suele subir el otro.'],
		],
	},
	'regularizacion/ridge-lasso': {
		frase: 'Regularizar = ponerle una «multa» al modelo cuando usa números muy grandes, para que no se vuelva exagerado ni memorice.',
		analogia: 'Es como darle a alguien un presupuesto limitado: si cada peso «cuesta», el modelo solo invierte en las variables que realmente valen la pena.',
		llevate: [
			'<b>Ridge</b> encoge todos los pesos un poco (ninguno llega a cero).',
			'<b>Lasso</b> puede dejar pesos exactamente en cero: elimina variables inútiles (sirve para elegir variables).',
			'λ (lambda) es el tamaño de la multa: 0 = sin multa; muy grande = todo se aplasta hacia cero.',
		],
		palabras: [
			['regularización', 'agregar una penalización para que el modelo sea más simple.'],
			['ℓ2 / ℓ1', 'dos formas de medir «qué tan grandes» son los pesos (suma de cuadrados vs. suma de valores absolutos).'],
			['λ (lambda)', 'la perilla que decide cuánto pesa la multa.'],
			['camino de coeficientes', 'un gráfico de cómo cambia cada peso a medida que subes λ.'],
		],
	},
	'regularizacion/validacion-cruzada': {
		frase: 'Validación cruzada = turnarse para que cada parte de los datos sirva una vez de «examen», y así elegir bien la configuración del modelo.',
		analogia: 'Divides tus ejercicios de práctica en 5 grupos. Estudias con 4 y te tomas un mini-examen con el 5.º; repites cambiando cuál grupo es el examen. Tu nota real es el promedio de los 5 mini-exámenes.',
		llevate: [
			'Sirve para elegir cosas que el modelo no aprende solo: λ, el grado del polinomio, la profundidad del árbol…',
			'El conjunto de <b>test</b> no se toca hasta el final; si lo usas para decidir, tu nota final sale inflada.',
			'<b>Data leakage</b> (fuga): cuando información del examen se «cuela» en el estudio, p. ej. escalar los datos usando también el test.',
		],
		palabras: [
			['K-fold', 'partir los datos en K grupos y rotar cuál es el de prueba.'],
			['hiperparámetro', 'una configuración que eliges tú (no la aprende el modelo).'],
			['regla de 1 SE', 'entre modelos casi igual de buenos, quedarse con el más simple.'],
			['fuga de datos', 'hacer trampa sin querer: el modelo «ve» algo del examen antes de tiempo.'],
		],
	},
	'clasificacion/logistica': {
		frase: 'Regresión logística = en vez de predecir un número, predice la probabilidad de que algo sea «sí» (spam, enfermo, aprobado…).',
		analogia: 'Es como un termómetro de confianza: el modelo suma pistas a favor y en contra, y la sigmoide convierte esa suma en un porcentaje entre 0 % y 100 %.',
		llevate: [
			'La <b>sigmoide</b> es una curva en forma de S que aplasta cualquier número al rango 0–1.',
			'Si la probabilidad pasa de 0.5 (o el umbral que elijas), dices «sí».',
			'La <b>frontera de decisión</b> es la línea que separa la zona del «sí» de la del «no»; en logística es recta.',
		],
		palabras: [
			['odds', '«cuántas veces más probable es que sí a que no» (como en las apuestas: 3 a 1).'],
			['log-odds', 'el logaritmo de los odds; es lo que el modelo calcula como una suma simple.'],
			['umbral', 'el corte a partir del cual decides «sí».'],
			['frontera de decisión', 'la línea donde el modelo duda 50/50.'],
		],
	},
	'clasificacion/entrenamiento': {
		frase: 'Para entrenar la regresión logística castigamos mucho cuando el modelo está muy seguro y se equivoca; eso es la cross-entropy.',
		analogia: 'Un alumno que dice «estoy 100 % seguro» y falla merece más castigo que uno que dijo «no estoy seguro». La cross-entropy cobra según qué tan confiado estabas en la respuesta equivocada.',
		llevate: [
			'No se usa error al cuadrado porque con la sigmoide el problema se vuelve difícil (con muchos valles).',
			'La <b>cross-entropy</b> (log-loss) da una superficie en forma de tazón: el descenso de gradiente siempre encuentra el fondo.',
			'El gradiente final es muy simple: (predicción − real) × dato.',
		],
		palabras: [
			['cross-entropy / log-loss', 'medida de error que castiga la confianza equivocada.'],
			['verosimilitud', 'qué tan probable hace el modelo los datos que realmente vimos. Queremos que sea alta.'],
			['separable', 'cuando una línea puede separar perfecto las clases; ahí los pesos crecen sin fin si no regularizas.'],
		],
	},
	'clasificacion/softmax': {
		frase: 'Softmax = la versión de la logística para más de dos opciones: reparte el 100 % de probabilidad entre todas las clases.',
		analogia: 'Como una encuesta: cada candidato recibe un «puntaje de popularidad», y softmax los convierte en porcentajes que suman 100 %.',
		llevate: [
			'Cada clase tiene su propio puntaje; el más alto se lleva la mayor probabilidad.',
			'Con solo dos clases, softmax es exactamente la sigmoide.',
		],
		palabras: [
			['logit / score', 'el puntaje crudo de cada clase antes de convertirlo en probabilidad.'],
			['one-hot', 'escribir la clase correcta como [0, 1, 0]: un 1 en su lugar y 0 en el resto.'],
		],
	},
	'clasificacion/metricas': {
		frase: 'Acertar «en general» no basta: hay que mirar qué tipo de errores comete el modelo, porque no todos cuestan lo mismo.',
		analogia: 'Un detector de cáncer que dice «sano» a todos acierta el 99 % si casi nadie tiene cáncer… y es inútil. Por eso contamos por separado las falsas alarmas y los casos que se escaparon.',
		llevate: [
			'<b>Precision</b>: de los que marqué como positivos, ¿cuántos lo eran? (pocas falsas alarmas).',
			'<b>Recall</b>: de los positivos reales, ¿cuántos encontré? (que no se me escape ninguno).',
			'<b>F1</b> combina ambos; la <b>curva ROC</b> muestra qué pasa al mover el umbral.',
		],
		palabras: [
			['matriz de confusión', 'tabla de aciertos y errores: verdaderos/falsos positivos y negativos.'],
			['falso positivo', 'falsa alarma: dije «sí» y era «no».'],
			['falso negativo', 'se me escapó: dije «no» y era «sí».'],
			['AUC', 'el área bajo la curva ROC: 1 = perfecto, 0.5 = tirar una moneda.'],
		],
	},
	'generativos/bayes': {
		frase: 'Clasificar con Bayes = combinar «qué tan común es cada clase» con «qué tan típicos son estos datos en cada clase».',
		analogia: 'Escuchas un galope afuera. ¿Caballo o cebra? Las rayas no las ves, pero sabes que en tu ciudad hay muchísimos más caballos: esa información previa (el prior) pesa mucho en tu respuesta.',
		llevate: [
			'<b>Prior</b>: lo que creías antes de ver los datos (qué tan común es cada clase).',
			'<b>Verosimilitud</b>: qué tan esperables son los datos si fuera cada clase.',
			'<b>Posterior</b>: tu creencia actualizada. Eliges la clase con mayor posterior (eso es MAP).',
		],
		palabras: [
			['prior', 'la probabilidad «de entrada», antes de mirar el caso.'],
			['posterior', 'la probabilidad después de considerar la evidencia.'],
			['tasa base', 'qué tan frecuente es algo en la población; ignorarla es un error clásico.'],
			['generativo', 'modelo que aprende cómo «se ven» los datos de cada clase.'],
		],
	},
	'generativos/naive-bayes': {
		frase: 'Naive Bayes hace una simplificación «ingenua»: supone que cada dato aporta su pista por separado, sin influirse entre sí.',
		analogia: 'Para detectar spam, revisa palabra por palabra: «gratis» suma sospecha, «reunión» la resta… y junta todas las pistas como si fueran independientes. No es del todo cierto, pero funciona sorprendentemente bien.',
		llevate: [
			'Al suponer independencia, basta con contar cada característica por separado: muy rápido y necesita pocos datos.',
			'Se trabaja con <b>logaritmos</b> para no multiplicar miles de números diminutos (la computadora los redondearía a 0).',
			'<b>Suavizado de Laplace</b>: sumar 1 a todos los conteos para que una palabra nunca vista no anule todo.',
		],
		palabras: [
			['independencia condicional', 'dentro de cada clase, saber un dato no te dice nada de otro.'],
			['suavizado de Laplace', 'el «+1» a los conteos para evitar probabilidades cero.'],
			['log-espacio', 'sumar logaritmos en vez de multiplicar probabilidades.'],
		],
	},
	'generativos/lda-qda': {
		frase: 'LDA y QDA describen cada clase como una «nube» de puntos con forma de campana y asignan cada punto nuevo a la nube que mejor lo explique.',
		analogia: 'Imagina dos manchas de tinta en un papel. Para un punto nuevo, preguntas: ¿cae más «adentro» de la mancha azul o de la roja? LDA asume que ambas manchas tienen la misma forma; QDA deja que cada una tenga la suya.',
		llevate: [
			'<b>LDA</b>: misma forma de nube para todas las clases → frontera recta.',
			'<b>QDA</b>: cada clase con su forma → frontera curva (más flexible, necesita más datos).',
			'La <b>distancia de Mahalanobis</b> es una distancia «inteligente» que tiene en cuenta la forma de la nube.',
		],
		palabras: [
			['covarianza', 'cómo varían juntas dos variables (si una sube, ¿la otra también?). Define la forma de la nube.'],
			['gaussiana multivariada', 'la campana en varias dimensiones: una nube ovalada.'],
			['discriminante', 'el puntaje que dice qué tan bien encaja el punto en cada clase.'],
		],
	},
	'svm/geometria': {
		frase: 'SVM busca la línea que separa las clases dejando el «pasillo» más ancho posible entre ellas.',
		analogia: 'Quieres trazar una carretera entre dos pueblos sin tocar ninguna casa. De todas las posibles, eliges la que deja la mayor distancia libre a ambos lados: así hay más margen de error.',
		llevate: [
			'El <b>margen</b> es el ancho del pasillo vacío entre las clases. SVM lo hace lo más ancho posible.',
			'Solo importan los puntos que tocan el borde del pasillo: los <b>vectores de soporte</b>.',
			'Las etiquetas se escriben como +1 y −1 (no 1 y 0) porque simplifica las fórmulas.',
		],
		palabras: [
			['hiperplano', 'una «línea recta» en cualquier número de dimensiones (recta en 2D, plano en 3D…).'],
			['margen', 'la distancia desde la frontera hasta los puntos más cercanos.'],
			['vector de soporte', 'cada punto pegado al borde del pasillo; son los que «sostienen» la frontera.'],
			['margen duro', 'no se permite ningún error: todos los puntos fuera del pasillo.'],
		],
	},
	'svm/dual': {
		frase: 'El problema dual es otra forma de plantear el mismo SVM, en la que cada punto tiene un «precio» que dice cuánto empuja la frontera.',
		analogia: 'Imagina la frontera como una tabla y cada punto como una persona que puede empujarla. La mayoría ni la toca (precio 0); solo los que están pegados a ella empujan (precio positivo). Esos son los vectores de soporte.',
		llevate: [
			'Un <b>multiplicador de Lagrange</b> (α) es el «precio» de una regla: cuánto mejorarías si la aflojaras un poquito.',
			'<b>KKT</b> dice: si una regla no te estorba, su precio es 0; si te estorba, estás justo en el borde.',
			'El dual solo usa productos punto entre puntos → eso abre la puerta al truco del kernel.',
		],
		palabras: [
			['restricción', 'una regla que la solución debe cumplir («no cruzar esta pared»).'],
			['Lagrangiano', 'el objetivo más «multas» por romper las reglas, todo en una sola fórmula.'],
			['primal / dual', 'dos versiones del mismo problema: una busca la frontera, la otra los precios de cada punto.'],
			['holgura complementaria', 'o la regla está «floja» (precio 0) o está «apretada» (en el borde); nunca ambas cosas a medias.'],
		],
	},
	'svm/margen-suave': {
		frase: 'En la vida real las clases se mezclan, así que permitimos que algunos puntos se metan en el pasillo… pagando una multa.',
		analogia: 'Es como un estacionamiento: puedes pisar la línea, pero te ponen una multa proporcional a cuánto te pasaste. C decide qué tan cara es la multa.',
		llevate: [
			'<b>C grande</b>: multas caras → casi no se permiten errores → pasillo estrecho (riesgo de memorizar).',
			'<b>C chico</b>: multas baratas → pasillo ancho, tolera errores (modelo más simple).',
			'La <b>pérdida hinge</b>: 0 si estás bien clasificado y fuera del pasillo; si no, crece en línea recta.',
		],
		palabras: [
			['holgura (ξ)', 'cuánto se metió un punto en el pasillo o en el lado equivocado.'],
			['C', 'la perilla que dice cuánto castigar los errores.'],
			['pérdida hinge', 'la «multa» del SVM: cero si todo bien, y crece a medida que te equivocas.'],
		],
	},
	'kernels/truco': {
		frase: 'Si los datos no se pueden separar con una recta, los «levantamos» a más dimensiones donde sí se puede; el truco del kernel hace eso sin calcularlo de verdad.',
		analogia: 'Tienes monedas rojas en el centro de una mesa y azules alrededor: ninguna recta las separa. Pero si das un golpe y las rojas saltan, en el aire (3D) una hoja plana las separa. El kernel calcula «cómo se verían en el aire» sin hacerlas saltar.',
		llevate: [
			'Un <b>mapa de features</b> transforma cada punto en uno con más coordenadas (x → x, x², …).',
			'Un <b>kernel</b> es un atajo: da directamente la similitud entre dos puntos en ese espacio grande, sin construirlo.',
			'Funciona porque SVM (en su forma dual) solo necesita similitudes entre pares de puntos.',
		],
		palabras: [
			['kernel', 'una función que mide qué tan parecidos son dos puntos (en un espacio «escondido»).'],
			['mapa de features (φ)', 'la transformación que agrega dimensiones.'],
			['matriz de Gram', 'la tabla con la similitud de cada par de puntos.'],
			['semidefinida positiva', 'condición técnica para que una función sea un kernel válido (que se porte como una similitud «honesta»).'],
		],
	},
	'kernels/practica': {
		frase: 'En la práctica eliges un kernel (lineal, polinómico o RBF) y ajustas su perilla γ para controlar qué tan curva puede ser la frontera.',
		analogia: 'El kernel RBF es como poner un foco de luz sobre cada punto: γ grande = focos chiquitos y concentrados (frontera muy detallada, memoriza); γ chico = focos amplios (frontera suave).',
		llevate: [
			'<b>Lineal</b>: frontera recta. <b>Polinómico</b>: curvas de cierto grado. <b>RBF</b>: casi cualquier forma.',
			'<b>γ alto</b> → frontera muy ajustada (overfitting). <b>γ bajo</b> → frontera muy suave (underfitting).',
			'Siempre escala los datos antes y elige C y γ con validación cruzada.',
		],
		palabras: [
			['RBF / gaussiano', 'kernel que mide similitud según la distancia: cerca = parecido, lejos = nada que ver.'],
			['γ (gamma)', 'qué tan rápido «se apaga» la similitud con la distancia.'],
			['teorema del representante', 'la solución siempre se puede escribir como combinación de los puntos de entrenamiento.'],
			['kernel ridge', 'regresión ridge con el truco del kernel: curvas con fórmula directa.'],
		],
	},
	'arboles/impureza': {
		frase: 'Un árbol de decisión hace preguntas de sí/no sobre los datos, una tras otra, como el juego de «adivina quién».',
		analogia: '«¿Tiene más de 30 años? → sí. ¿Gana más de 2000? → no. Entonces: no le damos el préstamo.» Cada pregunta busca dejar los grupos lo más «puros» posible (todos de la misma clase).',
		llevate: [
			'Un grupo es <b>puro</b> si todos sus ejemplos son de la misma clase; <b>impuro</b> si está mezclado.',
			'<b>Gini</b> y <b>entropía</b> son dos formas de medir qué tan mezclado está un grupo.',
			'La mejor pregunta es la que más reduce la mezcla: eso es la <b>ganancia de información</b>.',
		],
		palabras: [
			['nodo / hoja', 'nodo = una pregunta; hoja = el final del camino, donde se da la respuesta.'],
			['split', 'dividir un grupo en dos según una pregunta.'],
			['impureza', 'qué tan mezclado está un grupo.'],
			['entropía', 'medida de «desorden» o sorpresa: 0 si todo es igual, máxima si está 50/50.'],
		],
	},
	'arboles/cart': {
		frase: 'CART es la receta para construir el árbol: en cada paso prueba todas las preguntas posibles y se queda con la que mejor separa.',
		analogia: 'Como ordenar un armario: primero separas por tipo de prenda (la división que más ordena), luego cada montón por color, y así… hasta que cada cajón queda ordenado o ya no vale la pena seguir.',
		llevate: [
			'Para cada variable solo hay que probar los cortes entre valores vecinos (no infinitos).',
			'Al árbol no le importa la escala de los datos, solo el orden: no hace falta escalar.',
			'Se para cuando el grupo es puro, muy pequeño o el árbol ya es muy profundo.',
		],
		palabras: [
			['umbral', 'el valor de corte de una pregunta («¿edad > 30?»).'],
			['codicioso (greedy)', 'elige la mejor pregunta ahora, sin pensar en las siguientes.'],
			['profundidad', 'cuántas preguntas seguidas puede hacer el árbol.'],
			['pre-poda', 'reglas para dejar de crecer antes (profundidad máxima, mínimo de ejemplos…).'],
		],
	},
	'arboles/poda': {
		frase: 'Un árbol que crece sin límite memoriza los datos; podarlo (cortarle ramas) lo hace más simple y mejor con datos nuevos.',
		analogia: 'Como podar una planta: le quitas las ramitas que no aportan para que crezca más sana. Cada rama cuesta algo, y solo se queda si mejora lo suficiente.',
		llevate: [
			'<b>Poda por costo-complejidad</b>: cada hoja tiene un «costo» α; se cortan las ramas que no compensan.',
			'α se elige con validación cruzada.',
			'Los árboles son <b>inestables</b>: un pequeño cambio en los datos puede cambiar todo el árbol. Por eso luego se combinan muchos (bosques).',
		],
		palabras: [
			['poda', 'quitar ramas del árbol para simplificarlo.'],
			['α (costo de complejidad)', 'la multa por cada hoja extra.'],
			['importancia de variables', 'cuánto ayudó cada variable a ordenar los datos en todo el árbol.'],
			['ensemble', 'combinar muchos modelos (por ejemplo, muchos árboles) para que se corrijan entre sí.'],
		],
	},
};

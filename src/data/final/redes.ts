// Datos de la unidad «redes» (parte final). Se integran en ensimple.ts, jerga.ts y glosario.ts.
import type { EnSimple } from '../ensimple';
import type { Termino } from '../glosario';
import type { Card } from '../../components/Flashcards';

export const ENSIMPLE_REDES: Record<string, EnSimple> = {
  'redes/neurona': { frase: 'Una neurona mezcla datos con pesos, suma un punto de partida y transforma el resultado.', analogia: 'Como decidir si alcanza el dinero en la caja: multiplicas el precio por cada cantidad, sumas un descuento fijo y comparas con el presupuesto.', llevate: ['Una neurona con dos entradas traza una frontera recta.', 'XOR pide separar esquinas alternadas: ninguna recta lo consigue.', 'Sumar neuronas independientes sin mezclarlas tampoco arregla XOR.'], palabras: [['peso', 'influencia de una entrada'], ['sesgo', 'valor añadido aunque las entradas sean cero'], ['activación', 'función que transforma la suma'], ['sigmoide', 'curva que convierte un número en probabilidad entre cero y uno'], ['score', 'número previo a la decisión'], ['frontera', 'línea donde cambia la decisión'], ['XOR', 'sí cuando dos entradas son distintas'], ['XNOR', 'sí cuando las entradas son iguales'], ['tocón', 'árbol de una sola pregunta'], ['interacción', 'efecto de combinar dos entradas'], ['boosting', 'suma de modelos entrenados por turnos']] },
  'redes/capas': { frase: 'Una capa oculta transforma los puntos para que una salida sencilla separe lo que antes era imposible.', analogia: 'Como doblar una hoja de papel antes de hacer un solo corte: las partes separadas en la hoja extendida quedan juntas al doblarla.', llevate: ['OR y NAND, seguidas de AND, resuelven XOR.', 'ReLU conserva lo positivo y pone lo negativo en cero.', 'Sin activaciones, muchas capas equivalen a una transformación lineal.'], palabras: [['capa oculta', 'etapa intermedia que crea características'], ['OR', 'se activa si alguna entrada vale uno'], ['NAND', 'se apaga solo si ambas entradas valen uno'], ['AND', 'se activa si ambas entradas valen uno'], ['ReLU', 'máximo entre cero y la entrada'], ['escalón', 'función que salta de cero a uno'], ['parámetro', 'peso o sesgo que la red ajusta'], ['profundidad', 'número de etapas sucesivas'], ['ancho', 'unidades dentro de una capa'], ['aproximación universal', 'capacidad de aproximar funciones continuas con suficiente ancho; no garantiza aprenderlas']] },
  'redes/backprop': { frase: 'La red calcula su error y reparte hacia atrás cuánto contribuyó cada peso.', analogia: 'Si un recibo total está mal, revisas primero el total, luego cada subtotal y por último cada precio que lo compone.', llevate: ['La salida y la pérdida dependen de la tarea.', 'Con pérdida cuadrática, la señal inicial es predicho menos real.', 'La regla de la cadena reutiliza cálculos para hallar todos los gradientes.'], palabras: [['pérdida', 'costo de una predicción'], ['forward', 'cálculo desde entrada a salida'], ['backpropagation', 'derivadas desde salida hacia entradas'], ['gradiente', 'cambio del costo al mover un peso'], ['cabeza', 'transformación final elegida para la tarea'], ['logit', 'score antes de convertirlo en probabilidad'], ['softmax', 'convierte varios scores en probabilidades que suman uno'], ['entropía cruzada', 'penaliza asignar poca probabilidad a la respuesta real'], ['delta', 'señal de error de una unidad'], ['época', 'una pasada sobre los datos de entrenamiento']] },
  'redes/tasa-aprendizaje': { frase: 'La tasa decide cuánto cambian los pesos después de medir el error.', analogia: 'Al bajar una escalera hacia una puerta, pasos de medio escalón avanzan lento y saltos de tres escalones pueden pasarse de la puerta.', llevate: ['En una parábola de curvatura c, la tasa ideal es 1/c.', 'En 2/c se oscila para siempre; por encima se diverge.', 'Con dos curvaturas, una tasa debe servir a ambas.'], palabras: [['tasa de aprendizaje', 'tamaño del paso'], ['gradiente', 'pendiente de la pérdida'], ['curvatura', 'rapidez con que cambia la pendiente'], ['Hessiana', 'matriz de curvaturas de varias variables'], ['autovector', 'dirección que una matriz no gira'], ['autovalor', 'factor con que la matriz escala esa dirección'], ['condicionamiento', 'desigualdad entre curvaturas'], ['número de condición', 'mayor curvatura dividida entre la menor'], ['divergencia', 'error que crece al entrenar']] },
  'redes/optimizadores': { frase: 'Un optimizador convierte gradientes en pasos; puede recordar el pasado o adaptar cada peso.', analogia: 'Al empujar un carrito por un pasillo, los empujones repetidos en una dirección lo aceleran; los empujones opuestos se cancelan.', llevate: ['Momentum suma gradientes recientes.', 'Adam promedia gradientes y sus cuadrados, corrigiendo el inicio.', 'Mini-batches dan pasos frecuentes pero ruidosos.'], palabras: [['optimizador', 'regla para actualizar pesos'], ['momentum', 'memoria de gradientes'], ['Adam', 'paso adaptativo por peso'], ['corrección de sesgo', 'compensa que los promedios parten de cero'], ['batch', 'grupo de ejemplos usado en un paso'], ['mini-batch', 'grupo pequeño por actualización'], ['SGD', 'un ejemplo por paso'], ['época', 'una pasada por todos los ejemplos'], ['gradiente', 'pendiente de la pérdida']] },
  'redes/entrenar-bien': { frase: 'Entrenar bien exige empezar con pesos distintos y adecuados, y frenar la memorización.', analogia: 'Si varios cocineros copian exactamente la misma receta, todos cometen el mismo error; pruebas con platos nuevos indican cuándo dejar de ajustar la receta.', llevate: ['Pesos iguales producen unidades iguales.', 'He preserva la escala con ReLU; Glorot es una referencia para tanh.', 'Validación, weight decay y dropout limitan el sobreajuste.'], palabras: [['simetría', 'unidades que producen y aprenden exactamente lo mismo'], ['inicialización He', 'pesos aleatorios con varianza 2/n para ReLU'], ['Glorot', 'escala de pesos que equilibra entrada y salida'], ['estandarizar', 'restar media y dividir entre desviación'], ['weight decay', 'encoger pesos en cada paso'], ['early stopping', 'parar cuando validación deja de mejorar'], ['dropout', 'apagar unidades al azar al entrenar'], ['AdamW', 'Adam con decaimiento separado del gradiente'], ['CNN', 'red que comparte filtros locales'], ['RNN', 'red que reutiliza estado en secuencias'], ['atención', 'promedio de información de otras posiciones según su relevancia'], ['normalización', 'ajuste de escala de activaciones'], ['sobreajuste', 'aprender detalles del entrenamiento que no se repiten']] },
};

export const JERGA_REDES: [string[], string][] = [
  [['neurona', 'unidad'], 'Suma ponderada, sesgo y activación.'], [['peso', 'weight'], 'Influencia de una entrada.'],
  [['sesgo', 'bias'], 'Constante que desplaza la respuesta.'], [['activación', 'activation'], 'Función que dobla la suma.'],
  [['capa oculta', 'hidden layer'], 'Etapa intermedia.'], [['ReLU'], 'max(0,z).'],
  [['backpropagation', 'retropropagación'], 'Regla de la cadena hacia atrás.'], [['tasa de aprendizaje', 'learning rate'], 'Tamaño del paso.'],
  [['momentum'], 'Suma amortiguada de gradientes.'], [['Adam'], 'Paso adaptativo por parámetro.'],
  [['mini-batch'], 'Grupo de ejemplos por paso.'], [['weight decay'], 'Encogimiento de pesos.'],
  [['early stopping'], 'Parada por validación.'], [['dropout'], 'Apagado aleatorio de unidades.'],
];

const term = (en: string, es: string, def: string, page: string, t: string): Termino => ({ en, es, def, t, href: `/redes/${page}/` });
export const GLOSARIO_REDES: Termino[] = [
  term('artificial neuron','neurona artificial','Suma ponderada, sesgo y activación.','neurona','Redes neuronales I'),
  term('weight','peso','Coeficiente de una entrada.','neurona','Redes neuronales I'),
  term('bias','sesgo','Constante que desplaza la respuesta.','neurona','Redes neuronales I'),
  term('activation function','función de activación','Transformación no lineal.','capas','Redes neuronales I'),
  term('hidden layer','capa oculta','Etapa intermedia que crea nuevas características.','capas','Redes neuronales I'),
  term('ReLU','unidad rectificada','max(0,z).','capas','Redes neuronales I'),
  term('forward pass','pasada hacia delante','Evaluar la red desde entradas a salida.','backprop','Redes neuronales I'),
  term('backpropagation','retropropagación','Gradientes mediante regla de la cadena en sentido inverso.','backprop','Redes neuronales I'),
  term('output head','cabeza de salida','Transformación final apropiada a la tarea.','backprop','Redes neuronales I'),
  term('XOR','o exclusivo','Etiqueta 1 cuando las dos entradas binarias difieren.','neurona','Redes neuronales I'),
  term('learning rate','tasa de aprendizaje','Factor η del gradiente.','tasa-aprendizaje','Redes neuronales II'),
  term('condition number','número de condición','Razón entre mayor y menor curvatura.','tasa-aprendizaje','Redes neuronales II'),
  term('momentum','momento','Suma amortiguada de gradientes.','optimizadores','Redes neuronales II'),
  term('Adam','Adam','Promedios adaptativos y corregidos por sesgo.','optimizadores','Redes neuronales II'),
  term('mini-batch','mini-lote','Subconjunto de ejemplos para un gradiente.','optimizadores','Redes neuronales II'),
  term('He initialization','inicialización He','Varianza 2/n para ReLU.','entrenar-bien','Redes neuronales II'),
  term('Glorot initialization','inicialización Glorot','Escala adaptada al ancho de entrada y salida.','entrenar-bien','Redes neuronales II'),
  term('weight decay','decaimiento de pesos','Encoger pesos en cada paso.','entrenar-bien','Redes neuronales II'),
  term('early stopping','parada temprana','Conservar la época de mejor validación.','entrenar-bien','Redes neuronales II'),
  term('dropout','apagado aleatorio','Anular unidades al azar al entrenar.','entrenar-bien','Redes neuronales II'),
  term('AdamW','AdamW','Adam con decaimiento desacoplado.','entrenar-bien','Redes neuronales II'),
];

export const FLASH_REDES: Card[] = [
  {t:'Redes neuronales I',f:'¿Qué hace una neurona?',b:'Multiplica entradas por pesos, suma sesgo y aplica activación.'},
  {t:'Redes neuronales I',f:'¿Frontera de una neurona con dos entradas?',b:'Una recta: w₁x₁+w₂x₂+b=0.'},
  {t:'Redes neuronales I',f:'¿Máximo de una neurona en XOR?',b:'3 de 4 esquinas.'},
  {t:'Redes neuronales I',f:'¿Identidad que impide XOR lineal?',b:'f(0,0)+f(1,1)=f(0,1)+f(1,0).'},
  {t:'Redes neuronales I',f:'¿Cómo resuelve XOR la red A?',b:'(OR) AND (NAND).'},
  {t:'Redes neuronales I',f:'ReLU(-2), ReLU(3)',b:'0 y 3.'},
  {t:'Redes neuronales I',f:'¿Por qué activar entre capas?',b:'Sin activación, todo colapsa en una función afín.'},
  {t:'Redes neuronales I',f:'Softmax de (ln 4, ln 2, 0)',b:'(4/7, 2/7, 1/7).'},
  {t:'Redes neuronales I',f:'Gradiente inicial de ½(ŷ−y)²',b:'ŷ−y.'},
  {t:'Redes neuronales I',f:'¿Qué hace backprop?',b:'Calcula todos los gradientes reutilizando la regla de la cadena.'},
  {t:'Redes neuronales I',f:'¿Qué NO promete aproximación universal?',b:'No garantiza encontrar la red ni generalizar.'},
  {t:'Redes neuronales I',f:'¿Por qué falla iniciar todo en cero?',b:'Las unidades siguen siendo idénticas.'},
  {t:'Redes neuronales II',f:'Para L=½cw², ¿η ideal?',b:'1/c.'},
  {t:'Redes neuronales II',f:'¿Qué ocurre en η=2/c?',b:'Oscila con magnitud constante.'},
  {t:'Redes neuronales II',f:'Curvaturas 1 y 100: ¿η compromiso?',b:'2/101 ≈ 0.0198.'},
  {t:'Redes neuronales II',f:'Momentum β=0.9, gradiente 1: ¿límite?',b:'10.'},
  {t:'Redes neuronales II',f:'¿Por qué Adam corrige sesgo?',b:'Sus promedios arrancan en cero.'},
  {t:'Redes neuronales II',f:'¿Por qué mini-batches?',b:'Pasos frecuentes y menos ruidosos que SGD puro.'},
  {t:'Redes neuronales II',f:'¿Varianza He para n entradas?',b:'2/n.'},
  {t:'Redes neuronales II',f:'Dropout invertido con probabilidad p de conservar',b:'Entrena: 0 o a/p. Evalúa: a.'},
  {t:'Redes neuronales II',f:'¿Qué distingue AdamW?',b:'Decaimiento fuera de la normalización adaptativa.'},
  {t:'Redes neuronales II',f:'¿Qué guarda early stopping?',b:'Pesos de la mejor época de validación.'},
  {t:'Redes neuronales II',f:'¿Qué estadísticas usa StandardScaler?',b:'Media y desviación calculadas solo en train.'},
  {t:'Redes neuronales II',f:'Si train mejora y validación empeora, ¿qué sospechar?',b:'Sobreajuste; considerar red menor, weight decay, early stopping o dropout.'},
];

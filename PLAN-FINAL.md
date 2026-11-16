# Plan · Parte final de CS3061 (Machine Learning)

La web ya cubre todo el **parcial** (unidades 0–7: fundamentos → árboles). El final agrega 6 lecciones del profesor Hurtado
(PDFs en `lessons/final/`, texto extraído en `.material/*.txt`) y 9 notebooks nuevos del repo del curso
(`.material/session-09…11*.md`, `.material/03-neural-networks-…md`, `.material/01-comparing-classifiers.md`).
Árboles de decisión aparece en ambos PDFs (mismo archivo): ya está en la web (`arboles/*`) y es **prerrequisito** de ensambles.

## Principio pedagógico (obligatorio en cada página)

El estudiante debe poder entender **desde el primer capítulo** sin saber nada de antemano. Cada página sigue la escalera
**simple → puente → complejo**:

1. `<EnSimple id="unidad/pagina" />` al inicio (texto en `src/data/final/<unidad>.ts`): una frase, una analogía cotidiana,
   3 «llévate», y la traducción de cada palabra técnica de la página.
2. **«Empieza aquí»**: el ejemplo pequeño de la slide (los 8 alquileres, los 10 puntos, las 4 esquinas del XOR, DigitReader…)
   resuelto **a mano** con números concretos y una figura SVG.
3. **Puente**: «lo que acabas de hacer a mano se llama…» → recién ahí el nombre técnico y la notación.
4. **Versión completa**: fórmulas con KaTeX, derivaciones con `<Pasos>` (cada paso justificado), casos límite, trampas de examen
   (`:::caution`), y bloques «Ir más a fondo (opcional)» como en las slides («Going deeper»).
5. Cierre: código scikit-learn/NumPy **verificado ejecutándolo** (usa los números de los notebooks), `<CasoUso>`, `<Quiz>`
   (6–8 preguntas, mezcla de concepto y cálculo), `<Conexiones>` con unidades del parcial, `<Recursos>` y `<Fuente>`.

Lenguaje: español claro, frases cortas, una idea por párrafo; términos en inglés en cursiva la primera vez con su traducción.
Mezcla lo simple y lo complejo: nunca una fórmula sin antes decir qué mide en palabras, nunca una intuición sin luego dar la versión exacta.
Usa las **convenciones y números del material** (ej.: WCSS 138 → 40.8 → 17.76 → 10; ARI = 0.17; 7/10 voters → 0.784; 274,625 neuronas probadas;
η óptimo = 1/c, borde 2/c; PSI…). Si un número es propio (no del material) márcalo «ejemplo propio».
Nunca menciones WSL, rutas locales ni usuarios: cita los archivos por su nombre de curso (`session-10-simple-a-…ipynb`, `ML_Course_Clustering.pdf`).

## Mapa de unidades nuevas (orden de estudio lineal)

| # | Unidad (carpeta) | Páginas (slug) | Fuente | Prerrequisitos del parcial |
|---|---|---|---|---|
| 8 | Ensambles (`ensambles/`) | `equipos` · ¿Por qué gana el equipo? (Galton, sesgo/varianza como dardos, 3 votantes, errores independientes, promediar baja la varianza σ²/n, no arregla el sesgo) <br> `bagging` · Bootstrap, bagging, out-of-bag (~36.8 %), random forest (max_features, «banca a la estrella»), importancia de variables <br> `boosting` · AdaBoost a mano (pesos, α), gradient boosting sobre residuos, learning rate y early stopping, voting y stacking, bagging vs boosting, cuál usar | Ensemble_Methods.pdf, session-09 a/b/c | árboles, sesgo–varianza, CV |
| 9 | Clustering (`clustering/`) | `kmeans` · Sin etiquetas; qué es un buen grupo; k-means a mano (8 alquileres), WCSS nunca sube, cuantización de color, mínimos locales, restarts y k-means++, ARI <br> `cuantos-grupos` · Supuestos de k-means, unidades y estandarización (cm vs mm), codo, silhouette a mano, wine, «el clustering siempre responde» <br> `otras-formas` · Duro vs blando, GMM y EM (pertenencia blanda a mano: 0.62), iris; DBSCAN (ε, minPts, ruido), jerárquico y linkage, espectral, qué método usar cuándo | Clustering.pdf, session-10 a/b/c | distancias, gaussianas (LDA/QDA), escalado |
| 10 | Reducción de dimensionalidad (`reduccion/`) | `por-que` · Comprimir columnas (no filas), maldición de la dimensionalidad (volumen esfera/cubo, distancias que se aplanan), features que no aportan <br> `pca` · Dirección de máxima varianza, autovectores/autovalores (geometría y ecuación característica), covarianza, derivación de PCA en 3 pasos, receta, proyectar y reconstruir, estandarizar <br> `svd-componentes` · SVD (rotar-escalar-rotar), SVD = PCA, mejor aproximación de rango k, scree plot y varianza explicada, usos (visualizar, comprimir dígitos, acelerar, clustering) <br> `lda-fa-nmf` · PCA ignora y; LDA de Fisher (S_W, S_B, ≤ K−1 direcciones), análisis factorial, NMF (partes vs holístico) <br> `tsne-umap` · Límite lineal y manifolds, t-SNE (perplejidad, Student-t, crowding, KL), cómo NO leer un mapa t-SNE, UMAP (n_neighbors, min_dist), kernel PCA, ICA | Dimensionality_Reduction.pdf, session-11a/11b | álgebra lineal (fundamentos/matematicas), LDA generativo, kernels |
| 11 | Redes neuronales I (`redes/`) | `neurona` · Multiplicar-sumar-doblar, una neurona = una recta, el muro del XOR (prueba de las diagonales, 274,625 neuronas), modelos aditivos (boosting de stumps) también fallan <br> `capas` · Compuertas OR/NAND/AND = red A, la capa oculta mueve los puntos, ReLU y red B en enteros, «mezclar y doblar», sin activación todo colapsa a lineal, profundidad multiplica, aproximación universal (qué promete y qué no) <br> `backprop` · Cabezas y pérdidas (regresión/binaria/multiclase), «predicho menos real», backpropagation a mano en la red B, por qué es barato, inicios que fallan | Neural_Networks_I.pdf, practical/03 | logística, softmax, gradiente |
| 12 | Redes neuronales II (`redes/`) | `tasa-aprendizaje` · L(w)=w², 7 tasas a mano, η óptimo 1/c y borde 2/c, condicionamiento (dos curvaturas, compromiso 2/(c_min+c_max)) <br> `optimizadores` · Momentum (suma corriente, 1/(1−β)), Adam (paso por peso, corrección de sesgo), batch vs mini-batch vs SGD (ruido), carrera justa <br> `entrenar-bien` · Por qué no iniciar en cero, escala de inicialización (Glorot/He), estandarizar entradas, weight decay, early stopping, dropout, AdamW, CNN/RNN/atención/normalización en una frase, receta y qué hacer cuando falla | Neural_Networks_II.pdf, practical/03 | descenso de gradiente, ridge, CV |
| 13 | MLOps (`mlops/`) | `reproducibilidad` · DigitReader, «la mayor parte de un sistema ML no es ML», 6 cosas de las que está hecho un modelo, orden de la suma en float, semilla vs datos, huella SHA-256, tracking (MLflow), pipeline nivel 0/1/2 <br> `despliegue` · Training-serving skew (bug de unidades 0..255 vs 0..16), un solo camino de código + esquema, release gate a mano (¿+5 es real?), batch/online/edge, costo de servir, shadow/canary/blue-green/A-B, tamaño del canary, rollback <br> `monitoreo` · Fallas silenciosas, 3 tipos de shift (covariate, label/prior, concept), etiquetas tardías, PSI a mano, detector «¿hoy vs pasado?» (AUC), confianza, cuántas etiquetas para reentrenar, feedback loops, model card, lineage, checklist | MLOps.pdf | métricas, CV, split train/test |

Integración que hace Claude (no Codex): sidebar en `astro.config.mjs` (grupo «Final» arriba, «Parcial» colapsado),
landing `final/index.mdx` (ruta, prerrequisitos, progreso), `index.mdx`, `scripts/build-pool.py` (unidades nuevas),
resúmenes por unidad, flashcards (desde `FLASH_*`), README y build/QA.

## Reglas técnicas para Codex

- Lee `README.md` (convenciones MDX), y usa como plantilla `src/content/docs/arboles/impureza.mdx` y `arboles/poda.mdx`.
- Componentes disponibles: `EnSimple`, `Pasos`, `CasoUso`, `Quiz` (client:visible, `id` único), `Solucion`, `Conexiones`, `Recursos`
  (enlaces en `src/data/recursos.ts`: puedes **agregar** claves nuevas al final con URLs reales y conocidas), `Fuente`, `ui/Plot.tsx`, `ui/Tex.tsx`, `ui/math.ts`.
- **Solo escribe tus archivos**: `src/content/docs/<tu-unidad>/*.mdx`, `src/components/sim/<Nuevo>.tsx`, `src/components/diagrams/<Nuevo>.astro`,
  `src/data/final/<tu-unidad>.ts` (ENSIMPLE_*, JERGA_*, GLOSARIO_*, FLASH_*). En `src/data/recursos.ts` solo agrega claves con prefijo de tu unidad.
  No toques `astro.config.mjs`, `ensimple.ts`, `jerga.ts`, `glosario.ts`, ni páginas de otras unidades (otros agentes trabajan en paralelo).
- Cada página de concepto lleva al menos **una figura SVG** inline o en `diagrams/*.astro` (con pie «Cómo leerlo»), y cada unidad al menos
  **2 simuladores React** (interactivos, sin dependencias nuevas; si usan aleatoriedad en float: documentar `client:only="react"`).
- MDX: `\\` en LaTeX dentro de props JSX; no `|` dentro de `$…$` en tablas (usa `\lvert … \rvert` o `\mid`); frontmatter con `:` entre comillas.
- `<EnSimple id>` debe existir en tu `ENSIMPLE_*` (si no, el build falla).
- Verifica cada snippet de Python ejecutándolo (`python` con scikit-learn 1.9 está instalado) y usa en el texto la salida real.
- No puedes correr `astro build` en el sandbox; Claude compila y revisa al final. Revisa tú la sintaxis TSX/MDX con cuidado.

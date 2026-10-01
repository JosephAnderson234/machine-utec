# CS3061 · Machine Learning — web de estudio (Parte 1)

Web interactiva para repasar la primera parte de Machine Learning (UTEC 2026-II): regresión lineal, regularización, logística y métricas, modelos generativos, SVM, kernels y árboles de decisión.

- **32 páginas** en español: teoría con derivaciones paso a paso (`<Pasos>`), casos de uso reales (`<CasoUso>`), código de scikit-learn/NumPy verificado, quizzes y tarjetas de «conexiones» entre temas.
- **38 simuladores y calculadoras** en React que corren en el navegador (SVM con SMO, CART paso a paso, calculadoras de ecuaciones normales y de métricas, curvas generativo vs discriminativo, bagging de árboles, prueba PSD de kernels…).
- **Guía «¿qué modelo uso?»** interactiva y **5 casos de estudio** de principio a fin.
- **Modo examen cronometrado** (preguntas al azar de toda la web, nota vigesimal, diagnóstico por tema), **generador de ejercicios** (11 tipos con números aleatorios y solución paso a paso) y **glosario inglés ↔ español** (~120 términos).
- **Práctica:** laboratorio de Python en el navegador (Pyodide: 10 celdas con NumPy/scikit-learn verificadas), guía de los 22 notebooks del curso, resúmenes de una página por unidad en PDF, «explícalo con tus palabras» (28 preguntas abiertas) y flashcards con repaso espaciado (Leitner).
- **Mapa conceptual** clicable, formulario imprimible, banco de preguntas oficial (31) como quiz, simulacro y 67 flashcards.
- Material web externo verificado (MLU-Explain, StatQuest, ISLR, CS229, scikit-learn…).

## Stack

Astro 7 + Starlight, islas de React, KaTeX (remark-math/rehype-katex), GSAP para animaciones. Mismo scaffold que `so/web-parcial`.

## Comandos

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # genera dist/
pnpm preview
```

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `src/content/docs/` | páginas `.mdx` (una carpeta por unidad) |
| `src/components/sim/` | simuladores React |
| `src/components/diagrams/` | diagramas SVG estáticos (`.astro`) |
| `src/components/ui/` | `Plot`, `math`, `svm` (SMO), `Tex`, `Rich`, `storage` |
| `src/data/recursos.ts` | registro central de enlaces externos |
| `src/components/Pasos.astro` / `CasoUso.astro` | derivación revelada paso a paso (lista ordenada en Markdown) / tarjeta de caso de uso |
| `src/data/pool.ts` | banco del modo examen, **generado** por `scripts/build-pool.py` desde los `<Quiz>` de las páginas |
| `src/data/glosario.ts` | términos del glosario |
| `scripts/patch.py` | inserta bloques en páginas por ancla |
| `scripts/fix-table-math.py` | reescribe `\|` dentro de `$…$` en tablas (GFM las toma como separadores) |

## Notas al editar

- Contenido generado por scripts (editar la fuente y regenerar):
  - `python scripts/build-lab.py` → `laboratorio.mdx` (desde `scripts/lab_snippets.py`; prueba el código con Python antes).
  - `python scripts/build-resumenes.py` → `resumenes/*.mdx`. Los PDF de `public/pdf/` se regeneran imprimiendo esas páginas (A4, márgenes 12 mm).

- Si editas o agregas quizzes, corre `python scripts/build-pool.py` para actualizar el banco del modo examen (`src/data/pool.ts` se versiona, así Vercel no necesita Python).

- En props JSX de MDX (quizzes, flashcards) las barras invertidas de LaTeX van dobles: `'$\\sigma(z)$'`.
- No uses `|` dentro de fórmulas en tablas: corre `python scripts/fix-table-math.py` antes de compilar.
- Pon entre comillas los `title`/`description` del frontmatter si contienen `:`.
- Simuladores con muestras aleatorias en coma flotante (`GaussianClassifier`, `KernelTrick`, `SoftMarginSVM`) se montan con `client:only="react"` para evitar desajustes de hidratación.

## Despliegue

Pensado para Vercel (proyecto estático de Astro, sin configuración extra).

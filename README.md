# CS3061 · Machine Learning — web de estudio (Parte 1)

Web interactiva para repasar la primera parte de Machine Learning (UTEC 2026-II): regresión lineal, regularización, logística y métricas, modelos generativos, SVM, kernels y árboles de decisión.

- **30 páginas** de teoría en español, con derivaciones, ejercicios resueltos, quizzes y tarjetas de «conexiones» entre temas.
- **23 simuladores** en React que corren en el navegador (incluye un SVM resuelto con SMO y CART paso a paso).
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
| `scripts/fix-table-math.py` | reescribe `\|` dentro de `$…$` en tablas (GFM las toma como separadores) |

## Notas al editar

- En props JSX de MDX (quizzes, flashcards) las barras invertidas de LaTeX van dobles: `'$\\sigma(z)$'`.
- No uses `|` dentro de fórmulas en tablas: corre `python scripts/fix-table-math.py` antes de compilar.
- Pon entre comillas los `title`/`description` del frontmatter si contienen `:`.
- Simuladores con muestras aleatorias en coma flotante (`GaussianClassifier`, `KernelTrick`, `SoftMarginSVM`) se montan con `client:only="react"` para evitar desajustes de hidratación.

## Despliegue

Pensado para Vercel (proyecto estático de Astro, sin configuración extra).

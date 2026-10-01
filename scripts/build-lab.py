"""Genera src/content/docs/laboratorio.mdx a partir de scripts/lab_snippets.py (código ya probado).

Uso: python scripts/build-lab.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'scripts' / 'lab_snippets.py').read_text(encoding='utf-8')
parts = re.split(r'^# === (\w+)\n', src, flags=re.M)
code = {name: body.strip() for name, body in zip(parts[1::2], parts[2::2])}

META = [
    ('normal', 'Ecuaciones normales con NumPy', ['numpy'], '/regresion/modelo/',
     'Construye la matriz de diseño, resuelve $\\mathbf{X}^\\top\\mathbf{X}\\mathbf{w}=\\mathbf{X}^\\top\\mathbf{y}$ y comprueba que el residual es ortogonal a las columnas.',
     'Fíjate en que $\\mathbf{X}^\\top\\mathbf{r}$ sale $(0,0)$ (salvo redondeo): esa **es** la condición de las ecuaciones normales.'),
    ('gd', 'Descenso de gradiente y la tasa de aprendizaje', ['numpy'], '/regresion/gradiente/',
     'El mismo problema resuelto iterando, con cuatro valores de $\\eta$.',
     'Con $\\eta = 0.01$ todavía no llegó; con 0.1 y 0.5 coincide con la solución exacta; con 1.1 **diverge** (números gigantes).'),
    ('poly', 'Grado del polinomio, train vs validación', ['numpy', 'scikit-learn'], '/regularizacion/sesgo-varianza/',
     'Ajusta polinomios de grado creciente a $\\sin(2\\pi x)$ + ruido y compara el error de entrenamiento con el de validación.',
     'El RMSE de train baja casi siempre; el de validación hace la **U** (mínimo cerca del grado 5). Ridge rescata al grado 12.'),
    ('ridgelasso', 'Ridge y lasso en el dataset diabetes', ['numpy', 'scikit-learn'], '/regularizacion/ridge-lasso/',
     'El ejemplo de la slide: OLS, ridge y lasso con λ elegido por validación cruzada.',
     'Los tres tienen RMSE de test ≈ 56 (como en la slide), pero el lasso pone **exactamente en cero** `age`, `s4` y `s6`.'),
    ('logistica', 'Regresión logística desde cero y el umbral', ['numpy', 'scikit-learn'], '/clasificacion/metricas/',
     'Entrena la logística con el gradiente $\\mathbf{X}^\\top(\\mathbf{p}-\\mathbf{y})/n$, compárala con scikit-learn y mueve el umbral.',
     'Tu implementación y la de scikit-learn llegan al mismo AUC (≈ 0.995). Bajar el umbral a 0.2 sube el recall de malignos a costa de más falsos positivos.'),
    ('nb', 'Naive Bayes para spam', ['numpy', 'scikit-learn'], '/generativos/naive-bayes/',
     'Un mini corpus de 10 correos, bolsa de palabras y Naive Bayes multinomial con dos valores de suavizado.',
     'Con $\\alpha$ pequeño las probabilidades se vuelven extremas (0.999, 0.0): sin suavizado, una palabra nunca vista en una clase la anula.'),
    ('ldaqda', 'LDA vs QDA vs Naive Bayes vs logística', ['numpy', 'scikit-learn'], '/generativos/lda-qda/',
     'Una clase compacta rodeada por otra ancha e inclinada: covarianzas muy distintas.',
     'Los modelos con frontera **lineal** (LDA, logística) se quedan en ≈ 0.69; QDA y Naive Bayes, que permiten covarianzas propias, llegan a ≈ 0.87.'),
    ('svm', 'Dentro del SVM: vectores de soporte y C', ['numpy', 'scikit-learn'], '/svm/dual/',
     'El ejemplo de tres puntos de la clase y un barrido de C en cáncer de mama.',
     'El punto (3,3) no es vector de soporte; $\\alpha y = (-1, 0.5, 0.5)$ y $\\mathbf{w}=(1,1)$, $b=-1$. Al subir C bajan los vectores de soporte (margen más angosto).'),
    ('kernels', 'Kernels: identidad, validez y γ', ['numpy', 'scikit-learn'], '/kernels/practica/',
     'Verifica $\\phi(\\mathbf{x})^\\top\\phi(\\mathbf{z}) = (1+\\mathbf{x}^\\top\\mathbf{z})^2$, la semidefinitud de una Gram RBF y el efecto del kernel sobre anillos.',
     'El lineal no sirve en anillos (≈ 0.56); el polinómico de grado 2 y el RBF con γ = 1 aciertan todo. Con γ = 2000: train 1.0 pero CV ≈ 0.72, **sobreajuste**.'),
    ('arbol', 'El árbol de 10 puntos y su ruta de poda', ['numpy', 'scikit-learn'], '/arboles/poda/',
     'Reproduce el árbol de la clase, sus importancias y la ruta de costo-complejidad.',
     'Mismo árbol que en las slides, importancias 3/7 y 4/7, y la ruta $\\alpha = 0,\\ 2/15,\\ 16/105,\\ 3/14$ con 4 → 3 → 2 → 1 hojas.'),
]


def esc(s: str) -> str:
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


out = [
    '---',
    'title: "Laboratorio de Python en el navegador"',
    'description: "Diez ejercicios ejecutables (NumPy y scikit-learn) que reproducen los resultados de las slides: ecuaciones normales, gradiente, ridge/lasso, logística, Naive Bayes, LDA/QDA, SVM, kernels y árboles."',
    '---',
    '',
    "import PyRunner from '../../components/sim/PyRunner.tsx';",
    '',
    'Cada celda es **Python real** que corre en tu navegador gracias a [Pyodide](https://pyodide.org) (no hace falta instalar nada). La primera ejecución descarga el intérprete y las librerías (≈ 10–30 MB); después todo es instantáneo y las celdas comparten la misma sesión.',
    '',
    ':::tip[Cómo aprovecharlo]',
    '1. Ejecuta la celda tal cual (botón o **Ctrl + Enter**) y compara la salida con lo que dice «Qué observar».',
    '2. Haz el **«TU TURNO»** del final del código: cambia un número, vuelve a ejecutar e interpreta.',
    '3. Si rompes algo, «Restaurar código» vuelve al original.',
    ':::',
    '',
    ':::note[Verificado]',
    'Todas las celdas se probaron con NumPy y scikit-learn reales antes de publicarlas; los números coinciden con los de las slides donde corresponde (diabetes, árbol de 10 puntos, SVM de tres puntos).',
    ':::',
    '',
]
for i, (k, titulo, pk, href, intro, observar) in enumerate(META, 1):
    out += [
        f'## {i}. {titulo}',
        '',
        f'{intro} [Ver teoría →]({href})',
        '',
        f'<PyRunner client:visible titulo="{titulo}" paquetes={{{pk!r}}} alto={{{min(26, code[k].count(chr(10)) + 2)}}} code={{`{esc(code[k])}`}} />',
        '',
        f'**Qué observar:** {observar}',
        '',
    ]
dst = ROOT / 'src' / 'content' / 'docs' / 'laboratorio.mdx'
dst.write_text('\n'.join(out), encoding='utf-8')
print('ok', len(META), 'celdas')

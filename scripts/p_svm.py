from patch import patch
IMP = "import Fuente from '../../../components/Fuente.astro';"

patch('svm/geometria.mdx', [
 ('after', IMP, r"""
import SupportVectorDrag from '../../../components/sim/SupportVectorDrag.tsx';
import CasoUso from '../../../components/CasoUso.astro';
import Pasos from '../../../components/Pasos.astro';"""),
 ('before', '## Margen funcional vs geométrico', r"""<Pasos titulo="Distancias con números: w = (3, 4), b = −5">

1. $\Vert\mathbf{w}\Vert = \sqrt{3^2+4^2} = 5$; el vector unitario normal es $\hat{\mathbf{w}} = (0.6,\ 0.8)$.
2. Punto $\mathbf{x} = (3,\ 4)$: score $f = 9 + 16 - 5 = 20$ ⇒ distancia $r = 20/5 = 4$ (lado positivo).
3. Punto $\mathbf{x} = (0,\ 0)$: $f = -5$ ⇒ $r = -1$ (lado negativo, a 1 unidad).
4. El pie de la perpendicular desde $(3,4)$: $\mathbf{x}_p = \mathbf{x} - r\hat{\mathbf{w}} = (3,4) - 4(0.6, 0.8) = (0.6,\ 0.8)$. Chequeo: $3(0.6)+4(0.8)-5 = 0$ ✓ está en la frontera.
5. Si escalas a $(6, 8, -10)$, el score de $(3,4)$ pasa a 40 pero la distancia sigue siendo $40/10 = 4$: el margen **geométrico** no depende de la escala.
6. En forma canónica (el punto más cercano con $\lvert f\rvert = 1$), la banda mide $2/\Vert\mathbf{w}\Vert$: con $\mathbf{w} = (3,4)$, $2/5 = 0.4$.

</Pasos>

"""),
 ('before', '## El ejemplo de tres puntos, en papel', r"""<SupportVectorDrag client:visible />

<CasoUso titulo="Clasificar textos y genes: el terreno natural del SVM" sector="texto · bioinformática" icono="🧬">

Los SVM lineales fueron durante años el estándar para **clasificación de texto** (categorizar noticias, detectar opiniones): cada documento es un vector de decenas de miles de palabras, mucho más features que ejemplos. En ese régimen casi siempre existe un hiperplano que separa, y la pregunta del SVM, *¿cuál es el más seguro?*, es exactamente la correcta: maximizar el margen controla el sobreajuste aunque $d \gg n$.

Lo mismo en **expresión génica** (clasificar tumores con 20 000 genes y 100 pacientes): el SVM lineal regularizado por el margen da buenos resultados y los vectores de soporte señalan los casos «frontera», útiles para revisión clínica.

</CasoUso>

"""),
])

patch('svm/dual.mdx', [
 ('after', IMP, r"""
import DualExplorer from '../../../components/sim/DualExplorer.tsx';
import Pasos from '../../../components/Pasos.astro';"""),
 ('before', '## ¿Para qué molestarse con el dual?', r"""<DualExplorer client:visible />

<Pasos titulo="El dual del ejemplo de tres puntos, sin atajos">

1. Productos internos: $\mathbf{x}_1^\top\mathbf{x}_1 = 4$, $\mathbf{x}_2^\top\mathbf{x}_2 = 4$, $\mathbf{x}_1^\top\mathbf{x}_2 = 0$, y todo producto con $\mathbf{x}_3 = (0,0)$ vale 0.
2. Restricción de balance: $\alpha_1 + \alpha_2 - \alpha_3 = 0 \Rightarrow \alpha_3 = \alpha_1 + \alpha_2$.
3. Término cuadrático: solo sobreviven $\alpha_1^2\cdot4 + \alpha_2^2\cdot4$ (los cruzados valen 0). Entonces $W = (\alpha_1+\alpha_2+\alpha_3) - \tfrac12(4\alpha_1^2+4\alpha_2^2) = 2\alpha_1 + 2\alpha_2 - 2\alpha_1^2 - 2\alpha_2^2$.
4. Derivadas: $\partial W/\partial\alpha_1 = 2 - 4\alpha_1 = 0 \Rightarrow \alpha_1 = \tfrac12$; igual $\alpha_2 = \tfrac12$; luego $\alpha_3 = 1$. Todos $\ge 0$ ✓.
5. $\mathbf{w} = \tfrac12(2,0) + \tfrac12(0,2) - 1\cdot(0,0) = (1,1)$; con el vector de soporte $\mathbf{x}_1$: $b = y_1 - \mathbf{w}^\top\mathbf{x}_1 = 1 - 2 = -1$.
6. Valores: $W(\boldsymbol\alpha) = 1 + 1 - \tfrac12 - \tfrac12 = 1$ y $\tfrac12\Vert\mathbf{w}\Vert^2 = 1$: brecha cero (dualidad fuerte). Los tres $\alpha_i > 0$: los tres puntos son vectores de soporte.

</Pasos>

"""),
 ('before', '<Conexiones', r"""## En código: mirar dentro del SVM entrenado

```python
from sklearn.svm import SVC
import numpy as np

X = np.array([[2, 0], [0, 2], [0, 0], [3, 3]]); y = np.array([1, 1, -1, 1])
svm = SVC(kernel='linear', C=1e6).fit(X, y)   # C enorme ≈ margen duro

svm.support_            # índices de los vectores de soporte → [2, 0, 1] (no el (3,3))
svm.dual_coef_          # αᵢ·yᵢ de cada vector de soporte → [[-1, 0.5, 0.5]]
svm.coef_, svm.intercept_   # w = (1, 1), b = −1
w = svm.dual_coef_ @ svm.support_vectors_   # reconstruye w = Σ αᵢ yᵢ xᵢ
```

"""),
])

patch('svm/margen-suave.mdx', [
 ('after', IMP, r"""
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## En la práctica', r"""<CasoUso titulo="Detectar piezas defectuosas con etiquetas ruidosas" sector="manufactura" icono="🔩">

Inspectores humanos etiquetan 5 000 fotos de piezas como OK/defectuosa; se estima que ~3% de las etiquetas están **mal**. Con un margen duro, cada etiqueta errónea dentro de la otra clase obligaría a una frontera retorcida (o haría el problema infactible).

- Con **C pequeño** el SVM tolera esas violaciones: los puntos mal etiquetados quedan con $\alpha_i = C$ (empujan, pero con fuerza acotada) y la frontera sigue la tendencia general.
- Con **C enorme** la frontera persigue el ruido: accuracy de entrenamiento casi 100%, validación peor.
- C se elige por **validación cruzada** en una grilla logarítmica (0.01, 0.1, 1, 10, 100). Los puntos con $\alpha_i = C$ son, además, **candidatos a revisar**: a menudo son exactamente las etiquetas equivocadas.

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC, LinearSVC
from sklearn.model_selection import GridSearchCV
import numpy as np

pipe = make_pipeline(StandardScaler(), SVC(kernel='linear'))
grid = GridSearchCV(pipe, {'svc__C': np.logspace(-2, 3, 11)}, cv=5).fit(X_tr, y_tr)
svm = grid.best_estimator_[-1]
print(grid.best_params_, 'nº de SV por clase:', svm.n_support_)

big = make_pipeline(StandardScaler(), LinearSVC(C=1.0))     # hinge + L2, escala a n grande
proba = make_pipeline(StandardScaler(), SVC(probability=True))  # Platt scaling (CV interna)
```

"""),
])

patch('kernels/truco.mdx', [
 ('after', IMP, r"""
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## ¿Qué cuenta como kernel?', r"""<CasoUso titulo="Cuando no hay vectores: kernels sobre textos y moléculas" sector="investigación" icono="🔬">

El truco tiene una consecuencia profunda: el SVM **no necesita coordenadas**, solo una función de similitud válida $K$. Eso permite clasificar objetos que no son vectores:

- **Secuencias de ADN o proteínas**: un *string kernel* cuenta subsecuencias compartidas entre dos cadenas. Equivale a un producto interno en un espacio con una dimensión por cada subcadena posible (astronómico), pero se calcula con programación dinámica.
- **Moléculas** (grafos): kernels que comparan subestructuras, usados para predecir toxicidad o actividad de fármacos.
- **Textos**: el kernel lineal sobre bolsas de palabras ya es un producto interno; kernels de subsecuencias capturan orden.

En todos los casos se verifica lo mismo que aquí: la matriz de Gram debe ser **simétrica y PSD**.

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código: comprobar la identidad del kernel

```python
import numpy as np
from sklearn.metrics.pairwise import polynomial_kernel

def phi(v):                                   # mapa explícito de (1 + xᵀz)² en 2-D
    x1, x2 = v
    s = np.sqrt(2)
    return np.array([1, s*x1, s*x2, x1**2, x2**2, s*x1*x2])

x, z = np.array([1., 2.]), np.array([3., -1.])
print(phi(x) @ phi(z), (1 + x @ z) ** 2)      # 4.0 4.0 → mismo número
print(polynomial_kernel([x], [z], degree=2, gamma=1, coef0=1))

K = polynomial_kernel(X, degree=2, coef0=1)   # matriz de Gram n × n
print(np.linalg.eigvalsh(K).min() >= -1e-9)   # PSD → kernel válido
```

"""),
])

patch('kernels/practica.mdx', [
 ('after', IMP, r"""
import KernelShapes from '../../../components/sim/KernelShapes.tsx';
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## Mismos datos, tres kernels, tres fronteras', r"""<KernelShapes client:visible />

"""),
 ('before', '## El teorema del representante', r"""<CasoUso titulo="Reconocer dígitos con un SVM RBF: el clásico de los 90" sector="visión" icono="🔢">

Antes del deep learning, un SVM con kernel RBF era de los mejores clasificadores de dígitos escritos a mano. Receta típica sobre el dataset `digits`:

1. Estandarizar los 64 píxeles.
2. Grilla logarítmica: $C\in\{0.1, 1, 10, 100\}$, $\gamma\in\{10^{-4},\dots,10^{-1}\}$, con 5-fold CV.
3. Resultado típico: accuracy de test ≈ 98–99%, frente a ≈ 96% de la logística (lineal).
4. Mirar los **vectores de soporte**: son los dígitos ambiguos (un 7 con raya, un 4 cerrado), justo los «postes» de la frontera.
5. Precaución: con γ demasiado grande la CV baja aunque el entrenamiento llegue a 100%: cada imagen solo «se parece a sí misma».

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.kernel_ridge import KernelRidge
from sklearn.model_selection import GridSearchCV
import numpy as np

svm = GridSearchCV(make_pipeline(StandardScaler(), SVC(kernel='rbf')),
                   {'svc__C': np.logspace(-1, 3, 5), 'svc__gamma': np.logspace(-4, 0, 5)},
                   cv=5).fit(X_tr, y_tr)                    # C y γ JUNTOS
print(svm.best_params_, svm.score(X_te, y_te))

kr = KernelRidge(kernel='rbf', alpha=0.1, gamma=1.0).fit(x_tr.reshape(-1, 1), y_tr)
alpha = kr.dual_coef_          # α = (K + λI)⁻¹ y  (λ se llama alpha en sklearn)
y_hat = kr.predict(x_te.reshape(-1, 1))   # f(x) = Σ αᵢ K(xᵢ, x)
```

"""),
])

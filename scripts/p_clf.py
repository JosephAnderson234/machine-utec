from patch import patch
IMP = "import Fuente from '../../../components/Fuente.astro';"

patch('clasificacion/logistica.mdx', [
 ('after', IMP, r"""
import CasoUso from '../../../components/CasoUso.astro';
import Pasos from '../../../components/Pasos.astro';"""),
 ('before', '## El modelo y la frontera', r"""<CasoUso titulo="Credit scoring: por qué los bancos aman los odds ratios" sector="finanzas" icono="💳">

Un banco estima la probabilidad de que un cliente **no pague** (default) con features como deuda/ingreso, atrasos previos y antigüedad laboral. Usa regresión logística, aunque existan modelos más complejos, por tres razones:

- **Interpretable y auditable:** el regulador exige explicar cada rechazo. Si el peso de «nº de atrasos en el último año» es $w = 0.69$, cada atraso adicional **multiplica los odds de default por $e^{0.69} \approx 2$**, con todo lo demás fijo.
- **Probabilidad, no solo etiqueta:** con $P(\text{default}\mid\mathbf{x})$ el banco fija la tasa de interés por riesgo o decide el umbral según cuánto cuesta un mal préstamo vs un buen cliente perdido.
- **El umbral es de negocio:** si perder un buen cliente cuesta S/ 300 y un default cuesta S/ 3 000, conviene rechazar cuando $P(\text{default}) > 300/(300+3000) \approx 0.09$, **no** 0.5.

</CasoUso>

<Pasos titulo="Ejemplo con números: de score a decisión">

1. Modelo ajustado: $z = -3 + 0.69\,\text{atrasos} + 2.0\,\text{deuda/ingreso}$.
2. Cliente A: 1 atraso, deuda/ingreso = 0.5 ⇒ $z = -3 + 0.69 + 1.0 = -1.31$ ⇒ $p = \sigma(-1.31) = 1/(1+e^{1.31}) \approx 0.21$.
3. Odds: $0.21/0.79 \approx 0.27$ (≈ 1 a 4). Log-odds: $\log 0.27 = -1.31 = z$ ✓.
4. Si el cliente tuviera **un atraso más**: $z = -0.62$, $p \approx 0.35$, odds $\approx 0.54$: los odds se **duplicaron** ($e^{0.69}$), aunque la probabilidad no se duplicó (0.21 → 0.35).
5. Decisión con umbral 0.5: aprobar (0.21 < 0.5). Con el umbral de negocio 0.09: **rechazar**. Mismo modelo, distinta decisión: el umbral se elige por costos.

</Pasos>

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import numpy as np

clf = make_pipeline(StandardScaler(), LogisticRegression(C=1.0))  # C = 1/λ (L2)
clf.fit(X_tr, y_tr)
p = clf.predict_proba(X_val)[:, 1]          # P(y = 1 | x)
y_hat = (p >= 0.5).astype(int)              # umbral por defecto (¡movible!)

lr = clf[-1]
odds_ratios = np.exp(lr.coef_[0])           # efecto multiplicativo por 1 desviación estándar
x_star = -lr.intercept_[0] / lr.coef_[0][0] # frontera en 1-D (features estandarizadas)
```

"""),
])

patch('clasificacion/entrenamiento.mdx', [
 ('after', IMP, r"""
import LossLandscape from '../../../components/sim/LossLandscape.tsx';
import Pasos from '../../../components/Pasos.astro';"""),
 ('before', '## La verosimilitud de una etiqueta', r"""<LossLandscape client:visible />

"""),
 ('before', '## Convexa… y finita gracias a la regularización', r"""<Pasos titulo="Una iteración de entrenamiento con números (3 puntos)">

1. Datos: $x = (-1,\ 0.5,\ 2)$, $y = (0,\ 1,\ 1)$. Modelo $p = \sigma(wx + b)$, inicio $w = 0$, $b = 0$ ⇒ $p = (0.5,\ 0.5,\ 0.5)$.
2. Pérdida: cada punto paga $-\log 0.5 = 0.693$; $J = 0.693$ (el valor de «no saber nada» con dos clases).
3. Errores $p - y = (0.5,\ -0.5,\ -0.5)$. Gradientes: $\partial J/\partial w = \frac13[(0.5)(-1) + (-0.5)(0.5) + (-0.5)(2)] = \frac13(-1.75) = -0.583$ y $\partial J/\partial b = \frac13(0.5-0.5-0.5) = -0.167$.
4. Paso con $\eta = 1$: $w = 0.583$, $b = 0.167$.
5. Nuevas probabilidades: $z = (-0.417,\ 0.458,\ 1.333)$ ⇒ $p = (0.397,\ 0.613,\ 0.791)$. Ahora todas del lado correcto del 0.5.
6. Nueva pérdida: $-\frac13[\log(1-0.397) + \log 0.613 + \log 0.791] = \frac13(0.506 + 0.489 + 0.234) = 0.410$. Bajó de 0.693 a 0.410 en un paso.

</Pasos>

"""),
 ('before', '<Conexiones', r"""## En código (NumPy, desde cero)

```python
import numpy as np

def sigmoid(z):
    return np.where(z >= 0, 1 / (1 + np.exp(-z)), np.exp(z) / (1 + np.exp(z)))  # estable

def fit_logistic(X, y, eta=0.5, iters=2000, lam=0.0):
    w, b = np.zeros(X.shape[1]), 0.0
    n = len(y)
    for _ in range(iters):
        p = sigmoid(X @ w + b)
        w -= eta * (X.T @ (p - y) / n + 2 * lam * w)   # «error × feature» + ridge
        b -= eta * np.mean(p - y)                        # el sesgo no se penaliza
    return w, b

def cross_entropy(X, y, w, b, eps=1e-12):
    p = np.clip(sigmoid(X @ w + b), eps, 1 - eps)
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
```

"""),
])

patch('clasificacion/metricas.mdx', [
 ('after', IMP, r"""
import ConfusionCalc from '../../../components/sim/ConfusionCalc.tsx';
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## Barriendo el umbral: la curva ROC', r"""<ConfusionCalc client:visible />

### Más métricas que conviene conocer

| Métrica | Fórmula | Cuándo mirarla |
| --- | --- | --- |
| Especificidad (TNR) | $TN/(TN+FP)$ | cuántos sanos se descartan bien (pareja de la sensibilidad en medicina) |
| FPR | $FP/(FP+TN) = 1-$ especificidad | eje x de la ROC |
| Accuracy balanceada | $(\text{TPR} + \text{TNR})/2$ | clases desbalanceadas, alternativa honesta a la accuracy |
| $F_\beta$ | $(1+\beta^2)\frac{PR}{\beta^2P + R}$ | $\beta > 1$ prioriza recall; $\beta < 1$ prioriza precision |
| Curva PR / AP | precision vs recall al mover el umbral | positivos muy raros (fraude): más informativa que la ROC |

"""),
 ('before', '## Caso real: cáncer de mama', r"""<CasoUso titulo="Detección de fraude: 0.2% de positivos" sector="banca" icono="🕵️">

De 100 000 transacciones, 200 son fraude. Un modelo marca 1 050 como sospechosas y atrapa 150 fraudes:

- **Accuracy 99.05%** … pero «nunca marcar nada» saca **99.8%**. La accuracy no sirve.
- **Recall 75%** (150 de 200) y **precision 14%** (150 de 1 050): por cada fraude real, el equipo revisa ~6 alertas falsas.
- La decisión es de **costos**: si revisar una alerta cuesta S/ 2 y un fraude no detectado cuesta S/ 800, conviene bajar el umbral aunque la precision caiga.
- Se reporta la **curva PR** y la precision en el top-k de alertas (lo que el equipo alcanza a revisar por día), no la accuracy.

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.metrics import (confusion_matrix, classification_report,
                             roc_auc_score, roc_curve, precision_recall_curve,
                             average_precision_score)

p = clf.predict_proba(X_test)[:, 1]
y_hat = (p >= 0.5).astype(int)
tn, fp, fn, tp = confusion_matrix(y_test, y_hat).ravel()   # ¡orden de sklearn!
print(classification_report(y_test, y_hat))                # precision, recall, F1 por clase
print('ROC-AUC', roc_auc_score(y_test, p), '· AP', average_precision_score(y_test, p))

# elegir el umbral en VALIDACIÓN para un recall mínimo de 0.95
prec, rec, thr = precision_recall_curve(y_val, clf.predict_proba(X_val)[:, 1])
t = thr[(rec[:-1] >= 0.95)].max()
```

"""),
])

patch('clasificacion/softmax.mdx', [
 ('after', IMP, r"""
import SoftmaxRegions from '../../../components/sim/SoftmaxRegions.tsx';
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## La sigmoide es softmax con K = 2', r"""<SoftmaxRegions client:visible />

<CasoUso titulo="Reconocer dígitos escritos a mano (0–9)" sector="visión" icono="✍️">

El dataset `digits` del notebook 04d tiene imágenes de 8×8 píxeles (64 features) y 10 clases. Una regresión logística multinomial (softmax) aprende **10 vectores de pesos de 64 números**: cada uno, visto como imagen 8×8, parece una «plantilla» difusa del dígito. Para una imagen nueva, cada clase calcula su score $z_k = \mathbf{w}_k^\top\mathbf{x}+b_k$ (cuánto se parece a su plantilla) y softmax los convierte en probabilidades.

- Accuracy de test típica ≈ 96%: un modelo **lineal** basta porque los píxeles ya separan bastante bien las clases.
- La matriz de confusión 10×10 muestra qué se confunde (8 con 1, 9 con 3…): la diagonal son los aciertos, como en el caso binario.
- Con un SVM RBF o una red neuronal se llega a ≈99%: el precio es menos interpretabilidad.

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import confusion_matrix

X, y = load_digits(return_X_y=True)                     # 1797 imágenes, 64 píxeles
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, random_state=0)
clf = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000))  # multinomial
clf.fit(X_tr, y_tr)
print(clf.score(X_te, y_te))                            # ≈ 0.96
P = clf.predict_proba(X_te[:1])                         # 10 probabilidades que suman 1
W = clf[-1].coef_.reshape(10, 8, 8)                     # cada fila = «plantilla» 8×8
```

"""),
])

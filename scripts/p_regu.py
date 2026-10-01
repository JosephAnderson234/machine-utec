from patch import patch
IMP = "import Fuente from '../../../components/Fuente.astro';"
patch('regularizacion/sesgo-varianza.mdx', [
 ('after', IMP, r"""
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## ¿Cómo bajar cada uno?', r"""<CasoUso titulo="Una app de delivery estima tiempos de entrega" sector="logística" icono="🛵">

Un equipo prueba dos modelos para predecir minutos de entrega:

| | Train RMSE | Validación RMSE | Diagnóstico |
| --- | --- | --- | --- |
| Promedio por distrito | 11.8 min | 12.1 min | errores altos y parecidos ⇒ **sesgo alto** (ignora hora punta, lluvia, distancia) |
| Árbol sin podar | 0.4 min | 15.6 min | brecha enorme ⇒ **varianza alta** (memorizó pedidos individuales) |

Las acciones son opuestas: al primero hay que darle **más información y flexibilidad** (más features, modelo más rico); al segundo, **restringirlo** (podar, regularizar, más datos o promediar árboles). Recolectar más datos **no** arregla el primero: con millones de pedidos el promedio por distrito sigue igual de sesgado.

</CasoUso>

"""),
 ('before', '<Quiz', r"""## Diagnóstico rápido en el examen

| Síntoma | Causa probable | Qué hacer |
| --- | --- | --- |
| Train alto, validación alto (parecidos) | sesgo alto / underfit | modelo más flexible, más features, menos regularización |
| Train bajo, validación mucho más alto | varianza alta / overfit | más datos, más regularización, modelo más simple, podar, ensembles |
| Ambos bajos y cercanos | buen balance | parar; reportar el test una vez |
| Validación cambia mucho entre particiones | varianza de la *estimación* | K-fold en vez de una sola partición |
| Más datos no mejoran nada | sesgo domina o ruido irreducible | cambiar de familia de modelos o mejorar las features |

## En código: curvas de complejidad y de aprendizaje

```python
from sklearn.model_selection import validation_curve, learning_curve
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
import numpy as np

model = make_pipeline(PolynomialFeatures(), LinearRegression())
degrees = np.arange(1, 13)
tr, va = validation_curve(model, X, y, param_name='polynomialfeatures__degree',
                          param_range=degrees, cv=5, scoring='neg_root_mean_squared_error')
# −tr.mean(1) baja siempre; −va.mean(1) dibuja la U → elegir el mínimo

sizes, tr, va = learning_curve(model.set_params(polynomialfeatures__degree=9), X, y, cv=5)
# brecha grande que se cierra con más n ⇒ varianza; ambas altas y planas ⇒ sesgo
```

"""),
])
patch('regularizacion/ridge-lasso.mdx', [
 ('after', IMP, r"""
import CasoUso from '../../../components/CasoUso.astro';
import Pasos from '../../../components/Pasos.astro';"""),
 ('before', '## ¿Por qué el ℓ1 da ceros? La geometría', r"""<Pasos titulo="De dónde sale la fórmula cerrada de ridge (y el soft-threshold del lasso)">

1. Costo: $J_\lambda(\mathbf{w}) = \Vert\mathbf{y}-\mathbf{X}\mathbf{w}\Vert^2 + \lambda\,\mathbf{w}^\top\mathbf{w}$.
2. El primer término tiene gradiente $-2\mathbf{X}^\top(\mathbf{y}-\mathbf{X}\mathbf{w})$ (igual que OLS); el segundo, $2\lambda\mathbf{w}$.
3. Igualando a cero: $-\mathbf{X}^\top\mathbf{y} + \mathbf{X}^\top\mathbf{X}\mathbf{w} + \lambda\mathbf{w} = \mathbf{0} \;\Rightarrow\; (\mathbf{X}^\top\mathbf{X}+\lambda\mathbf{I})\mathbf{w} = \mathbf{X}^\top\mathbf{y}$.
4. $\mathbf{X}^\top\mathbf{X}$ es semidefinida positiva (autovalores $\ge 0$); sumarle $\lambda\mathbf{I}$ sube **todos** los autovalores en $\lambda$, así que con $\lambda>0$ son $>0$: la matriz siempre es invertible.
5. $\mathbf{w}^\star_\lambda = (\mathbf{X}^\top\mathbf{X}+\lambda\mathbf{I})^{-1}\mathbf{X}^\top\mathbf{y}$. Con $\mathbf{X}^\top\mathbf{X} = \mathbf{I}$ (features ortonormales) queda $\mathbf{w}_\lambda = \mathbf{w}_\text{OLS}/(1+\lambda)$: el encogimiento proporcional del gráfico de abajo.
6. **Lasso** en 1-D: $\min_w (w-a)^2 + \lambda\lvert w\rvert$. Para $w>0$ la derivada es $2(w-a)+\lambda = 0 \Rightarrow w = a-\lambda/2$, válido solo si $a > \lambda/2$; simétrico para $w<0$; si $\lvert a\rvert\le\lambda/2$ el mínimo está en el pico $w = 0$. Eso es el **soft-threshold** con $\gamma=\lambda/2$.

</Pasos>

"""),
 ('before', '## Cómo se optimiza cada uno', r"""<CasoUso titulo="Marketing con 500 variables: lasso como detector de lo que importa" sector="marketing" icono="📈">

Una cadena de retail predice las ventas semanales de cada tienda con 500 variables candidatas (clima, feriados, promociones de 40 categorías, precios de la competencia, tráfico web…) y solo 300 semanas de historia: **más features que ejemplos**.

- **OLS** es imposible ($\mathbf{X}^\top\mathbf{X}$ singular con $p > n$).
- **Ridge** funciona y predice bien, pero conserva las 500 variables con pesitos: difícil de explicar a gerencia.
- **Lasso** (con λ por CV) deja solo unas pocas decenas de variables con peso distinto de cero: algunas promociones, feriados, temperatura… Es un modelo que el negocio entiende y sobre el que puede actuar.
- Si dos variables están muy correlacionadas (precio propio y precio del competidor), lasso puede quedarse con una casi al azar: para estabilidad, **elastic net**.

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import RidgeCV, LassoCV
import numpy as np

alphas = np.logspace(-4, 3, 50)            # en scikit-learn, λ se llama alpha
ridge = make_pipeline(StandardScaler(), RidgeCV(alphas=alphas, cv=5)).fit(X_tr, y_tr)
lasso = make_pipeline(StandardScaler(), LassoCV(alphas=alphas, cv=5)).fit(X_tr, y_tr)

coef = lasso[-1].coef_
print('λ elegido:', lasso[-1].alpha_, '· features con peso ≠ 0:', np.sum(coef != 0))
# el intercepto no se penaliza (fit_intercept=True)
```

"""),
])
patch('regularizacion/validacion-cruzada.mdx', [
 ('after', IMP, r"""
import LeakageDemo from '../../../components/sim/LeakageDemo.tsx';
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## Todo junto: el barrido de complejidad', r"""<LeakageDemo client:visible />

<CasoUso titulo="El «primer lugar» que se cae en el ranking final" sector="competencias de datos" icono="🏆">

En competencias tipo Kaggle hay un *leaderboard público* (una parte del test) y uno *privado* (el resto, revelado al final). Equipos que envían cientos de variantes y se quedan con la que mejor puntúa en el público suelen **caer muchos puestos** en el privado: hicieron selección de modelos sobre el test público, exactamente la maldición del ganador del simulador de arriba. Los que eligen con una **validación cruzada local** sólida y miran poco el leaderboard suelen subir.

Otra fuga clásica: **series de tiempo** partidas al azar. Si el modelo de demanda entrena con datos de marzo y valida con febrero, «ve el futuro». Se usa una partición temporal (`TimeSeriesSplit`): siempre entrenar con el pasado y validar con lo que viene después.

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código: CV sin fugas

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import Ridge
from sklearn.model_selection import GridSearchCV, KFold, cross_val_score
import numpy as np

# el escalador vive DENTRO del pipeline: en cada fold se ajusta solo con train
pipe = make_pipeline(PolynomialFeatures(9), StandardScaler(), Ridge())
grid = GridSearchCV(pipe, {'ridge__alpha': np.logspace(-6, 2, 30)},
                    cv=KFold(5, shuffle=True, random_state=0),
                    scoring='neg_root_mean_squared_error')
grid.fit(X_tr, y_tr)                         # el test no aparece aquí
print(grid.best_params_, -grid.best_score_)
print('test:', -grid.score(X_test, y_test))  # una sola vez, al final

# CV anidada: estima qué tan bueno es TODO el procedimiento de selección
outer = cross_val_score(grid, X_tr, y_tr, cv=5)
```

"""),
])

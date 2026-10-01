from patch import patch
IMP = "import Fuente from '../../../components/Fuente.astro';"

patch('arboles/impureza.mdx', [
 ('after', IMP, r"""
import CasoUso from '../../../components/CasoUso.astro';
import Pasos from '../../../components/Pasos.astro';"""),
 ('before', '## Puntuar un split: ganancia de información', r"""<Pasos titulo="Calcular Gini y entropía del nodo B = [2, 5]">

1. Fracciones: $\hat p_0 = 2/7 \approx 0.286$, $\hat p_1 = 5/7 \approx 0.714$.
2. **Error rate:** $1 - \max(\hat p_k) = 1 - 5/7 = 2/7 \approx 0.286$ (predecir la mayoría, clase 1, falla 2 de 7).
3. **Gini:** $1 - (2/7)^2 - (5/7)^2 = 1 - 4/49 - 25/49 = 20/49 \approx 0.408$.
4. **Entropía:** $-\tfrac27\log_2\tfrac27 - \tfrac57\log_2\tfrac57 = 0.286\cdot1.807 + 0.714\cdot0.485 = 0.516 + 0.347 = 0.863$ bits.
5. Lectura: en promedio hacen falta 0.863 preguntas sí/no para adivinar la clase de un punto de B (menos de 1 porque está sesgado hacia la clase 1), y dos extracciones independientes discrepan con probabilidad 0.408.
6. Comparación: la raíz $[5,5]$ tiene Gini 0.5 y entropía 1 bit (el máximo con 2 clases).

</Pasos>

"""),
 ('before', '### Ganancia cero y el problema del error rate', r"""<CasoUso titulo="Triage en urgencias: un árbol que una enfermera puede seguir" sector="salud" icono="🚑">

Un hospital quiere priorizar pacientes con dolor torácico usando 4 datos que se miden en minutos: presión sistólica, edad, frecuencia cardiaca y si hay cambios en el ECG. Un árbol de profundidad 3 se imprime como una tarjeta:

- «¿Presión sistólica ≤ 91? → alto riesgo.» «Si no: ¿edad ≤ 62.5? → bajo riesgo.» «Si no: ¿taquicardia? → alto riesgo; si no, bajo.»
- Cada pregunta se eligió porque producía la **mayor ganancia de Gini** sobre los datos históricos: separa mejor los pacientes que tuvieron un evento grave de los que no.
- Ventajas decisivas aquí: no hace falta una computadora, cada decisión se **explica** con un camino de 2–3 preguntas, y no hay que estandarizar nada.
- El riesgo: si se deja crecer, el árbol memoriza casos raros; por eso se limita la profundidad y se valida con pacientes de otro año.

</CasoUso>

"""),
])

patch('arboles/cart.mdx', [
 ('after', IMP, r"""
import TreeRegression from '../../../components/sim/TreeRegression.tsx';"""),
 ('before', ':::caution[No extrapola]', r"""<TreeRegression client:visible />

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, export_text
import numpy as np

X = np.array([[1,4],[2,1],[3,9],[6,5],[8,3],[4,8],[5,10],[7,2],[9,6],[10,7]])
y = np.array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1])        # los 10 puntos de la clase

tree = DecisionTreeClassifier(criterion='gini', random_state=0).fit(X, y)
print(export_text(tree, feature_names=['x1', 'x2']))
# |--- x1 <= 3.50 → clase 0 ; |--- x1 > 3.50 → x2 <= 5.50 → x2 <= 2.50 ...
print(tree.get_n_leaves(), tree.get_depth())        # 4 hojas, profundidad 3

reg = DecisionTreeRegressor(max_depth=5).fit(x.reshape(-1, 1), y_reg)  # escalera
```

"""),
])

patch('arboles/poda.mdx', [
 ('after', IMP, r"""
import TreeRegression from '../../../components/sim/TreeRegression.tsx';
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## El puente a la sesión 09: ensembles', r"""<CasoUso titulo="Un árbol de crédito que cambia cada mes" sector="finanzas" icono="🏦">

Un banco re-entrena cada mes un árbol para pre-aprobar créditos. Con los mismos clientes «casi iguales», un mes la primera pregunta es *ingreso ≤ 3 500*, al siguiente *deuda/ingreso ≤ 0.4*. La accuracy apenas cambia (≈ 88%), pero **las reglas que ve el cliente sí**, y el área de riesgo no puede explicar por qué alguien aprobado en enero es rechazado en febrero con el mismo perfil.

- Es la **inestabilidad** de esta sección: la elección del split es un arg max entre candidatos casi empatados.
- Remedios: **podar** (árboles más chicos son más estables), fijar `random_state`, o dejar el árbol para *explicar* y usar un **ensemble** (random forest) para *predecir*.

</CasoUso>

"""),
 ('after', 'Eso es bagging, random forests y boosting.\n', r"""
Pruébalo en regresión: sube la profundidad (árboles de alta varianza) y luego el número de árboles promediados.

<TreeRegression client:visible />
"""),
 ('before', '<Quiz', r"""## En código: poda por costo-complejidad con CV

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.inspection import permutation_importance

path = DecisionTreeClassifier(random_state=0).cost_complexity_pruning_path(X_tr, y_tr)
alphas = path.ccp_alphas[:-1]           # la ruta finita de α (sin el que deja solo la raíz)
# para los 10 puntos: [0, 0.1333, 0.1524, 0.2143] = 0, 2/15, 16/105, 3/14

grid = GridSearchCV(DecisionTreeClassifier(random_state=0),
                    {'ccp_alpha': alphas}, cv=5).fit(X_tr, y_tr)
best = grid.best_estimator_
print(grid.best_params_, best.get_n_leaves(), best.score(X_te, y_te))

imp_mdi = best.feature_importances_                      # MDI (sesgada)
imp_perm = permutation_importance(best, X_val, y_val).importances_mean  # más confiable
```

"""),
])

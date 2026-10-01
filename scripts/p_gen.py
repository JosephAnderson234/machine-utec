from patch import patch
IMP = "import Fuente from '../../../components/Fuente.astro';"

patch('generativos/bayes.mdx', [
 ('after', IMP, r"""
import CasoUso from '../../../components/CasoUso.astro';
import Pasos from '../../../components/Pasos.astro';"""),
 ('before', '### Prior × likelihood → posterior: aparece la sigmoide', r"""<CasoUso titulo="Pruebas rápidas de antígeno en una epidemia" sector="salud pública" icono="🧫">

La **misma prueba** (sensibilidad 80%, especificidad 99%) da posteriores muy distintos según el contexto, porque cambia el **prior** (prevalencia):

| Contexto | Prevalencia | $P(\text{infectado}\mid +)$ |
| --- | --- | --- |
| Tamizaje masivo en un aeropuerto | 0.5% | ≈ 29% |
| Consulta con síntomas | 10% | ≈ 90% |
| Contacto directo de un caso | 30% | ≈ 97% |

Por eso los protocolos piden confirmar los positivos del tamizaje masivo y en cambio actúan directo ante un positivo sintomático. En el lenguaje del curso: el likelihood $p(+\mid\text{infectado})$ es fijo; el posterior depende del prior.

</CasoUso>

<Pasos titulo="Cómo calcular un posterior en el examen (receta)">

1. Identifica las clases y el **prior**: $\pi_\text{inf} = 0.10$, $\pi_\text{sano} = 0.90$.
2. Identifica los **likelihoods** de la evidencia observada: $p(+\mid\text{inf}) = 0.80$, $p(+\mid\text{sano}) = 1 - 0.99 = 0.01$.
3. Multiplica prior × likelihood por clase (los «scores»): inf $= 0.10\cdot0.80 = 0.080$; sano $= 0.90\cdot0.01 = 0.009$.
4. **Normaliza** (divide por la suma, la evidencia $p(+) = 0.089$): $P(\text{inf}\mid +) = 0.080/0.089 \approx 0.90$.
5. Para **decidir** (MAP) basta comparar los scores del paso 3: 0.080 > 0.009 ⇒ infectado. La normalización solo hace falta si te piden la probabilidad.
6. Chequeo de sentido común: con 1 000 personas, 100 infectadas → 80 positivos verdaderos; 900 sanas → 9 falsos positivos; $80/89 \approx 0.90$ ✓.

</Pasos>

"""),
])

patch('generativos/naive-bayes.mdx', [
 ('after', IMP, r"""
import CurseJoint from '../../../components/sim/CurseJoint.tsx';
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## Decidir en log-espacio', r"""<CurseJoint client:visible />

"""),
 ('before', '## Suavizado de Laplace, y una advertencia', r"""<CasoUso titulo="Un filtro de spam real, de principio a fin" sector="correo" icono="📧">

1. **Datos:** 50 000 correos marcados por usuarios (40% spam). Vocabulario de las 20 000 palabras más frecuentes.
2. **Features:** cada correo → vector de conteos de palabras (bolsa de palabras, `CountVectorizer`). Es enorme y casi todo ceros (esparso).
3. **Entrenar = contar:** para cada clase, cuántas veces aparece cada palabra + α. Toma segundos aun con millones de correos; agregar correos nuevos es sumar conteos (**aprendizaje incremental**).
4. **Predecir:** sumar $\log p(w\mid y)$ de las palabras del correo + $\log\pi_y$. Gana la clase con mayor suma.
5. **Umbral asimétrico:** un correo legítimo en spam (FP) es peor que un spam en la bandeja (FN), así que se exige $P(\text{spam}) > 0.99$ para mover un correo a spam.
6. **Limitación:** los spammers escriben «fr3e m0ney» para esquivar palabras conocidas, y las probabilidades salen sobreconfiadas. Por eso los filtros modernos combinan NB con otros modelos, pero NB sigue siendo un baseline excelente y rapidísimo.

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB, BernoulliNB, GaussianNB
from sklearn.pipeline import make_pipeline

spam = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0))   # α = Laplace
spam.fit(textos_tr, y_tr)
spam.predict_proba(['free money now'])          # [[P(ham), P(spam)]]

nb_bin = make_pipeline(CountVectorizer(binary=True), BernoulliNB(alpha=1.0))  # presencia 0/1

g = GaussianNB().fit(X_tr, y_tr)                # features continuas
g.theta_, g.var_, g.class_prior_                 # μₖⱼ, σ²ₖⱼ y πₖ: contar y promediar
```

"""),
])

patch('generativos/lda-qda.mdx', [
 ('after', IMP, r"""
import LDA1D from '../../../components/sim/LDA1D.tsx';
import GenDiscCurves from '../../../components/sim/GenDiscCurves.tsx';
import CasoUso from '../../../components/CasoUso.astro';"""),
 ('before', '## De LDA a QDA con una perilla', r"""<LDA1D client:visible />

"""),
 ('before', '| Generativo (NB, LDA, QDA) | Discriminativo (logística) |', r"""<GenDiscCurves client:visible />

"""),
 ('before', '## Ejercicio', r"""<CasoUso titulo="Control de calidad con sensores: cuándo QDA le gana a LDA" sector="manufactura" icono="🏭">

Una planta clasifica botellas como *buenas* o *defectuosas* con dos medidas continuas (grosor de pared y presión de prueba). Con 2 000 ejemplos:

- Las botellas **buenas** forman una nube compacta y casi circular; las **defectuosas** varían mucho más y en direcciones correlacionadas (una elipse grande e inclinada).
- **LDA** fuerza la misma elipse para ambas clases ⇒ frontera recta ⇒ deja escapar defectos que caen «alrededor» de la nube buena.
- **QDA** usa una elipse por clase ⇒ frontera curva que **envuelve** a la clase compacta. Con 2 000 ejemplos y solo 2 features (3 parámetros de covarianza por clase) tiene datos de sobra.
- Si en cambio fueran 200 features con 300 ejemplos, QDA necesitaría estimar 20 100 números por clase: ahí LDA (o NB, o logística regularizada) es la opción sensata.

</CasoUso>

"""),
 ('before', '<Conexiones', r"""## En código

```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.discriminant_analysis import QuadraticDiscriminantAnalysis as QDA

lda = LDA().fit(X_tr, y_tr)
qda = QDA(reg_param=0.1).fit(X_tr, y_tr)     # reg_param encoge Σₖ (útil con d grande)
lda.means_, lda.covariance_ if hasattr(lda, 'covariance_') else None
w = lda.coef_                                # = Σ⁻¹(μ₁ − μ₀) en el caso binario
print(lda.score(X_te, y_te), qda.score(X_te, y_te))
lda.predict_proba(X_te[:3])                  # posterior σ(wᵀx + b)
```

"""),
])

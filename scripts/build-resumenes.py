"""Genera las páginas de resumen imprimible por unidad (src/content/docs/resumenes/*.mdx).

Uso: python scripts/build-resumenes.py
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'content' / 'docs' / 'resumenes'
OUT.mkdir(exist_ok=True)

U = [
 dict(slug='fundamentos', n='0', t='Fundamentos y matemáticas', href='/fundamentos/intro/',
  ideas=[
   'ML aprende reglas a partir de datos: **datos + respuestas → modelo**, en vez de reglas escritas a mano.',
   '**Mitchell:** aprende de la experiencia $E$ en la tarea $T$ medida por $P$ si $P$ mejora con $E$. $E$ = datos, $P$ = desempeño (no el algoritmo ni el nº de parámetros).',
   'Paradigmas: **supervisado** (regresión: $y$ continuo; clasificación: $y$ discreto), **no supervisado** (clustering, reducción de dimensión), **refuerzo** (actuar y recibir recompensas).',
   'Meta: **generalizar**. Train ajusta, validación decide, test se usa **una vez**. Data leakage = el test influye en decisiones ⇒ nota optimista.',
   'Underfit = estudiante que siempre responde «C»; overfit = el que memorizó el examen pasado.',
   'Tres herramientas: álgebra lineal (modelo $\\hat{\\mathbf{y}}=\\mathbf{X}\\mathbf{w}$), probabilidad (incertidumbre, Bayes), optimización (gradiente, convexidad).',
  ],
  formulas=[
   '\\hat R(h) = \\frac1n\\sum_i \\ell(h(\\mathbf{x}_i), y_i)\\quad\\text{(riesgo empírico, ERM)}',
   '\\mathbf{a}^\\top\\mathbf{b} = \\Vert\\mathbf{a}\\Vert\\Vert\\mathbf{b}\\Vert\\cos\\theta,\\qquad \\Vert\\mathbf{v}\\Vert_2 = \\sqrt{\\textstyle\\sum v_j^2},\\quad \\Vert\\mathbf{v}\\Vert_1 = \\textstyle\\sum\\lvert v_j\\rvert',
   'P(A\\mid B) = \\frac{P(B\\mid A)P(A)}{P(B)}\\qquad \\text{posterior} \\propto \\text{likelihood}\\times\\text{prior}',
   'w \\leftarrow w - \\eta\\,\\nabla J(w)\\qquad (\\text{para } J=(w-1)^2 \\text{ converge si } 0<\\eta<1)',
  ],
  trampas=['En clasificación $y$ es discreto (si es continuo, es regresión).', 'El clustering es no supervisado; la regresión es supervisada.', 'Con una enfermedad rara, un positivo suele ser falsa alarma: $P(A\\mid B)\\ne P(B\\mid A)$.', 'Convexo ⇒ todo mínimo local es global.']),
 dict(slug='regresion', n='1', t='Regresión lineal', href='/regresion/modelo/',
  ideas=[
   'Modelo $\\hat{\\mathbf{y}} = \\mathbf{X}\\mathbf{w}$; la columna de unos absorbe el sesgo. Residual $r_i = y_i - \\hat y_i$.',
   'Costo $J = \\Vert\\mathbf{y}-\\mathbf{X}\\mathbf{w}\\Vert^2$: **convexo** porque $\\mathbf{v}^\\top\\mathbf{X}^\\top\\mathbf{X}\\mathbf{v} = \\Vert\\mathbf{X}\\mathbf{v}\\Vert^2\\ge0$.',
   'Dos rutas, misma respuesta: gradiente = 0 o **proyección ortogonal** de $\\mathbf{y}$ sobre el espacio columna ($\\mathbf{X}^\\top\\mathbf{r}=0$).',
   'Cuadrados = **máxima verosimilitud con ruido gaussiano** (Laplace daría error absoluto).',
   'Descenso de gradiente cuando $d$ o $n$ son grandes o no hay forma cerrada. **Estandarizar** redondea el bowl. Batch / SGD / mini-batch.',
   'Polinomios: lineal en los **pesos**, curvo en $x$. Overfitting ⇒ **pesos que explotan**.',
  ],
  formulas=[
   '\\mathbf{X}^\\top\\mathbf{X}\\mathbf{w} = \\mathbf{X}^\\top\\mathbf{y}\\;\\Rightarrow\\; \\mathbf{w}^\\star = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top\\mathbf{y}',
   '\\nabla J = 2\\mathbf{X}^\\top(\\mathbf{X}\\mathbf{w}-\\mathbf{y}) = -2\\mathbf{X}^\\top\\mathbf{r}',
   '\\mathbf{H} = \\mathbf{X}(\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top,\\quad \\hat{\\mathbf{y}} = \\mathbf{H}\\mathbf{y},\\quad \\mathbf{H}^2 = \\mathbf{H}',
   'w_1 = \\frac{\\sum(x_i-\\bar x)(y_i-\\bar y)}{\\sum(x_i-\\bar x)^2},\\qquad w_0 = \\bar y - w_1\\bar x',
   '\\text{RMSE}=\\sqrt{\\tfrac1n\\textstyle\\sum r_i^2},\\quad \\text{MAE}=\\tfrac1n\\textstyle\\sum\\lvert r_i\\rvert,\\quad R^2 = 1 - \\frac{SS_\\text{res}}{SS_\\text{tot}}',
  ],
  trampas=['$J$ **es** convexa.', 'Con $\\eta=0$ no se aprende nada; el signo menos importa.', '$R^2$ puede ser negativo en validación.', 'RMSE ≥ MAE; la brecha delata outliers.', 'Un peso es asociación, no causalidad; compara magnitudes solo con features estandarizadas.']),
 dict(slug='regularizacion', n='2', t='Regularización y selección de modelos', href='/regularizacion/sesgo-varianza/',
  ideas=[
   'Train baja siempre con la complejidad; validación hace una **U**.',
   '**Sesgo** = error sistemático del ajuste promedio; **varianza** = cuánto cambia el ajuste entre training sets; $\\sigma^2$ = ruido irreducible.',
   'Underfit: sesgo alto, varianza baja. Overfit: sesgo bajo, varianza alta.',
   'Regularizar = pérdida + $\\lambda\\Omega(\\mathbf{w})$: cambia un poco de sesgo por mucha varianza. Estandarizar y **no penalizar el sesgo $b$**.',
   '**Ridge** encoge (nunca 0, siempre invertible); **lasso** pone pesos en 0 (rombo con esquinas, soft-threshold, descenso por coordenadas).',
   '**K-fold CV** para elegir λ / grado; regla de 1 SE; el test nunca participa; escalar dentro del pipeline.',
  ],
  formulas=[
   '\\mathbb{E}[(y-\\hat y)^2] = (\\bar f - f)^2 + \\mathbb{E}[(\\hat y - \\bar f)^2] + \\sigma^2',
   '\\mathbf{w}_\\lambda = (\\mathbf{X}^\\top\\mathbf{X} + \\lambda\\mathbf{I})^{-1}\\mathbf{X}^\\top\\mathbf{y}',
   '\\text{1-D: ridge } w = \\frac{a}{1+\\lambda};\\qquad \\text{lasso } w = \\operatorname{sign}(a)\\max(\\lvert a\\rvert - \\tfrac\\lambda2, 0)',
   '\\text{CV}(\\lambda) = \\frac1K\\sum_{k=1}^K \\text{Err}_k(\\lambda)',
  ],
  trampas=['Varianza ≠ sesgo (el sesgo es el sistemático).', 'Underfit = rígido, no flexible.', 'Los folds de K-fold son de **validación**, no de test.', 'Más datos bajan la varianza, no el sesgo.', 'λ grande ⇒ más simple.']),
 dict(slug='clasificacion', n='3', t='Clasificación logística y métricas', href='/clasificacion/logistica/',
  ideas=[
   'Una recta sobre 0/1 no es probabilidad (sale de [0,1], un punto lejano la inclina).',
   'Log-odds lineal ⇒ la probabilidad es **forzosamente** la sigmoide. Cada peso es un **odds ratio** $e^{w_j}$.',
   'Frontera $\\mathbf{w}^\\top\\mathbf{x}+b=0$: **clasificador lineal**. Umbral 0.5 ⇔ $z\\ge0$; el umbral es movible según costos.',
   'Se entrena con **cross-entropy** (MLE Bernoulli, convexa); el error² sobre σ es no convexo y se estanca. Sin forma cerrada ⇒ gradiente.',
   'Clases separables sin regularizar ⇒ $\\Vert\\mathbf{w}\\Vert\\to\\infty$: agregar $\\lambda\\Vert\\mathbf{w}\\Vert^2$.',
   'Accuracy **miente** con desbalance: usar matriz de confusión, precision, recall, F1, ROC/AUC. Bajar el umbral ⇒ recall ↑, precision ↓.',
  ],
  formulas=[
   '\\sigma(z) = \\frac{1}{1+e^{-z}},\\quad \\sigma(0) = \\tfrac12,\\quad \\sigma(-z) = 1-\\sigma(z),\\quad \\sigma\' = \\sigma(1-\\sigma)',
   'J = -\\frac1n\\sum_i\\big[y_i\\log p_i + (1-y_i)\\log(1-p_i)\\big],\\qquad \\nabla_\\mathbf{w}J = \\frac1n\\mathbf{X}^\\top(\\mathbf{p}-\\mathbf{y})',
   '\\text{prec} = \\frac{TP}{TP+FP},\\quad \\text{rec} = \\frac{TP}{TP+FN},\\quad F_1 = \\frac{2PR}{P+R},\\quad \\text{acc} = \\frac{TP+TN}{\\text{total}}',
   'p_k = \\frac{e^{z_k}}{\\sum_j e^{z_j}}\\quad(\\text{softmax}; K=2 \\Rightarrow \\sigma(z_1-z_0)),\\qquad \\partial\\ell/\\partial z_k = p_k - y_k',
  ],
  trampas=['Accuracy = correctas / total (no incorrectas).', 'FN = positivo real declarado negativo.', 'F1 = media **armónica** de precision y recall (queda cerca del menor).', 'El umbral 0.5 no exige clases balanceadas.', 'AUC 0.5 = azar.']),
 dict(slug='generativos', n='4', t='Modelos generativos: Bayes, Naive Bayes, LDA y QDA', href='/generativos/bayes/',
  ideas=[
   '**Generativo:** modela $p(\\mathbf{x}\\mid y)$ y $P(y)$, luego Bayes. **Discriminativo:** $P(y\\mid\\mathbf{x})$ directo.',
   'Regla **MAP**: $\\hat y = \\arg\\max_k \\pi_k\\,p(\\mathbf{x}\\mid y=k)$; la evidencia $p(\\mathbf{x})$ no cambia al ganador. MAP = MLE + prior.',
   'MLE = **contar y promediar**: $\\pi_k = N_k/N$, medias, varianzas, covarianzas.',
   '**Naive Bayes:** independencia condicional; $d$ parámetros en vez de $2^d$; decidir con logs; Laplace evita ceros (MAP); probabilidades sobreconfiadas.',
   '**LDA:** Σ compartida ⇒ el término cuadrático se cancela ⇒ frontera **lineal**, posterior $\\sigma(\\mathbf{w}^\\top\\mathbf{x}+b)$. **QDA:** $\\Sigma_k$ propias ⇒ **cuadrática**, más parámetros.',
   'Pocos datos ⇒ generativo aprende más rápido; muchos datos o supuestos falsos ⇒ discriminativo (Ng y Jordan).',
  ],
  formulas=[
   'P(y=k\\mid\\mathbf{x}) = \\frac{\\pi_k\\,p(\\mathbf{x}\\mid y=k)}{\\sum_j \\pi_j\\,p(\\mathbf{x}\\mid y=j)}',
   'p(w\\mid y=k) = \\frac{\\text{count}(w,k)+\\alpha}{\\text{total}(k)+\\alpha V}',
   'D^2 = (\\mathbf{x}-\\boldsymbol\\mu)^\\top\\Sigma^{-1}(\\mathbf{x}-\\boldsymbol\\mu),\\qquad \\delta_k = \\log\\pi_k - \\tfrac12 D_k^2 - \\tfrac12\\log\\lvert\\Sigma_k\\rvert',
   '\\text{LDA: } \\mathbf{w} = \\Sigma^{-1}(\\boldsymbol\\mu_1-\\boldsymbol\\mu_0),\\qquad \\text{1-D: } x^* = \\frac{\\mu_0+\\mu_1}{2} - \\frac{\\sigma^2}{\\mu_1-\\mu_0}\\log\\frac{\\pi_1}{\\pi_0}',
  ],
  trampas=['$\\pi_k = N_k/N$, no $N_k/K$.', 'LDA = Σ **compartida**; QDA = Σ **propia**.', 'Gaussian NB: $2Kd$ números (+ priors).', 'Prior raro ⇒ la frontera se corre hacia la clase rara.']),
 dict(slug='svm', n='5', t='Support Vector Machines', href='/svm/geometria/',
  ideas=[
   'Entre infinitas rectas separadoras, el SVM elige la de **margen máximo**. Etiquetas $y\\in\\{-1,+1\\}$: $y_if(\\mathbf{x}_i)>0$ ⇔ correcto.',
   '$\\mathbf{w}\\perp$ frontera. Margen funcional cambia con la escala; el **geométrico** no. Normalización canónica: $\\min_i y_if(\\mathbf{x}_i)=1$ ⇒ banda $2/\\Vert\\mathbf{w}\\Vert$.',
   'Primal: QP convexo. Restricciones **activas** = vectores de soporte; solo ellos definen la frontera.',
   'Lagrange: $\\alpha_i$ = precio/fuerza de cada restricción. **KKT** + holgura complementaria. Dual: solo productos $\\mathbf{x}_i^\\top\\mathbf{x}_j$ ⇒ kernels.',
   'Margen suave: holguras $\\xi_i$ y precio **C** (C grande = menos regularización, $\\lambda\\propto 1/C$). Dual: $0\\le\\alpha_i\\le C$. Equivale a **hinge + L2**.',
   'Práctica: **estandarizar**, empezar lineal, RBF con C y γ por CV. No da probabilidades (Platt), es binario (OvR/OvO), $O(n^2)$–$O(n^3)$.',
  ],
  formulas=[
   'r = \\frac{\\mathbf{w}^\\top\\mathbf{x}+b}{\\Vert\\mathbf{w}\\Vert},\\qquad \\min_{\\mathbf{w},b}\\ \\tfrac12\\Vert\\mathbf{w}\\Vert^2\\ \\text{s.a.}\\ y_i(\\mathbf{w}^\\top\\mathbf{x}_i+b)\\ge1',
   '\\mathbf{w} = \\sum_i\\alpha_iy_i\\mathbf{x}_i,\\quad \\sum_i\\alpha_iy_i = 0,\\quad \\alpha_i\\big[y_if(\\mathbf{x}_i)-1\\big] = 0',
   '\\max_{\\boldsymbol\\alpha}\\ \\sum_i\\alpha_i - \\tfrac12\\sum_{i,j}\\alpha_i\\alpha_jy_iy_j\\,\\mathbf{x}_i^\\top\\mathbf{x}_j,\\quad b = y_k - \\mathbf{w}^\\top\\mathbf{x}_k',
   '\\min\\ \\tfrac12\\Vert\\mathbf{w}\\Vert^2 + C\\sum_i\\max\\big(0,\\,1-y_if(\\mathbf{x}_i)\\big)',
  ],
  trampas=['Estandarizar **no** es opcional.', 'El SVM es discriminativo, no da $P(y\\mid\\mathbf{x})$.', '$b$ se recupera con un vector de soporte, no se fija en 0.', 'El ½ en ½‖w‖² solo cancela el 2 al derivar.', 'Más vectores de soporte ≠ mejor ajuste.']),
 dict(slug='kernels', n='6', t='Kernels', href='/kernels/truco/',
  ideas=[
   'Una frontera curva es una frontera **plana** en un espacio de features $\\phi$ adecuado (anillos → $x_1^2+x_2^2$).',
   '**Truco:** el dual solo usa $\\mathbf{x}_i^\\top\\mathbf{x}_j$; cámbialo por $K(\\mathbf{x}_i,\\mathbf{x}_j)=\\phi(\\mathbf{x}_i)^\\top\\phi(\\mathbf{x}_j)$ **sin construir** $\\phi$.',
   'Kernel válido ⇔ **simétrico y PSD** (Mercer): Gram con autovalores ≥ 0. Cerrados bajo +, ×, escala positiva.',
   'Lineal (global), polinómico (todos los monomios hasta grado $d$, global), **RBF** (local, $\\phi$ de dimensión infinita).',
   '**γ** del RBF: pequeño ⇒ casi lineal (underfit); grande ⇒ islas (overfit). C y γ juntos por CV; estandarizar.',
   '**Representante:** $f=\\sum_i\\alpha_iK(\\mathbf{x}_i,\\cdot)$. **Kernel ridge** en forma cerrada. Costo $O(n^2)$ memoria, $O(n^3)$ tiempo.',
  ],
  formulas=[
   '(\\mathbf{x}^\\top\\mathbf{z})^2 = \\phi(\\mathbf{x})^\\top\\phi(\\mathbf{z}),\\quad \\phi(\\mathbf{x}) = (x_1^2,\\ \\sqrt2x_1x_2,\\ x_2^2)',
   'K_\\text{poly} = (c+\\mathbf{x}^\\top\\mathbf{x}\')^d,\\qquad K_\\text{RBF} = \\exp(-\\gamma\\Vert\\mathbf{x}-\\mathbf{x}\'\\Vert^2)',
   'e^{2\\gamma\\mathbf{x}^\\top\\mathbf{x}\'} = \\sum_{k=0}^\\infty \\frac{(2\\gamma)^k}{k!}(\\mathbf{x}^\\top\\mathbf{x}\')^k\\quad(\\text{todos los grados ⇒ }\\phi\\text{ infinita})',
   '\\boldsymbol\\alpha = (\\mathbf{K}+\\lambda\\mathbf{I})^{-1}\\mathbf{y},\\qquad f(\\mathbf{x}) = \\sum_i\\alpha_iK(\\mathbf{x}_i,\\mathbf{x})',
  ],
  trampas=['El truco **no** construye $\\phi$.', 'El RBF tiene $\\phi$ infinita que nunca se calcula.', 'Restar kernels puede romper la PSD.', 'Nunca elegir γ por accuracy de entrenamiento.']),
 dict(slug='arboles', n='7', t='Árboles de decisión', href='/arboles/impureza/',
  ideas=[
   'Preguntas $x_j\\le t$ ⇒ **cajas alineadas a los ejes**, una constante por hoja: mayoría (0/1), media (cuadrática), $\\hat p$ (log-loss).',
   '**Impureza = costo de la mejor constante**: entropía (sorpresa promedio, bits), Gini (probabilidad de desacuerdo), error rate.',
   'Ganancia ponderada ≥ 0 por **concavidad**. El error rate es lineal a trozos ⇒ puede dar ganancia 0 a un split útil: crecer con Gini/entropía.',
   '**CART** codicioso: $n-1$ umbrales por feature (puntos medios), mejor split, recursión. Falla en **XOR** ⇒ crecer y podar. Solo importa el orden (sin escalar).',
   '**Poda por costo-complejidad** $R(T)+\\alpha\\lvert T\\rvert$, eslabón más débil, α por CV (regla de 1 SE).',
   'Interpretables pero de **alta varianza** (inestables); MDI sesgada; no extrapolan. Promediar árboles (bagging/random forest) baja la varianza.',
  ],
  formulas=[
   '\\text{Gini} = 1-\\sum_k\\hat p_k^2,\\qquad H = -\\sum_k\\hat p_k\\log_2\\hat p_k,\\qquad \\text{máx. (K clases): } 1-\\tfrac1K,\\ \\log_2K',
   '\\Delta I = I(m) - \\frac{n_L}{n_m}I(L) - \\frac{n_R}{n_m}I(R)',
   'R_\\alpha(T) = R(T) + \\alpha\\lvert T\\rvert,\\qquad g(m) = \\frac{R(m)-R(T_m)}{\\lvert T_m\\rvert-1}',
   '\\text{Ejemplo de 10 puntos: raíz } x_1\\le3.5\\ (\\Delta I = 3/14),\\ \\text{ruta } \\alpha = 2/15,\\ 16/105,\\ 3/14',
  ],
  trampas=['Entropía = sorpresa; Gini = desacuerdo (no al revés).', 'Basta evaluar $n-1$ umbrales.', 'La feature de la raíz no es necesariamente la más importante.', 'Un árbol con defaults está sobreajustado.']),
]

for u in U:
    lines = [
        '---',
        f'title: "Resumen {u["n"]} · {u["t"]}"',
        f'description: "Resumen imprimible de una página: ideas clave, fórmulas y trampas de examen de {u["t"]}."',
        'tableOfContents: false',
        'prev: false',
        'next: false',
        '---',
        '',
        f'<p class="no-print"><a href="/pdf/resumen-{u["slug"]}.pdf" download>⬇ Descargar PDF</a> · <a href="{u["href"]}">ir a la teoría completa</a> · imprime con Ctrl + P</p>',
        '',
        '## Ideas clave',
        '',
        *[f'- {x}' for x in u['ideas']],
        '',
        '## Fórmulas',
        '',
        *[f'$$\n{f}\n$$\n' for f in u['formulas']],
        '## Trampas de examen',
        '',
        *[f'- {x}' for x in u['trampas']],
        '',
    ]
    (OUT / f'{u["slug"]}.mdx').write_text('\n'.join(lines), encoding='utf-8')

idx = [
    '---',
    'title: "Resúmenes imprimibles"',
    'description: "Un resumen de una página por unidad (ideas clave, fórmulas y trampas), para leer o descargar en PDF."',
    '---',
    '',
    'Cada unidad en una sola hoja: lo que **tienes que saber** antes del parcial. Ábrelos en pantalla o descarga el PDF para imprimirlos o leerlos en el celular.',
    '',
    '| Unidad | Resumen | PDF |',
    '| --- | --- | --- |',
    *[f'| {u["n"]} | [{u["t"]}](/resumenes/{u["slug"]}/) | <a href="/pdf/resumen-{u["slug"]}.pdf" download>descargar</a> |' for u in U],
    '',
    '<a href="/pdf/resumenes-completos.pdf" download>⬇ Descargar los 8 resúmenes en un solo PDF</a>',
    '',
]
(OUT.parent / 'resumenes.mdx').write_text('\n'.join(idx), encoding='utf-8')
print('ok', len(U), 'resúmenes'.encode('ascii', 'ignore').decode())

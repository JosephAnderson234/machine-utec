// Material web externo recomendado. Cada página importa los que le tocan.
export type Recurso = { href: string; titulo: string; tipo: string; texto: string };

export const R = {
	// --- Visuales interactivos (MLU-Explain, Amazon) ---
	mluLinReg: { href: 'https://mlu-explain.github.io/linear-regression/', titulo: 'MLU-Explain · Linear Regression', tipo: 'interactivo', texto: 'Recta, residuales y MSE con animaciones al hacer scroll.' },
	mluBiasVar: { href: 'https://mlu-explain.github.io/bias-variance/', titulo: 'MLU-Explain · Bias–Variance', tipo: 'interactivo', texto: 'El trade-off sesgo–varianza con modelos que se reentrenan en vivo.' },
	mluDoubleDescent: { href: 'https://mlu-explain.github.io/double-descent/', titulo: 'MLU-Explain · Double Descent', tipo: 'interactivo', texto: 'Qué pasa más allá de la curva en U (lectura opcional, fuera del parcial).' },
	mluCV: { href: 'https://mlu-explain.github.io/cross-validation/', titulo: 'MLU-Explain · Cross-Validation', tipo: 'interactivo', texto: 'K-fold, leave-one-out y por qué rotar el bloque de validación.' },
	mluSplits: { href: 'https://mlu-explain.github.io/train-test-validation/', titulo: 'MLU-Explain · Train/Test/Validation', tipo: 'interactivo', texto: 'Para qué sirve cada partición y cómo se filtra información.' },
	mluLogReg: { href: 'https://mlu-explain.github.io/logistic-regression/', titulo: 'MLU-Explain · Logistic Regression', tipo: 'interactivo', texto: 'Sigmoide, log-odds y log-loss dibujados paso a paso.' },
	mluPR: { href: 'https://mlu-explain.github.io/precision-recall/', titulo: 'MLU-Explain · Precision & Recall', tipo: 'interactivo', texto: 'Mueve el umbral y mira cómo cambian precision y recall.' },
	mluROC: { href: 'https://mlu-explain.github.io/roc-auc/', titulo: 'MLU-Explain · ROC & AUC', tipo: 'interactivo', texto: 'La curva ROC construida umbral por umbral.' },
	mluTree: { href: 'https://mlu-explain.github.io/decision-tree/', titulo: 'MLU-Explain · Decision Trees', tipo: 'interactivo', texto: 'Entropía, ganancia de información y crecimiento del árbol.' },
	mluRF: { href: 'https://mlu-explain.github.io/random-forest/', titulo: 'MLU-Explain · Random Forest', tipo: 'interactivo', texto: 'El siguiente tema: promediar árboles para bajar la varianza.' },
	r2d3: { href: 'https://r2d3.us/visual-intro-to-machine-learning-part-1/', titulo: 'R2D3 · A visual introduction to ML', tipo: 'interactivo', texto: 'Clásico: casas de SF vs NY clasificadas con un árbol, con scroll animado.' },
	r2d3b: { href: 'https://r2d3.us/visual-intro-to-machine-learning-part-2/', titulo: 'R2D3 · Model tuning & bias–variance', tipo: 'interactivo', texto: 'Segunda parte: profundidad del árbol, sobreajuste y sesgo–varianza.' },
	playground: { href: 'https://playground.tensorflow.org', titulo: 'TensorFlow Playground', tipo: 'demo', texto: 'Entrena un clasificador en vivo; con 0 capas ocultas es una regresión logística.' },
	seeingBayes: { href: 'https://seeing-theory.brown.edu/bayesian-inference/index.html', titulo: 'Seeing Theory · Bayesian inference', tipo: 'interactivo', texto: 'Teorema de Bayes, prior y posterior con visualizaciones de Brown University.' },
	seeingProb: { href: 'https://seeing-theory.brown.edu/', titulo: 'Seeing Theory (Brown)', tipo: 'interactivo', texto: 'Probabilidad y estadística visual: esperanza, varianza, distribuciones.' },

	// --- Videos (StatQuest) ---
	sqIndex: { href: 'https://statquest.org/video_index.html', titulo: 'StatQuest · índice de videos', tipo: 'video', texto: 'Josh Starmer explica cada tema del curso con dibujos; busca el tema en el índice.' },
	sqGD: { href: 'https://www.youtube.com/watch?v=sDv4f4s2SB8', titulo: 'StatQuest · Gradient Descent, Step-by-Step', tipo: 'video', texto: '24 min: descenso de gradiente sobre una recta, a mano.' },
	sqSVM: { href: 'https://www.youtube.com/watch?v=efR1C6CvhmE', titulo: 'StatQuest · SVM Part 1: Main Ideas', tipo: 'video', texto: 'Margen máximo, margen suave y la intuición de los kernels.' },
	sqSVMpl: { href: 'https://www.youtube.com/playlist?list=PLjxj_39hJ6OWZtVJW9XDw766lvbGWoQRj', titulo: 'StatQuest · lista SVM', tipo: 'video', texto: 'Las tres partes: ideas, kernel polinómico y kernel RBF.' },
	sqTree: { href: 'https://www.youtube.com/watch?v=_L39rN6gz7Y', titulo: 'StatQuest · Decision and Classification Trees', tipo: 'video', texto: 'Gini, cómo elegir el primer split y cuándo parar.' },
	g3b1bLA: { href: 'https://www.3blue1brown.com/topics/linear-algebra', titulo: '3Blue1Brown · Essence of linear algebra', tipo: 'video', texto: 'Matrices como transformaciones, producto punto, eigenvectores: la base visual.' },
	g3b1bBayes: { href: 'https://www.3blue1brown.com/lessons/bayes-theorem', titulo: '3Blue1Brown · Bayes theorem', tipo: 'video', texto: 'Bayes con frecuencias naturales: el mismo truco del árbol de 10 000 personas.' },

	// --- Libros y apuntes gratis ---
	islr: { href: 'https://www.statlearning.com/', titulo: 'ISLR / ISLP (James et al.)', tipo: 'libro', texto: 'Libro gratis, citado en las slides. Cap. 3, 4, 5, 6, 8 y 9 cubren todo el parcial.' },
	mml: { href: 'https://mml-book.github.io/', titulo: 'Mathematics for Machine Learning', tipo: 'libro', texto: 'Deisenroth, Faisal y Ong: el libro de la sesión de fundamentos (gratis).' },
	cs229: { href: 'https://cs229.stanford.edu/main_notes.pdf', titulo: 'Stanford CS229 · Lecture notes', tipo: 'apuntes', texto: 'Notas de Andrew Ng: GLMs, modelos generativos, SVM y kernels con derivaciones.' },
	boyd: { href: 'https://web.stanford.edu/~boyd/cvxbook/', titulo: 'Boyd & Vandenberghe · Convex Optimization', tipo: 'libro', texto: 'Cap. 5: dualidad y KKT (la base del SVM dual). Gratis en la web.' },
	mlcc: { href: 'https://developers.google.com/machine-learning/crash-course', titulo: 'Google ML Crash Course', tipo: 'curso', texto: 'Módulos cortos con ejercicios: regresión, clasificación, métricas, regularización.' },

	// --- Documentación práctica (scikit-learn) ---
	skLinear: { href: 'https://scikit-learn.org/stable/modules/linear_model.html', titulo: 'scikit-learn · Linear models', tipo: 'docs', texto: 'OLS, Ridge, Lasso, LogisticRegression: fórmulas y parámetros reales.' },
	skCV: { href: 'https://scikit-learn.org/stable/modules/cross_validation.html', titulo: 'scikit-learn · Cross-validation', tipo: 'docs', texto: 'KFold, cross_val_score, GridSearchCV y el diagrama de partición.' },
	skMetrics: { href: 'https://scikit-learn.org/stable/modules/model_evaluation.html', titulo: 'scikit-learn · Model evaluation', tipo: 'docs', texto: 'Precision, recall, F1, ROC-AUC y cómo elegir la métrica.' },
	skNB: { href: 'https://scikit-learn.org/stable/modules/naive_bayes.html', titulo: 'scikit-learn · Naive Bayes', tipo: 'docs', texto: 'GaussianNB, BernoulliNB, MultinomialNB y el suavizado α.' },
	skLDA: { href: 'https://scikit-learn.org/stable/modules/lda_qda.html', titulo: 'scikit-learn · LDA y QDA', tipo: 'docs', texto: 'Formulación matemática y comparación gráfica de fronteras.' },
	skSVM: { href: 'https://scikit-learn.org/stable/modules/svm.html', titulo: 'scikit-learn · SVM', tipo: 'docs', texto: 'SVC, kernels, C y γ, one-vs-one; incluye la formulación del dual.' },
	skKR: { href: 'https://scikit-learn.org/stable/modules/kernel_ridge.html', titulo: 'scikit-learn · Kernel ridge', tipo: 'docs', texto: 'Kernel ridge regression vs SVR, con el mismo seno de la clase.' },
	skTree: { href: 'https://scikit-learn.org/stable/modules/tree.html', titulo: 'scikit-learn · Decision trees', tipo: 'docs', texto: 'CART, criterios, ccp_alpha y la poda por costo-complejidad.' },
	skPrune: { href: 'https://scikit-learn.org/stable/auto_examples/tree/plot_cost_complexity_pruning.html', titulo: 'scikit-learn · Cost-complexity pruning', tipo: 'docs', texto: 'Ejemplo oficial: la ruta de α y la elección por validación.' },
} satisfies Record<string, Recurso>;

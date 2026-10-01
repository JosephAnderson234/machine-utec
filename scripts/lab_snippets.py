# Fragmentos del laboratorio de Python. Cada bloque entre «# ===» es autocontenido.
# Se prueban con `python scripts/lab_snippets.py` antes de publicarlos en la web.

# === normal
import numpy as np

x = np.array([0., 1., 2., 3., 4.])
y = np.array([1.2, 2.1, 2.9, 4.2, 4.8])

X = np.c_[np.ones_like(x), x]          # columna de unos = sesgo
XtX = X.T @ X
Xty = X.T @ y
w = np.linalg.solve(XtX, Xty)          # ecuaciones normales
r = y - X @ w

print("XᵀX =", XtX.tolist())
print("Xᵀy =", Xty.round(3).tolist())
print("w* (intercepto, pendiente) =", w.round(4))
print("Xᵀr =", (X.T @ r).round(10), " ← ortogonal: ecuaciones normales")
print("R² =", round(1 - (r @ r) / ((y - y.mean()) @ (y - y.mean())), 4))

# TU TURNO: agrega un outlier (x=5, y=0) y mira cuánto cambia la pendiente.

# === gd
import numpy as np

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 50)
y = 3 + 2 * x + rng.normal(0, 1, 50)
X = np.c_[np.ones_like(x), (x - x.mean()) / x.std()]   # estandarizar ayuda a GD

w_exact = np.linalg.solve(X.T @ X, X.T @ y)

def gd(eta, pasos=200):
    w = np.zeros(2)
    for _ in range(pasos):
        grad = -2 * X.T @ (y - X @ w) / len(y)
        w = w - eta * grad
    return w

for eta in [0.01, 0.1, 0.5, 1.1]:
    w = gd(eta)
    print(f"η = {eta:<4}  w = {np.round(w, 3)}  error vs exacta = {np.abs(w - w_exact).max():.2e}")

# TU TURNO: quita la estandarización (usa x sin escalar) y busca el η máximo que no diverge.

# === poly
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(1)
x = rng.uniform(0, 1, 30).reshape(-1, 1)
y = np.sin(2 * np.pi * x).ravel() + rng.normal(0, 0.25, 30)
x_tr, x_va, y_tr, y_va = train_test_split(x, y, test_size=0.5, random_state=0)

rmse = lambda m, a, b: mean_squared_error(b, m.predict(a)) ** 0.5
print("grado | RMSE train | RMSE validación")
for d in [1, 3, 5, 9, 12]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression()).fit(x_tr, y_tr)
    print(f"{d:5d} | {rmse(m, x_tr, y_tr):10.3f} | {rmse(m, x_va, y_va):10.3f}")

m = make_pipeline(PolynomialFeatures(12), StandardScaler(), Ridge(alpha=1e-2)).fit(x_tr, y_tr)
print("grado 12 + ridge(λ=0.01): validación =", round(rmse(m, x_va, y_va), 3))

# TU TURNO: prueba otros λ (1e-4, 1, 10). ¿Cuál deja la validación más baja?

# === ridgelasso
import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, RidgeCV, LassoCV
from sklearn.metrics import mean_squared_error

datos = load_diabetes()
X, y, nombres = datos.data, datos.target, datos.feature_names
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
alphas = np.logspace(-3, 2, 40)

modelos = {
    "OLS": make_pipeline(StandardScaler(), LinearRegression()),
    "ridge": make_pipeline(StandardScaler(), RidgeCV(alphas=alphas, cv=5)),
    "lasso": make_pipeline(StandardScaler(), LassoCV(alphas=alphas, cv=5, max_iter=50000)),
}
for nombre, m in modelos.items():
    m.fit(X_tr, y_tr)
    rmse = mean_squared_error(y_te, m.predict(X_te)) ** 0.5
    coef = m[-1].coef_
    print(f"{nombre:6s} RMSE test = {rmse:5.1f}   pesos en cero: {int(np.sum(np.abs(coef) < 1e-8))}")

lasso = modelos["lasso"][-1]
print("λ elegido por CV (lasso):", round(lasso.alpha_, 4))
print("features descartadas por el lasso:", [c for c, w in zip(nombres, lasso.coef_) if abs(w) < 1e-8])

# === logistica
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score

X, y = load_breast_cancer(return_X_y=True)
y = 1 - y                                   # 1 = maligno (positivo)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, stratify=y, test_size=0.25, random_state=0)
sc = StandardScaler().fit(X_tr)             # escalar con estadísticas de TRAIN
X_tr, X_te = sc.transform(X_tr), sc.transform(X_te)

# regresión logística desde cero: gradiente Xᵀ(p − y)/n
w, b = np.zeros(X.shape[1]), 0.0
for _ in range(3000):
    p = 1 / (1 + np.exp(-(X_tr @ w + b)))
    w -= 0.1 * (X_tr.T @ (p - y_tr) / len(y_tr) + 0.01 * w)
    b -= 0.1 * np.mean(p - y_tr)

p_te = 1 / (1 + np.exp(-(X_te @ w + b)))
sk = LogisticRegression(max_iter=5000).fit(X_tr, y_tr)
print("AUC desde cero:", round(roc_auc_score(y_te, p_te), 4), "· sklearn:", round(roc_auc_score(y_te, sk.predict_proba(X_te)[:, 1]), 4))

for t in [0.5, 0.2]:
    yh = (p_te >= t).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_te, yh).ravel()
    print(f"umbral {t}: TP={tp} FP={fp} FN={fn} TN={tn}  precision={precision_score(y_te, yh):.3f}  recall={recall_score(y_te, yh):.3f}  F1={f1_score(y_te, yh):.3f}")

# === nb
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

correos = [
    "free money now", "win free lottery money", "cheap meds free offer", "claim your free prize now",
    "meeting tomorrow about the project", "please send the report", "project meeting moved to friday",
    "lunch tomorrow with the team", "report draft attached for review", "money transfer for the project budget",
]
etiqueta = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]   # 1 = spam

vec = CountVectorizer()
Xc = vec.fit_transform(correos)
for alpha in [1.0, 0.01]:
    nb = MultinomialNB(alpha=alpha).fit(Xc, etiqueta)
    nuevos = ["free money", "project report tomorrow", "free project lottery"]
    P = nb.predict_proba(vec.transform(nuevos))[:, 1]
    print(f"α = {alpha}:", {t: round(float(p), 3) for t, p in zip(nuevos, P)})

print("prior estimado π_spam =", round(float(nb.class_count_[1] / nb.class_count_.sum()), 2))

# === ldaqda
import numpy as np
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis, QuadraticDiscriminantAnalysis
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(3)
# clase 0 compacta; clase 1 ancha e inclinada → covarianzas distintas
X0 = rng.multivariate_normal([0, 0], [[0.15, 0], [0, 0.15]], 200)
X1 = rng.multivariate_normal([0.6, 0.4], [[3.0, 1.5], [1.5, 2.5]], 200)
X = np.r_[X0, X1]
y = np.r_[np.zeros(200), np.ones(200)]

for nombre, m in [("Naive Bayes", GaussianNB()), ("LDA", LinearDiscriminantAnalysis()),
                  ("QDA", QuadraticDiscriminantAnalysis()), ("Logística", LogisticRegression())]:
    acc = cross_val_score(m, X, y, cv=5).mean()
    print(f"{nombre:12s} accuracy CV = {acc:.3f}")

lda = LinearDiscriminantAnalysis().fit(X, y)
print("w de LDA =", lda.coef_.round(3), " (frontera lineal: wᵀx + b = 0)")

# === svm
import numpy as np
from sklearn.svm import SVC
from sklearn.datasets import load_breast_cancer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score

# el ejemplo de tres puntos de la clase (+ un punto lejano)
X = np.array([[2, 0], [0, 2], [0, 0], [3, 3]]); y = np.array([1, 1, -1, 1])
svm = SVC(kernel="linear", C=1e6).fit(X, y)
print("vectores de soporte:", svm.support_, "→ el (3,3) no está")
print("αᵢyᵢ =", svm.dual_coef_.round(3), " w =", svm.coef_.round(3), " b =", svm.intercept_.round(3))

Xb, yb = load_breast_cancer(return_X_y=True)
for C in [0.01, 1, 100]:
    m = make_pipeline(StandardScaler(), SVC(kernel="linear", C=C))
    acc = cross_val_score(m, Xb, yb, cv=5).mean()
    nsv = m.fit(Xb, yb)[-1].n_support_.sum()
    print(f"C = {C:<6} accuracy CV = {acc:.3f}   vectores de soporte = {nsv}")

# === kernels
import numpy as np
from sklearn.datasets import make_circles
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score
from sklearn.metrics.pairwise import rbf_kernel

x, z = np.array([1., 2.]), np.array([3., -1.])
phi = lambda v: np.array([1, np.sqrt(2) * v[0], np.sqrt(2) * v[1], v[0]**2, v[1]**2, np.sqrt(2) * v[0] * v[1]])
print("φ(x)ᵀφ(z) =", round(float(phi(x) @ phi(z)), 6), " (1 + xᵀz)² =", (1 + x @ z) ** 2)

X, y = make_circles(n_samples=300, noise=0.1, factor=0.4, random_state=0)
K = rbf_kernel(X[:40], gamma=1.0)
print("autovalor mínimo de la Gram RBF:", f"{np.linalg.eigvalsh(K).min():.2e}", "(≥ 0 ⇒ kernel válido)")

print("kernel      | train | CV")
for nombre, m in [("lineal", SVC(kernel="linear")), ("poly 2", SVC(kernel="poly", degree=2, coef0=1)),
                  ("RBF γ=0.01", SVC(kernel="rbf", gamma=0.01)), ("RBF γ=1", SVC(kernel="rbf", gamma=1)),
                  ("RBF γ=2000", SVC(kernel="rbf", gamma=2000))]:
    tr = m.fit(X, y).score(X, y)
    print(f"{nombre:12s}| {tr:.3f} | {cross_val_score(m, X, y, cv=5).mean():.3f}")

# === arbol
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text

X = np.array([[1, 4], [2, 1], [3, 9], [6, 5], [8, 3], [4, 8], [5, 10], [7, 2], [9, 6], [10, 7]])
y = np.array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1])

tree = DecisionTreeClassifier(random_state=0).fit(X, y)
print(export_text(tree, feature_names=["x1", "x2"]))
print("hojas:", tree.get_n_leaves(), " importancias (MDI):", tree.feature_importances_.round(4))

ruta = tree.cost_complexity_pruning_path(X, y)
print("ruta de poda α:", ruta.ccp_alphas.round(4), "→ 0, 2/15, 16/105, 3/14")
for a in ruta.ccp_alphas:
    t = DecisionTreeClassifier(random_state=0, ccp_alpha=a).fit(X, y)
    print(f"α = {a:.4f}: {t.get_n_leaves()} hojas, accuracy train = {t.score(X, y):.1f}")

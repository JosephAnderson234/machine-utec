import { rng } from './math';

export type Kernel = (a: number[], b: number[]) => number;
export const linearK: Kernel = (a, b) => a[0] * b[0] + a[1] * b[1];
export const polyK = (deg: number, c = 1): Kernel => (a, b) => Math.pow(a[0] * b[0] + a[1] * b[1] + c, deg);
export const rbfK = (gamma: number): Kernel => (a, b) => Math.exp(-gamma * ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2));

/**
 * SMO simplificado (Platt / apuntes CS229) para el dual del SVM de margen suave:
 * max Σα − ½ΣΣ αᵢαⱼyᵢyⱼK(xᵢ,xⱼ)  s.a. 0 ≤ αᵢ ≤ C, Σαᵢyᵢ = 0.
 */
export function smo(X: number[][], y: number[], C: number, K: Kernel, tol = 1e-3, maxPasses = 12, seed = 1) {
	const n = X.length;
	const G = X.map((a) => X.map((b) => K(a, b)));
	const alpha = new Array(n).fill(0);
	let b = 0;
	const r = rng(seed);
	const f = (i: number) => {
		let s = b;
		for (let k = 0; k < n; k++) if (alpha[k] > 0) s += alpha[k] * y[k] * G[k][i];
		return s;
	};
	let passes = 0,
		iter = 0;
	while (passes < maxPasses && iter < 400) {
		iter++;
		let changed = 0;
		for (let i = 0; i < n; i++) {
			const Ei = f(i) - y[i];
			if ((y[i] * Ei < -tol && alpha[i] < C) || (y[i] * Ei > tol && alpha[i] > 0)) {
				let j = Math.floor(r.next() * (n - 1));
				if (j >= i) j++;
				const Ej = f(j) - y[j];
				const ai = alpha[i],
					aj = alpha[j];
				let L: number, H: number;
				if (y[i] !== y[j]) {
					L = Math.max(0, aj - ai);
					H = Math.min(C, C + aj - ai);
				} else {
					L = Math.max(0, ai + aj - C);
					H = Math.min(C, ai + aj);
				}
				if (L === H) continue;
				const eta = 2 * G[i][j] - G[i][i] - G[j][j];
				if (eta >= 0) continue;
				let nj = aj - (y[j] * (Ei - Ej)) / eta;
				nj = Math.min(H, Math.max(L, nj));
				if (Math.abs(nj - aj) < 1e-6) continue;
				const ni = ai + y[i] * y[j] * (aj - nj);
				alpha[i] = ni;
				alpha[j] = nj;
				const b1 = b - Ei - y[i] * (ni - ai) * G[i][i] - y[j] * (nj - aj) * G[i][j];
				const b2 = b - Ej - y[i] * (ni - ai) * G[i][j] - y[j] * (nj - aj) * G[j][j];
				b = ni > 0 && ni < C ? b1 : nj > 0 && nj < C ? b2 : (b1 + b2) / 2;
				changed++;
			}
		}
		passes = changed === 0 ? passes + 1 : 0;
	}
	// b promediado sobre vectores de soporte libres (0 < α < C), como recomienda la teoría
	const free = alpha.map((a, i) => [a, i] as const).filter(([a]) => a > 1e-6 && a < C - 1e-6);
	if (free.length) {
		let s = 0;
		for (const [, k] of free) {
			let fk = 0;
			for (let i = 0; i < n; i++) if (alpha[i] > 0) fk += alpha[i] * y[i] * G[i][k];
			s += y[k] - fk;
		}
		b = s / free.length;
	}
	const decision = (x: number[]) => {
		let s = b;
		for (let i = 0; i < n; i++) if (alpha[i] > 1e-8) s += alpha[i] * y[i] * K(X[i], x);
		return s;
	};
	return { alpha, b, decision };
}

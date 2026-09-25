// Utilidades numéricas pequeñas para los playgrounds (todo corre en el navegador).

/** Generador pseudoaleatorio con semilla (mulberry32): mismos datos en cada visita. */
export function rng(seed: number) {
	let a = seed >>> 0;
	const next = () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const normal = () => {
		let u = 0;
		while (u === 0) u = next();
		const v = next();
		return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	};
	return { next, normal, uniform: (lo: number, hi: number) => lo + (hi - lo) * next() };
}

export const sigmoid = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const range = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
export const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0);
export const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);
export const fmt = (v: number, d = 3) => (Number.isFinite(v) ? (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(2) : v.toFixed(d)) : '∞');

/** Resuelve A x = b con eliminación gaussiana y pivoteo parcial. */
export function solve(A: number[][], b: number[]): number[] {
	const n = b.length;
	const M = A.map((r, i) => [...r, b[i]]);
	for (let c = 0; c < n; c++) {
		let p = c;
		for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
		[M[c], M[p]] = [M[p], M[c]];
		const piv = M[c][c] || 1e-12;
		for (let r = c + 1; r < n; r++) {
			const f = M[r][c] / piv;
			if (f === 0) continue;
			for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
		}
	}
	const x = new Array(n).fill(0);
	for (let r = n - 1; r >= 0; r--) {
		let s = M[r][n];
		for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
		x[r] = s / (M[r][r] || 1e-12);
	}
	return x;
}

/** Mínimos cuadrados con ridge opcional: (XᵀX + λI') w = Xᵀy (sin penalizar la columna 0 si noBias0). */
export function ridge(X: number[][], y: number[], lambda = 0, penalizeFirst = false): number[] {
	const d = X[0].length;
	const A = Array.from({ length: d }, () => new Array(d).fill(0));
	const b = new Array(d).fill(0);
	for (let i = 0; i < X.length; i++) {
		const xi = X[i];
		for (let j = 0; j < d; j++) {
			b[j] += xi[j] * y[i];
			for (let k = 0; k < d; k++) A[j][k] += xi[j] * xi[k];
		}
	}
	for (let j = 0; j < d; j++) if (j > 0 || penalizeFirst) A[j][j] += lambda;
	A[0][0] += 1e-10;
	return solve(A, b);
}

/** Rasgos polinómicos de x ∈ [0,1] reescalados a [-1,1] para condicionar mejor. */
export const polyRow = (x: number, deg: number) => Array.from({ length: deg + 1 }, (_, k) => Math.pow(2 * x - 1, k));
export const polyEval = (w: number[], x: number) => w.reduce((s, wk, k) => s + wk * Math.pow(2 * x - 1, k), 0);

/** Datos y = sin(2πx) + ruido, x uniforme en [0,1]. */
export function sineData(n: number, noise: number, seed: number) {
	const r = rng(seed);
	return Array.from({ length: n }, () => {
		const x = r.next();
		return { x, y: Math.sin(2 * Math.PI * x) + noise * r.normal() };
	});
}

export function rmse(pred: number[], y: number[]) {
	return Math.sqrt(mean(pred.map((p, i) => (p - y[i]) ** 2)));
}

/** Densidad gaussiana 1-D. */
export const gauss = (x: number, mu: number, s: number) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

/** Pinta un campo escalar f(x,y) a un dataURL (para usar como <image> dentro de un SVG). */
export function heatmap(
	f: (x: number, y: number) => number,
	xd: [number, number],
	yd: [number, number],
	color: (v: number) => [number, number, number, number],
	res = 90,
): string {
	if (typeof document === 'undefined') return '';
	const c = document.createElement('canvas');
	c.width = res;
	c.height = res;
	const ctx = c.getContext('2d');
	if (!ctx) return '';
	const img = ctx.createImageData(res, res);
	for (let j = 0; j < res; j++) {
		const y = yd[1] - ((j + 0.5) / res) * (yd[1] - yd[0]);
		for (let i = 0; i < res; i++) {
			const x = xd[0] + ((i + 0.5) / res) * (xd[1] - xd[0]);
			const [r, g, b, a] = color(f(x, y));
			const o = (j * res + i) * 4;
			img.data[o] = r;
			img.data[o + 1] = g;
			img.data[o + 2] = b;
			img.data[o + 3] = a;
		}
	}
	ctx.putImageData(img, 0, 0);
	return c.toDataURL();
}

/** Mapa de probabilidad: 0 → cian (clase 0), 1 → naranja (clase 1), 0.5 → transparente. */
export function probColor(p: number): [number, number, number, number] {
	const t = clamp(p, 0, 1);
	const a = Math.round(Math.abs(t - 0.5) * 2 * 120);
	return t >= 0.5 ? [236, 150, 70, a] : [80, 190, 215, a];
}

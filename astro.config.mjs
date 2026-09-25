// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [[rehypeKatex, { strict: false }]],
		}),
	},
	integrations: [
		starlight({
			title: 'CS3061 · ML',
			description: 'Web de estudio interactiva para la primera parte de Machine Learning (UTEC 2026-II).',
			locales: { root: { label: 'Español', lang: 'es' } },
			customCss: ['@fontsource-variable/inter', '@fontsource-variable/jetbrains-mono', 'katex/dist/katex.min.css', './src/styles/custom.css'],
			components: { Head: './src/components/Head.astro' },
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 2 },
			expressiveCode: { themes: ['github-dark-dimmed', 'github-light'], styleOverrides: { borderRadius: '12px' } },
			sidebar: [
				{
					label: 'Inicio',
					items: [
						{ label: 'Cómo usar esta web', slug: 'index' },
						{ label: 'Mapa conceptual del curso', slug: 'mapa', badge: { text: 'interactivo', variant: 'tip' } },
						{ label: 'Formulario (cheat sheet)', slug: 'formulario' },
						{ label: 'Recursos web recomendados', slug: 'recursos' },
					],
				},
				{
					label: '0 · Fundamentos',
					items: [
						{ label: '¿Qué es aprender de datos?', slug: 'fundamentos/intro' },
						{ label: 'Las matemáticas que usarás', slug: 'fundamentos/matematicas' },
					],
				},
				{
					label: '1 · Regresión lineal',
					items: [
						{ label: 'Modelo, costo y ecuaciones normales', slug: 'regresion/modelo' },
						{ label: 'Descenso de gradiente', slug: 'regresion/gradiente' },
						{ label: 'Métricas, outliers y polinomios', slug: 'regresion/evaluacion' },
					],
				},
				{
					label: '2 · Regularización',
					items: [
						{ label: 'Sesgo–varianza', slug: 'regularizacion/sesgo-varianza' },
						{ label: 'Ridge y lasso', slug: 'regularizacion/ridge-lasso' },
						{ label: 'Validación cruzada', slug: 'regularizacion/validacion-cruzada' },
					],
				},
				{
					label: '3 · Clasificación logística',
					items: [
						{ label: 'Sigmoide, odds y frontera', slug: 'clasificacion/logistica' },
						{ label: 'Cross-entropy y entrenamiento', slug: 'clasificacion/entrenamiento' },
						{ label: 'Matriz de confusión, F1 y ROC', slug: 'clasificacion/metricas' },
						{ label: 'Softmax (multiclase)', slug: 'clasificacion/softmax' },
					],
				},
				{
					label: '4 · Modelos generativos',
					items: [
						{ label: 'Bayes, prior y MAP', slug: 'generativos/bayes' },
						{ label: 'Naive Bayes', slug: 'generativos/naive-bayes' },
						{ label: 'LDA y QDA', slug: 'generativos/lda-qda' },
					],
				},
				{
					label: '5 · SVM',
					items: [
						{ label: 'Geometría y margen', slug: 'svm/geometria' },
						{ label: 'Lagrange, KKT y el dual', slug: 'svm/dual' },
						{ label: 'Margen suave y hinge', slug: 'svm/margen-suave' },
					],
				},
				{
					label: '6 · Kernels',
					items: [
						{ label: 'El truco del kernel', slug: 'kernels/truco' },
						{ label: 'Zoo de kernels y kernel ridge', slug: 'kernels/practica' },
					],
				},
				{
					label: '7 · Árboles de decisión',
					items: [
						{ label: 'Impureza y ganancia', slug: 'arboles/impureza' },
						{ label: 'CART paso a paso', slug: 'arboles/cart' },
						{ label: 'Poda, importancia e inestabilidad', slug: 'arboles/poda' },
					],
				},
				{
					label: '8 · Examen',
					items: [
						{ label: 'Banco de preguntas (oficial)', slug: 'examen/banco' },
						{ label: 'Simulacro extra', slug: 'examen/simulacro' },
						{ label: 'Flashcards', slug: 'examen/flashcards' },
					],
				},
			],
		}),
		react(),
	],
});

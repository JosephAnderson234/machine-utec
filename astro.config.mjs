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
			description: 'Web de estudio interactiva para la Machine Learning (parcial y final) (UTEC 2026-II).',
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
						{ label: '¿Qué modelo uso? (guía)', slug: 'guia-modelos', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'Casos de estudio completos', slug: 'casos', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'Glosario inglés ↔ español', slug: 'glosario', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'Formulario (cheat sheet)', slug: 'formulario' },
						{ label: 'Recursos web recomendados', slug: 'recursos' },
					],
				},
				{
					label: 'Final · unidades 8–13',
					items: [
						{ label: 'Ruta del final (empieza aquí)', slug: 'final', badge: { text: 'final', variant: 'danger' } },
						{
							label: '8 · Ensambles',
							items: [
								{ label: '¿Por qué gana el equipo?', slug: 'ensambles/equipos' },
								{ label: 'Bagging y random forest', slug: 'ensambles/bagging' },
								{ label: 'Boosting y stacking', slug: 'ensambles/boosting' },
							],
						},
						{
							label: '9 · Clustering',
							items: [
								{ label: 'k-means a mano', slug: 'clustering/kmeans' },
								{ label: '¿Cuántos grupos?', slug: 'clustering/cuantos-grupos' },
								{ label: 'GMM, DBSCAN y jerárquico', slug: 'clustering/otras-formas' },
							],
						},
						{
							label: '10 · Reducción de dimensión',
							items: [
								{ label: '¿Por qué menos dimensiones?', slug: 'reduccion/por-que' },
								{ label: 'PCA', slug: 'reduccion/pca' },
								{ label: 'SVD y cuántas componentes', slug: 'reduccion/svd-componentes' },
								{ label: 'LDA, análisis factorial y NMF', slug: 'reduccion/lda-fa-nmf' },
								{ label: 't-SNE, UMAP y no lineales', slug: 'reduccion/tsne-umap' },
							],
						},
						{
							label: '11 · Redes neuronales I',
							items: [
								{ label: 'La neurona y el muro del XOR', slug: 'redes/neurona' },
								{ label: 'Capas: mezclar y doblar', slug: 'redes/capas' },
								{ label: 'Pérdidas y backpropagation', slug: 'redes/backprop' },
							],
						},
						{
							label: '12 · Redes neuronales II',
							items: [
								{ label: 'Tasa de aprendizaje', slug: 'redes/tasa-aprendizaje' },
								{ label: 'Momentum, Adam y batches', slug: 'redes/optimizadores' },
								{ label: 'Inicializar y regularizar', slug: 'redes/entrenar-bien' },
							],
						},
						{
							label: '13 · MLOps',
							items: [
								{ label: 'Reproducibilidad', slug: 'mlops/reproducibilidad' },
								{ label: 'Despliegue sin sorpresas', slug: 'mlops/despliegue' },
								{ label: 'Monitoreo y reentreno', slug: 'mlops/monitoreo' },
							],
						},
					],
				},
				{
					label: 'Parcial · unidades 0–7',
					collapsed: true,
					items: [
						{
							label: '0 · Fundamentos', collapsed: true,
							items: [
								{ label: '¿Qué es aprender de datos?', slug: 'fundamentos/intro' },
								{ label: 'Las matemáticas que usarás', slug: 'fundamentos/matematicas' },
							],
						},
						{
							label: '1 · Regresión lineal', collapsed: true,
							items: [
								{ label: 'Modelo, costo y ecuaciones normales', slug: 'regresion/modelo' },
								{ label: 'Descenso de gradiente', slug: 'regresion/gradiente' },
								{ label: 'Métricas, outliers y polinomios', slug: 'regresion/evaluacion' },
							],
						},
						{
							label: '2 · Regularización', collapsed: true,
							items: [
								{ label: 'Sesgo–varianza', slug: 'regularizacion/sesgo-varianza' },
								{ label: 'Ridge y lasso', slug: 'regularizacion/ridge-lasso' },
								{ label: 'Validación cruzada', slug: 'regularizacion/validacion-cruzada' },
							],
						},
						{
							label: '3 · Clasificación logística', collapsed: true,
							items: [
								{ label: 'Sigmoide, odds y frontera', slug: 'clasificacion/logistica' },
								{ label: 'Cross-entropy y entrenamiento', slug: 'clasificacion/entrenamiento' },
								{ label: 'Matriz de confusión, F1 y ROC', slug: 'clasificacion/metricas' },
								{ label: 'Softmax (multiclase)', slug: 'clasificacion/softmax' },
							],
						},
						{
							label: '4 · Modelos generativos', collapsed: true,
							items: [
								{ label: 'Bayes, prior y MAP', slug: 'generativos/bayes' },
								{ label: 'Naive Bayes', slug: 'generativos/naive-bayes' },
								{ label: 'LDA y QDA', slug: 'generativos/lda-qda' },
							],
						},
						{
							label: '5 · SVM', collapsed: true,
							items: [
								{ label: 'Geometría y margen', slug: 'svm/geometria' },
								{ label: 'Lagrange, KKT y el dual', slug: 'svm/dual' },
								{ label: 'Margen suave y hinge', slug: 'svm/margen-suave' },
							],
						},
						{
							label: '6 · Kernels', collapsed: true,
							items: [
								{ label: 'El truco del kernel', slug: 'kernels/truco' },
								{ label: 'Zoo de kernels y kernel ridge', slug: 'kernels/practica' },
							],
						},
						{
							label: '7 · Árboles de decisión', collapsed: true,
							items: [
								{ label: 'Impureza y ganancia', slug: 'arboles/impureza' },
								{ label: 'CART paso a paso', slug: 'arboles/cart' },
								{ label: 'Poda, importancia e inestabilidad', slug: 'arboles/poda' },
							],
						},
					],
				},
				{
					label: 'Práctica',
					items: [
						{ label: 'Laboratorio de Python (en el navegador)', slug: 'laboratorio', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'Guía de los notebooks del curso', slug: 'notebooks', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'Resúmenes imprimibles (PDF)', slug: 'resumenes', badge: { text: 'nuevo', variant: 'success' } },
						{
							label: 'Resúmenes por unidad',
							collapsed: true,
							items: ['fundamentos', 'regresion', 'regularizacion', 'clasificacion', 'generativos', 'svm', 'kernels', 'arboles', 'ensambles', 'clustering', 'reduccion', 'redes', 'mlops'].map((u) => ({ slug: `resumenes/${u}` })),
						},
					],
				},
				{
					label: 'Examen',
					items: [
						{ label: 'Banco de preguntas (oficial)', slug: 'examen/banco' },
						{ label: 'Modo examen cronometrado', slug: 'examen/modo-examen', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'Generador de ejercicios', slug: 'examen/generador', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'Explícalo con tus palabras', slug: 'examen/explicalo', badge: { text: 'nuevo', variant: 'success' } },
						{ label: 'Simulacro extra (parcial)', slug: 'examen/simulacro' },
						{ label: 'Simulacro del final', slug: 'examen/simulacro-final', badge: { text: 'final', variant: 'danger' } },
						{ label: 'Flashcards (repaso espaciado)', slug: 'examen/flashcards' },
					],
				},
			],
		}),
		react(),
	],
});

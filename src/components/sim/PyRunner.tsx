import { useState } from 'react';

const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/';

type Py = {
	runPythonAsync: (c: string) => Promise<unknown>;
	loadPackage: (p: string[]) => Promise<void>;
	setStdout: (o: { batched: (s: string) => void }) => void;
	setStderr: (o: { batched: (s: string) => void }) => void;
};
declare global {
	interface Window {
		loadPyodide?: (o: { indexURL: string }) => Promise<Py>;
		__pyPromise?: Promise<Py>;
		__pyPkgs?: Set<string>;
	}
}

/** Carga Pyodide una sola vez para toda la página (todas las celdas comparten el intérprete). */
function getPy(onStatus: (s: string) => void): Promise<Py> {
	if (window.__pyPromise) return window.__pyPromise;
	window.__pyPromise = new Promise<Py>((resolve, reject) => {
		onStatus('Descargando Python (≈ 10 MB, solo la primera vez)…');
		const s = document.createElement('script');
		s.src = PYODIDE + 'pyodide.js';
		s.onload = async () => {
			try {
				const py = await window.loadPyodide!({ indexURL: PYODIDE });
				window.__pyPkgs = new Set();
				resolve(py);
			} catch (e) {
				reject(e);
			}
		};
		s.onerror = () => reject(new Error('No se pudo descargar Pyodide (¿sin internet?)'));
		document.head.appendChild(s);
	});
	return window.__pyPromise;
}

/** Celda de Python ejecutable en el navegador (Pyodide). Editable, con numpy / scikit-learn bajo demanda. */
export default function PyRunner({ code, titulo = 'Python en vivo', paquetes = ['numpy'], alto = 14 }: { code: string; titulo?: string; paquetes?: string[]; alto?: number }) {
	const [src, setSrc] = useState(code.trim());
	const [out, setOut] = useState('');
	const [estado, setEstado] = useState<'idle' | 'cargando' | 'corriendo' | 'ok' | 'error'>('idle');
	const [msg, setMsg] = useState('');

	const correr = async () => {
		setOut('');
		setEstado('cargando');
		try {
			const py = await getPy(setMsg);
			const falta = paquetes.filter((p) => !window.__pyPkgs!.has(p));
			if (falta.length) {
				setMsg(`Instalando ${falta.join(', ')}… (solo la primera vez)`);
				await py.loadPackage(falta);
				falta.forEach((p) => window.__pyPkgs!.add(p));
			}
			setEstado('corriendo');
			setMsg('Ejecutando…');
			let buf = '';
			py.setStdout({ batched: (s) => (buf += s + '\n') });
			py.setStderr({ batched: (s) => (buf += s + '\n') });
			const t0 = performance.now();
			const res = await py.runPythonAsync(src);
			if (res !== undefined && res !== null) buf += String(res) + '\n';
			setOut(buf || '(sin salida: usa print)');
			setEstado('ok');
			setMsg(`Listo en ${((performance.now() - t0) / 1000).toFixed(2)} s`);
		} catch (e) {
			const err = String(e instanceof Error ? e.message : e);
			// muestra solo la parte útil del traceback de Python
			const i = err.lastIndexOf('File "<exec>"');
			setOut(i >= 0 ? err.slice(i) : err);
			setEstado('error');
			setMsg('Error');
		}
	};

	return (
		<div className="pg not-content pyrunner">
			<div className="pg-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
				<h4>🐍 {titulo}</h4>
				<span style={{ color: 'var(--pg-muted)', fontSize: '0.8rem' }}>{paquetes.join(' · ')}</span>
			</div>
			<textarea
				spellCheck={false}
				value={src}
				onChange={(e) => setSrc(e.target.value)}
				onKeyDown={(e) => {
					if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
						e.preventDefault();
						correr();
					}
					if (e.key === 'Tab') {
						e.preventDefault();
						const t = e.currentTarget;
						const a = t.selectionStart;
						setSrc(src.slice(0, a) + '    ' + src.slice(t.selectionEnd));
						requestAnimationFrame(() => (t.selectionStart = t.selectionEnd = a + 4));
					}
				}}
				style={{ minHeight: `${alto * 1.55}em`, fontFamily: 'var(--__sl-font-mono)', fontSize: '0.8rem', lineHeight: 1.55, whiteSpace: 'pre', tabSize: 4 }}
			/>
			<div className="pg-row" style={{ alignItems: 'center' }}>
				<button className="primary" onClick={correr} disabled={estado === 'cargando' || estado === 'corriendo'}>
					{estado === 'cargando' || estado === 'corriendo' ? 'Ejecutando…' : '▶ Ejecutar (Ctrl+Enter)'}
				</button>
				<button onClick={() => { setSrc(code.trim()); setOut(''); setEstado('idle'); setMsg(''); }}>Restaurar código</button>
				{msg && <span style={{ color: estado === 'error' ? 'var(--pg-bad)' : 'var(--pg-muted)', fontSize: '0.85rem' }}>{msg}</span>}
			</div>
			{out && (
				<pre className="pg-code" style={{ padding: '0.7rem 0.9rem', whiteSpace: 'pre-wrap', color: estado === 'error' ? 'var(--pg-bad)' : 'var(--sl-color-gray-1)', maxHeight: '22rem' }}>
					{out}
				</pre>
			)}
		</div>
	);
}

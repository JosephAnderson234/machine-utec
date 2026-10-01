import { useEffect, useMemo, useState } from 'react';
import Rich from '../ui/Rich';
import { load, save } from '../ui/storage';
import { POOL } from '../../data/pool';
import confetti from 'canvas-confetti';

type Item = { q: string; opts: string[]; ok: number; why?: string; tema: string; href: string; fuente: string };
type Intento = { fecha: string; nota: number; n: number; correctas: number; seg: number };

const TEMAS = [...new Set(POOL.map((b) => b.tema))];
const FUENTES = [...new Set(POOL.map((b) => b.fuente))];

function barajar<T>(xs: T[]): T[] {
	const a = [...xs];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

/** Simulacro cronometrado con preguntas al azar de toda la web, nota vigesimal y diagnóstico por tema. */
export default function ExamMode() {
	const [fase, setFase] = useState<'config' | 'examen' | 'resultado'>('config');
	const [n, setN] = useState(20);
	const [min, setMin] = useState(25);
	const [temas, setTemas] = useState<string[]>(TEMAS);
	const [fuentes, setFuentes] = useState<string[]>(FUENTES);
	const [items, setItems] = useState<Item[]>([]);
	const [resp, setResp] = useState<(number | null)[]>([]);
	const [restante, setRestante] = useState(0);
	const [inicio, setInicio] = useState(0);
	const [hist, setHist] = useState<Intento[]>([]);

	useEffect(() => setHist(load<Intento[]>('examen:hist', [])), []);

	const disponibles = useMemo(
		() =>
			POOL.filter((b) => temas.includes(b.tema) && fuentes.includes(b.fuente)).flatMap((b) =>
				b.items.map((it) => ({ ...it, tema: b.tema, href: b.href, fuente: b.fuente })),
			),
		[temas, fuentes],
	);

	const empezar = () => {
		const sel = barajar(disponibles)
			.slice(0, n)
			.map((it) => {
				if (it.opts.length <= 2) return it;
				const orden = barajar(it.opts.map((_, i) => i));
				return { ...it, opts: orden.map((i) => it.opts[i]), ok: orden.indexOf(it.ok) };
			});
		setItems(sel);
		setResp(sel.map(() => null));
		setRestante(min * 60);
		setInicio(Date.now());
		setFase('examen');
		window.scrollTo({ top: (document.querySelector('.examen-root') as HTMLElement)?.offsetTop ?? 0, behavior: 'smooth' });
	};

	const entregar = () => {
		const correctas = items.filter((it, i) => resp[i] === it.ok).length;
		const nota = Math.round((20 * correctas) / items.length * 10) / 10;
		const seg = Math.round((Date.now() - inicio) / 1000);
		const h = [{ fecha: new Date().toLocaleString('es-PE'), nota, n: items.length, correctas, seg }, ...hist].slice(0, 8);
		setHist(h);
		save('examen:hist', h);
		setFase('resultado');
		if (nota >= 16) confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
	};

	useEffect(() => {
		if (fase !== 'examen') return;
		const id = setInterval(() => setRestante((r) => r - 1), 1000);
		return () => clearInterval(id);
	}, [fase]);
	useEffect(() => {
		if (fase === 'examen' && restante <= 0 && items.length) entregar();
	}, [restante, fase]);

	const toggle = (xs: string[], x: string, set: (v: string[]) => void) => set(xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

	if (fase === 'config')
		return (
			<div className="pg not-content examen-root">
				<h4>Configura tu simulacro</h4>
				<p className="pg-sub">Preguntas al azar de toda la web ({POOL.reduce((a, b) => a + b.items.length, 0)} en total), con opciones barajadas. Nota en escala vigesimal. Las explicaciones aparecen al final, no durante el examen.</p>
				<div className="pg-row">
					<label className="pg-field">
						<span>
							nº de preguntas <b>{Math.min(n, disponibles.length)}</b>
						</span>
						<input type="range" min={5} max={40} step={5} value={n} onChange={(e) => { const v = Number(e.target.value); setN(v); setMin(Math.round(v * 1.25)); }} />
					</label>
					<label className="pg-field">
						<span>
							tiempo <b>{min} min</b>
						</span>
						<input type="range" min={5} max={60} step={1} value={min} onChange={(e) => setMin(Number(e.target.value))} />
					</label>
				</div>
				<span className="lane-label">Temas</span>
				<div className="pg-seg">
					{TEMAS.map((t) => (
						<button key={t} className={temas.includes(t) ? 'active' : ''} onClick={() => toggle(temas, t, setTemas)}>{t}</button>
					))}
					<button onClick={() => setTemas(temas.length === TEMAS.length ? [] : TEMAS)}>{temas.length === TEMAS.length ? 'ninguno' : 'todos'}</button>
				</div>
				<span className="lane-label">Origen de las preguntas</span>
				<div className="pg-seg">
					{FUENTES.map((f) => (
						<button key={f} className={fuentes.includes(f) ? 'active' : ''} onClick={() => toggle(fuentes, f, setFuentes)}>{f}</button>
					))}
				</div>
				<div className="pg-row" style={{ alignItems: 'center' }}>
					<button className="primary" disabled={disponibles.length === 0} onClick={empezar}>Empezar examen</button>
					<span style={{ color: 'var(--pg-muted)' }}>{disponibles.length} preguntas disponibles con estos filtros</span>
				</div>
				{hist.length > 0 && (
					<div>
						<span className="lane-label">Tus últimos intentos</span>
						<div className="pg-scroll">
							<table>
								<thead>
									<tr><th>fecha</th><th>nota /20</th><th>correctas</th><th>tiempo</th></tr>
								</thead>
								<tbody>
									{hist.map((h, i) => (
										<tr key={i}>
											<td>{h.fecha}</td>
											<td style={{ color: h.nota >= 11 ? 'var(--pg-ok)' : 'var(--pg-bad)', fontWeight: 700 }}>{h.nota}</td>
											<td>{h.correctas}/{h.n}</td>
											<td>{mmss(h.seg)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		);

	if (fase === 'examen') {
		const contestadas = resp.filter((r) => r !== null).length;
		return (
			<div className="pg not-content examen-root">
				<div className="pg-row" style={{ justifyContent: 'space-between', position: 'sticky', top: '4.2rem', zIndex: 5, background: 'var(--pg-surface)', padding: '0.5rem 0', borderBottom: '1px solid var(--pg-border)' }}>
					<h4>Examen en curso</h4>
					<span className="mono" style={{ fontSize: '1.3rem', fontWeight: 700, color: restante < 60 ? 'var(--pg-bad)' : 'var(--sl-color-accent)' }}>⏱ {mmss(restante)}</span>
					<span style={{ color: 'var(--pg-muted)' }}>{contestadas}/{items.length} respondidas</span>
					<button className="primary" onClick={() => { if (contestadas === items.length || confirm(`Te faltan ${items.length - contestadas} preguntas. ¿Entregar igual?`)) entregar(); }}>Entregar</button>
				</div>
				{items.map((it, i) => (
					<div key={i} className="card-item">
						<div style={{ color: 'var(--sl-color-gray-1)' }}>
							<b>{i + 1}.</b> <Rich text={it.q} />
						</div>
						<div className="quiz" style={{ marginTop: '0.6rem' }}>
							<div className="opts">
								{it.opts.map((o, k) => (
									<button key={k} className={resp[i] === k ? 'active' : ''} onClick={() => setResp((prev) => prev.map((r, j) => (j === i ? k : r)))}>
										{String.fromCharCode(97 + k)}) <Rich text={o} />
									</button>
								))}
							</div>
						</div>
					</div>
				))}
				<button className="primary" onClick={entregar}>Entregar examen</button>
			</div>
		);
	}

	// resultado
	const correctas = items.filter((it, i) => resp[i] === it.ok).length;
	const nota = Math.round((20 * correctas) / items.length * 10) / 10;
	const porTema = [...new Set(items.map((it) => it.tema))].map((t) => {
		const xs = items.map((it, i) => ({ it, i })).filter(({ it }) => it.tema === t);
		const ok = xs.filter(({ it, i }) => resp[i] === it.ok).length;
		return { t, ok, total: xs.length, href: xs[0].it.href };
	}).sort((a, b) => a.ok / a.total - b.ok / b.total);
	return (
		<div className="pg not-content examen-root">
			<h4>Resultado</h4>
			<div className="pg-stats">
				<div className="pg-stat"><span className="k">nota (vigesimal)</span><span className="v" style={{ fontSize: '2rem', color: nota >= 11 ? 'var(--pg-ok)' : 'var(--pg-bad)' }}>{nota}</span></div>
				<div className="pg-stat"><span className="k">correctas</span><span className="v">{correctas}/{items.length}</span></div>
				<div className="pg-stat"><span className="k">tiempo usado</span><span className="v">{mmss(Math.round((Date.now() - inicio) / 1000))}</span></div>
			</div>
			<span className="lane-label">Diagnóstico por tema (de más débil a más fuerte)</span>
			<div className="kv" style={{ gridTemplateColumns: '12rem 1fr 4rem', alignItems: 'center' }}>
				{porTema.map((p) => (
					<div key={p.t} style={{ display: 'contents' }}>
						<a href={p.href}>{p.t}</a>
						<div className="bar-h"><i style={{ width: `${(100 * p.ok) / p.total}%`, background: p.ok / p.total >= 0.7 ? 'var(--pg-ok)' : p.ok / p.total >= 0.5 ? 'var(--pg-warn)' : 'var(--pg-bad)' }} /></div>
						<span>{p.ok}/{p.total}</span>
					</div>
				))}
			</div>
			{porTema[0] && porTema[0].ok / porTema[0].total < 0.7 && (
				<div className="pg-note warn">
					Repasa primero <a href={porTema[0].href}><b>{porTema[0].t}</b></a>: es donde más fallaste. Usa sus simuladores y el <a href="/examen/generador/">generador de ejercicios</a>.
				</div>
			)}
			<div className="pg-row">
				<button className="primary" onClick={() => setFase('config')}>Otro intento</button>
			</div>
			<span className="lane-label">Revisión</span>
			{items.map((it, i) => {
				const ok = resp[i] === it.ok;
				return (
					<div key={i} className={`card-item ${ok ? 'ok' : 'bad'}`}>
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
							<span className="chip">{it.tema} · {it.fuente}</span>
							<span style={{ color: ok ? 'var(--pg-ok)' : 'var(--pg-bad)', fontWeight: 700 }}>{ok ? '✔' : resp[i] === null ? '— sin responder' : '✘'}</span>
						</div>
						<div style={{ marginTop: '0.4rem', color: 'var(--sl-color-gray-1)' }}>
							<b>{i + 1}.</b> <Rich text={it.q} />
						</div>
						<div style={{ fontSize: '0.88rem', marginTop: '0.4rem' }}>
							{resp[i] !== null && !ok && (
								<div style={{ color: 'var(--pg-bad)' }}>
									Tu respuesta: <Rich text={it.opts[resp[i]!]} />
								</div>
							)}
							<div style={{ color: 'var(--pg-ok)' }}>
								Correcta: <Rich text={it.opts[it.ok]} />
							</div>
						</div>
						{it.why && (
							<div className="pg-note" style={{ marginTop: '0.5rem' }}>
								<Rich text={it.why} /> <a href={it.href}>repasar →</a>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

import { useMemo, useState } from 'react';
import { GLOSARIO } from '../../data/glosario';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const TEMAS = ['Todos', ...new Set(GLOSARIO.map((g) => g.t))];

/** Glosario inglés ↔ español con búsqueda instantánea (sin tildes) y filtro por tema. */
export default function Glossary() {
	const [q, setQ] = useState('');
	const [tema, setTema] = useState('Todos');
	const [modo, setModo] = useState<'en' | 'es'>('en');
	const lista = useMemo(() => {
		const k = norm(q.trim());
		return GLOSARIO.filter((g) => (tema === 'Todos' || g.t === tema) && (!k || norm(`${g.en} ${g.es} ${g.def}`).includes(k))).sort((a, b) =>
			(modo === 'en' ? a.en : a.es).localeCompare(modo === 'en' ? b.en : b.es, 'es'),
		);
	}, [q, tema, modo]);
	const mark = (s: string) => {
		const k = q.trim();
		if (!k) return s;
		const i = norm(s).indexOf(norm(k));
		if (i < 0) return s;
		return (
			<>
				{s.slice(0, i)}
				<mark style={{ background: 'color-mix(in srgb, var(--sl-color-accent) 30%, transparent)', color: 'inherit', borderRadius: 3 }}>{s.slice(i, i + k.length)}</mark>
				{s.slice(i + k.length)}
			</>
		);
	};
	return (
		<div className="pg not-content">
			<div className="pg-row">
				<label className="pg-field" style={{ flex: '2 1 16rem' }}>
					<span>buscar (en inglés o español)</span>
					<input type="text" value={q} placeholder="p. ej. recall, holgura, lasso, verosimilitud…" onChange={(e) => setQ(e.target.value)} autoFocus />
				</label>
				<label className="pg-field" style={{ flex: '1 1 10rem' }}>
					<span>tema</span>
					<select value={tema} onChange={(e) => setTema(e.target.value)}>
						{TEMAS.map((t) => <option key={t}>{t}</option>)}
					</select>
				</label>
				<div className="pg-seg">
					<button className={modo === 'en' ? 'active' : ''} onClick={() => setModo('en')}>Ordenar por inglés</button>
					<button className={modo === 'es' ? 'active' : ''} onClick={() => setModo('es')}>por español</button>
				</div>
			</div>
			<span style={{ color: 'var(--pg-muted)', fontSize: '0.85rem' }}>{lista.length} de {GLOSARIO.length} términos</span>
			<div className="card-list">
				{lista.map((g) => (
					<div key={g.en} className="card-item">
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'baseline' }}>
							<span>
								<b style={{ fontSize: '1rem' }}>{mark(modo === 'en' ? g.en : g.es)}</b>
								<span style={{ color: 'var(--pg-muted)' }}> · {mark(modo === 'en' ? g.es : g.en)}</span>
							</span>
							<span className="chip">{g.t}</span>
						</div>
						<div style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
							{mark(g.def)} <a href={g.href}>ver tema →</a>
						</div>
					</div>
				))}
				{!lista.length && <div className="pg-note">Sin resultados. Prueba con otra palabra o quita el filtro de tema.</div>}
			</div>
		</div>
	);
}

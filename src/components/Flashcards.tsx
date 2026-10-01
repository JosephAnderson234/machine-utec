import { useEffect, useMemo, useState } from 'react';
import Rich from './ui/Rich';
import { load, save } from './ui/storage';

export type Card = { t: string; f: string; b: string }; // tema, frente, reverso

/** Repaso espaciado (cajas de Leitner): caja 0 = nueva; cada acierto sube de caja y aleja el próximo repaso. */
type Est = { box: number; due: number };
type Estado = Record<string, Est>;
const KEY = 'flashcards:v2';
const DIA = 24 * 3600 * 1000;
const INTERVALO = [0, 0, 1, 3, 7, 16]; // días según la caja (1 = repasar en esta sesión)
const NOMBRE = ['nueva', 'aprendiendo', '1 día', '3 días', '7 días', '16 días'];

function migrar(): Estado {
	// convierte el progreso de la versión anterior («la sé» / «repasar»)
	const v1 = load<Record<string, 'ok' | 'rep'>>('flashcards:v1', {});
	const out: Estado = {};
	for (const [f, s] of Object.entries(v1)) out[f] = s === 'ok' ? { box: 2, due: Date.now() + DIA } : { box: 1, due: 0 };
	return out;
}

export default function Flashcards({ cards }: { cards: Card[] }) {
	const temas = useMemo(() => ['Todos', ...new Set(cards.map((c) => c.t))], [cards]);
	const [tema, setTema] = useState('Todos');
	const [modo, setModo] = useState<'hoy' | 'todas'>('hoy');
	const [st, setSt] = useState<Estado>({});
	const [flip, setFlip] = useState(false);
	const [i, setI] = useState(0);
	const [ahora, setAhora] = useState(0);
	const [sesion, setSesion] = useState({ vistas: 0, bien: 0 });

	useEffect(() => {
		const s = load<Estado | null>(KEY, null) ?? migrar();
		setSt(s);
		save(KEY, s);
		setAhora(Date.now());
		const id = setInterval(() => setAhora(Date.now()), 15000); // las «otra vez» reaparecen al minuto
		return () => clearInterval(id);
	}, []);

	const est = (c: Card): Est => st[c.f] ?? { box: 0, due: 0 };
	const delTema = cards.filter((c) => tema === 'Todos' || c.t === tema);
	const pendientes = delTema.filter((c) => est(c).due <= ahora);
	// primero las que están aprendiendo (caja baja), luego nuevas, luego el resto
	const mazo = (modo === 'hoy' ? pendientes : delTema).slice().sort((a, b) => {
		const ea = est(a),
			eb = est(b);
		const ka = ea.box === 0 ? 1.5 : ea.box,
			kb = eb.box === 0 ? 1.5 : eb.box;
		return ka - kb || ea.due - eb.due;
	});
	const cur = mazo.length ? mazo[i % mazo.length] : null;
	const porCaja = [0, 1, 2, 3, 4, 5].map((b) => delTema.filter((c) => est(c).box === b).length);
	const dominadas = delTema.filter((c) => est(c).box >= 4).length;

	const responder = (r: 'otra' | 'bien' | 'facil') => {
		if (!cur) return;
		const e = est(cur);
		const box = r === 'otra' ? 1 : Math.min(5, Math.max(2, e.box + (r === 'facil' ? 2 : 1)));
		const due = r === 'otra' ? Date.now() + 60 * 1000 : Date.now() + INTERVALO[box] * DIA;
		const next = { ...st, [cur.f]: { box, due } };
		setSt(next);
		save(KEY, next);
		setSesion((s) => ({ vistas: s.vistas + 1, bien: s.bien + (r === 'otra' ? 0 : 1) }));
		setFlip(false);
		// en «hoy» la tarjeta sale del mazo (vuelve cuando vence): el índice ya apunta a la siguiente
		if (modo === 'todas') setI((x) => x + 1);
		setAhora(Date.now());
	};

	return (
		<div className="pg not-content">
			<div className="pg-row" style={{ justifyContent: 'space-between' }}>
				<h4>Flashcards con repaso espaciado</h4>
				<span style={{ color: 'var(--pg-muted)' }}>
					{pendientes.length} para hoy · {dominadas}/{delTema.length} dominadas
				</span>
			</div>
			<div className="kv" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
				{porCaja.map((n, b) => (
					<div key={b} style={{ display: 'block' }}>
						<div style={{ height: 46, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
							<div style={{ width: '70%', height: `${Math.max(4, (42 * n) / Math.max(1, delTema.length))}px`, borderRadius: 6, background: b >= 4 ? 'var(--pg-ok)' : b === 0 ? 'var(--pg-muted)' : 'var(--sl-color-accent)', opacity: 0.8 }} />
						</div>
						<div style={{ fontSize: '0.72rem', color: 'var(--pg-muted)' }}>{NOMBRE[b]}</div>
						<div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--sl-color-white)' }}>{n}</div>
					</div>
				))}
			</div>
			<div className="pg-row">
				<select value={tema} onChange={(e) => { setTema(e.target.value); setI(0); setFlip(false); }}>
					{temas.map((t) => <option key={t}>{t}</option>)}
				</select>
				<div className="pg-seg">
					<button className={modo === 'hoy' ? 'active' : ''} onClick={() => { setModo('hoy'); setI(0); setFlip(false); }}>Repaso de hoy</button>
					<button className={modo === 'todas' ? 'active' : ''} onClick={() => { setModo('todas'); setI(0); setFlip(false); }}>Todas</button>
				</div>
				<button onClick={() => { if (confirm('¿Borrar todo el progreso de las flashcards?')) { setSt({}); save(KEY, {}); setI(0); } }}>Reiniciar progreso</button>
			</div>
			{cur ? (
				<>
					<button className="flash-card" onClick={() => setFlip(!flip)} aria-label="voltear tarjeta">
						<span className="side">
							{cur.t} · caja: {NOMBRE[est(cur).box]} · {flip ? 'respuesta' : 'pregunta'} · {(i % mazo.length) + 1}/{mazo.length}
						</span>
						<span className="face" key={`${cur.f}-${flip}`}>
							<Rich text={flip ? cur.b : cur.f} />
						</span>
						{!flip && <span className="side" style={{ marginTop: '0.75rem' }}>piensa la respuesta y haz clic para voltear</span>}
					</button>
					{flip ? (
						<div className="pg-row" style={{ justifyContent: 'center' }}>
							<button onClick={() => responder('otra')} style={{ borderColor: 'var(--pg-bad)' }}>✘ Otra vez <small style={{ color: 'var(--pg-muted)' }}>(en 1 min)</small></button>
							<button onClick={() => responder('bien')} style={{ borderColor: 'var(--pg-ok)' }}>✔ La sabía <small style={{ color: 'var(--pg-muted)' }}>({INTERVALO[Math.min(5, Math.max(2, est(cur).box + 1))]} d)</small></button>
							<button onClick={() => responder('facil')}>⚡ Fácil <small style={{ color: 'var(--pg-muted)' }}>({INTERVALO[Math.min(5, Math.max(2, est(cur).box + 2))]} d)</small></button>
						</div>
					) : (
						<div className="pg-row" style={{ justifyContent: 'center' }}>
							<button onClick={() => setFlip(true)} className="primary">Ver respuesta</button>
							<button onClick={() => { setI((x) => x + 1); setFlip(false); }}>Saltar →</button>
						</div>
					)}
				</>
			) : (
				<div className="pg-note ok">
					🎉 No te quedan tarjetas para hoy en este tema{sesion.vistas ? ` (repasaste ${sesion.vistas}, ${sesion.bien} bien)` : ''}. Vuelve mañana, o usa «Todas» para repasar igual.
				</div>
			)}
			<div className="pg-note">
				Cómo funciona: cada tarjeta está en una caja. «La sabía» la sube de caja y la aleja (1 → 3 → 7 → 16 días); «Otra vez» la regresa al inicio y vuelve en un minuto. Así repasas más lo que más te cuesta. El progreso se guarda en este navegador.
			</div>
		</div>
	);
}

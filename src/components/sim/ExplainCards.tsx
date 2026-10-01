import { useEffect, useState } from 'react';
import Rich from '../ui/Rich';
import { load, save } from '../ui/storage';
import { ABIERTAS } from '../../data/explicalo';

type Estado = Record<number, { txt: string; visto: boolean; marcas: boolean[] }>;
const KEY = 'explicalo:v1';
const TEMAS = ['Todos', ...new Set(ABIERTAS.map((a) => a.t))];

/** «Explícalo con tus palabras»: escribe, compara con la respuesta modelo y marca los puntos clave que cubriste. */
export default function ExplainCards() {
	const [st, setSt] = useState<Estado>({});
	const [tema, setTema] = useState('Todos');
	useEffect(() => setSt(load<Estado>(KEY, {})), []);
	const upd = (i: number, f: (e: Estado[number]) => Estado[number]) => {
		setSt((prev) => {
			const cur = prev[i] ?? { txt: '', visto: false, marcas: ABIERTAS[i].puntos.map(() => false) };
			const next = { ...prev, [i]: f(cur) };
			save(KEY, next);
			return next;
		});
	};
	const lista = ABIERTAS.map((a, i) => ({ a, i })).filter(({ a }) => tema === 'Todos' || a.t === tema);
	const hechas = Object.values(st).filter((e) => e.visto).length;
	const pts = Object.entries(st).reduce((s, [i, e]) => s + (e.visto ? e.marcas.filter(Boolean).length : 0), 0);
	const ptsTot = Object.entries(st).reduce((s, [i, e]) => s + (e.visto ? ABIERTAS[+i].puntos.length : 0), 0);

	return (
		<div className="pg not-content">
			<div className="pg-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
				<h4>Explícalo con tus palabras</h4>
				<span style={{ color: 'var(--pg-muted)' }}>
					{hechas}/{ABIERTAS.length} respondidas · cobertura {ptsTot ? Math.round((100 * pts) / ptsTot) : 0}%{' '}
					<button onClick={() => { setSt({}); save(KEY, {}); }}>Reiniciar</button>
				</span>
			</div>
			<div className="pg-row">
				<label className="pg-field" style={{ maxWidth: '16rem' }}>
					<span>tema</span>
					<select value={tema} onChange={(e) => setTema(e.target.value)}>
						{TEMAS.map((t) => <option key={t}>{t}</option>)}
					</select>
				</label>
			</div>
			<div className="card-list">
				{lista.map(({ a, i }) => {
					const e = st[i];
					const cub = e?.marcas.filter(Boolean).length ?? 0;
					return (
						<div key={i} className={`card-item ${e?.visto ? (cub / a.puntos.length >= 0.75 ? 'ok' : 'bad') : ''}`}>
							<div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
								<span className="chip">{a.t}</span>
								<a href={a.href} style={{ fontSize: '0.8rem' }}>repasar →</a>
							</div>
							<p style={{ margin: '0.5rem 0', color: 'var(--sl-color-white)', fontWeight: 600 }}>
								<Rich text={a.q} />
							</p>
							<textarea
								rows={4}
								placeholder="Escribe tu explicación aquí, como si se la contaras a un compañero…"
								value={e?.txt ?? ''}
								onChange={(ev) => upd(i, (c) => ({ ...c, txt: ev.target.value }))}
								style={{ width: '100%', fontSize: '0.9rem' }}
							/>
							{!e?.visto ? (
								<button style={{ marginTop: '0.5rem' }} disabled={!e?.txt?.trim()} onClick={() => upd(i, (c) => ({ ...c, visto: true }))}>
									Comparar con la respuesta modelo
								</button>
							) : (
								<div style={{ marginTop: '0.6rem' }}>
									<div className="pg-note">
										<b>Respuesta modelo:</b> <Rich text={a.modelo} />
									</div>
									<div style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}>
										<span className="lane-label">¿Cubriste estos puntos? Marca los que sí ({cub}/{a.puntos.length})</span>
										{a.puntos.map((p, k) => (
											<label key={k} style={{ display: 'block', margin: '0.2rem 0', cursor: 'pointer' }}>
												<input type="checkbox" checked={e.marcas[k]} onChange={() => upd(i, (c) => ({ ...c, marcas: c.marcas.map((m, j) => (j === k ? !m : m)) }))} /> {p}
											</label>
										))}
									</div>
									<button style={{ marginTop: '0.4rem' }} onClick={() => upd(i, (c) => ({ ...c, visto: false, marcas: a.puntos.map(() => false) }))}>
										Volver a intentar
									</button>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

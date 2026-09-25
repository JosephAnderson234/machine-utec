import { useState } from 'react';
import { Slider, Stat } from '../ui/Plot';
import Tex from '../ui/Tex';

// Conteos: nº de correos de cada clase que contienen la palabra (40 spam, 60 ham), como en la slide.
const WORDS: { w: string; s: number; h: number }[] = [
	{ w: 'free', s: 32, h: 6 },
	{ w: 'money', s: 28, h: 5 },
	{ w: 'now', s: 22, h: 18 },
	{ w: 'lottery', s: 12, h: 0 },
	{ w: 'meeting', s: 4, h: 30 },
	{ w: 'project', s: 2, h: 27 },
	{ w: 'report', s: 3, h: 24 },
];
const NS = 40,
	NH = 60;

/** Filtro de spam con Naive Bayes (Bernoulli): prior × likelihoods, log-espacio y suavizado de Laplace. */
export default function NaiveBayesSpam() {
	const [on, setOn] = useState<Record<string, boolean>>({ free: true, money: true, now: true });
	const [alpha, setAlpha] = useState(0);
	const [absent, setAbsent] = useState(false);
	const [prior, setPrior] = useState(40);

	const pS = (c: number) => (c + alpha) / (NS + 2 * alpha);
	const pH = (c: number) => (c + alpha) / (NH + 2 * alpha);
	const factors = WORDS.filter((x) => on[x.w] || absent).map((x) => ({
		w: x.w,
		present: !!on[x.w],
		s: on[x.w] ? pS(x.s) : 1 - pS(x.s),
		h: on[x.w] ? pH(x.h) : 1 - pH(x.h),
	}));
	const ps = prior / 100,
		ph = 1 - ps;
	const scoreS = factors.reduce((a, f) => a * f.s, ps);
	const scoreH = factors.reduce((a, f) => a * f.h, ph);
	const post = scoreS + scoreH > 0 ? scoreS / (scoreS + scoreH) : NaN;
	const logS = Math.log(ps) + factors.reduce((a, f) => a + Math.log(f.s), 0);
	const logH = Math.log(ph) + factors.reduce((a, f) => a + Math.log(f.h), 0);
	const zeroed = factors.some((f) => f.h === 0 || f.s === 0);

	return (
		<div className="pg not-content">
			<h4>¿Es spam? Naive Bayes a mano</h4>
			<p className="pg-sub">Haz clic en las palabras para ponerlas o quitarlas del correo. Cada likelihood es solo una fracción contada: correos de la clase que contienen la palabra / correos de la clase.</p>
			<div className="pg-seg">
				{WORDS.map((x) => (
					<button key={x.w} className={on[x.w] ? 'active' : ''} onClick={() => setOn({ ...on, [x.w]: !on[x.w] })}>
						{on[x.w] ? '✓ ' : ''}
						{x.w}
					</button>
				))}
			</div>
			<div className="pg-row">
				<Slider label="suavizado de Laplace α" value={alpha} min={0} max={3} step={0.1} onChange={setAlpha} />
				<Slider label="prior π_spam" value={prior} min={1} max={99} step={1} onChange={setPrior} show={`${prior}%`} />
				<label style={{ margin: 0 }}>
					<input type="checkbox" checked={absent} onChange={(e) => setAbsent(e.target.checked)} /> incluir palabras ausentes (Bernoulli completo)
				</label>
			</div>
			<div className="pg-scroll">
				<table>
					<thead>
						<tr>
							<th>palabra</th>
							<th>en el correo</th>
							<th>p(w | spam)</th>
							<th>p(w | ham)</th>
							<th>voto</th>
						</tr>
					</thead>
					<tbody>
						{WORDS.map((x) => {
							const inc = on[x.w] || absent;
							const s = on[x.w] ? pS(x.s) : 1 - pS(x.s);
							const h = on[x.w] ? pH(x.h) : 1 - pH(x.h);
							return (
								<tr key={x.w} style={{ opacity: inc ? 1 : 0.35 }}>
									<td className="mono">{x.w}</td>
									<td>{on[x.w] ? 'sí' : 'no'}</td>
									<td className="mono">{on[x.w] ? '' : '1 − '}{`(${x.s}+α)/(${NS}+2α)`} = {s.toFixed(3)}</td>
									<td className="mono" style={{ color: h === 0 ? 'var(--pg-bad)' : undefined }}>{on[x.w] ? '' : '1 − '}{`(${x.h}+α)/(${NH}+2α)`} = {h.toFixed(3)}</td>
									<td style={{ color: s > h ? 'var(--pg-c2)' : 'var(--pg-c1)' }}>{inc ? (s > h ? 'spam' : 'ham') : '—'}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<div className="formula">
				<Tex block>{`\\underbrace{${ps.toFixed(2)}${factors.map((f) => `\\cdot ${f.s.toFixed(3)}`).join('')}}_{\\text{score spam}} = ${scoreS.toExponential(3)}\\qquad \\underbrace{${ph.toFixed(2)}${factors.map((f) => `\\cdot ${f.h.toFixed(3)}`).join('')}}_{\\text{score ham}} = ${scoreH.toExponential(3)}`}</Tex>
			</div>
			<div className="pg-stats">
				<Stat k="log score spam" v={Number.isFinite(logS) ? logS.toFixed(2) : '−∞'} />
				<Stat k="log score ham" v={Number.isFinite(logH) ? logH.toFixed(2) : '−∞'} />
				<Stat k="P(spam | palabras)" v={Number.isFinite(post) ? post.toFixed(4) : '—'} color="var(--sl-color-accent)" />
				<Stat k="veredicto" v={logS > logH ? 'SPAM' : 'ham'} />
			</div>
			<div className={`pg-note ${zeroed ? 'bad' : ''}`}>
				{zeroed ? (
					<>«lottery» nunca apareció en ham, así que con α = 0 su likelihood es <b>0</b> y anula todo el producto de ham, por muy «ham» que sean las demás palabras. Sube α: el +α es un <b>prior</b> de α conteos imaginados (estimación MAP) y ninguna probabilidad vuelve a ser 0.</>
				) : (
					<>En la práctica se suman logaritmos (30 factores ≈ 0.1 dan 10⁻³⁰ y se desbordan a 0). El log cambia los números, no el ganador. Ojo: la independencia condicional es falsa («free» y «money» van juntas), así que el 0.99 suele ser <b>sobreconfiado</b>; confía en la etiqueta, no en la probabilidad.</>
				)}
			</div>
		</div>
	);
}

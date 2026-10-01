// Jerga → tooltip en lenguaje simple: subraya la primera aparición de cada término en la página.
import { JERGA } from '../data/jerga';

const SKIP = 'a, code, pre, h1, h2, h3, h4, h5, h6, .katex, .not-content, .pg, button, svg, script, style, summary, .jerga, .sl-heading-wrapper, table th';
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function jerga() {
	const root = document.querySelector('.sl-markdown-content');
	if (!root || root.querySelector('.jerga')) return;
	const def = new Map<string, number>();
	JERGA.forEach(([formas], i) => formas.forEach((f) => def.set(f.toLowerCase(), i)));
	const formas = [...def.keys()].sort((a, b) => b.length - a.length).map(esc);
	const re = new RegExp(`(?<![\p{L}\p{N}-])(${formas.join('|')})(?![\p{L}\p{N}-])`, 'giu');
	const usados = new Set<number>();

	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode: (n) => (n.parentElement?.closest(SKIP) || !n.nodeValue?.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
	});
	const nodos: Text[] = [];
	while (walker.nextNode()) nodos.push(walker.currentNode as Text);

	for (const nodo of nodos) {
		const txt = nodo.nodeValue!;
		re.lastIndex = 0;
		let m: RegExpExecArray | null;
		let corte = 0;
		const frag = document.createDocumentFragment();
		while ((m = re.exec(txt))) {
			const i = def.get(m[1].toLowerCase())!;
			if (usados.has(i)) continue;
			usados.add(i);
			frag.append(txt.slice(corte, m.index));
			const s = document.createElement('span');
			s.className = 'jerga';
			s.tabIndex = 0;
			s.dataset.def = JERGA[i][1];
			s.textContent = m[1];
			frag.append(s);
			corte = m.index + m[1].length;
		}
		if (corte) {
			frag.append(txt.slice(corte));
			nodo.replaceWith(frag);
		}
	}

	// Un único globo flotante, posicionado junto a la palabra
	const tip = document.createElement('div');
	tip.className = 'jerga-tip';
	tip.setAttribute('role', 'tooltip');
	document.body.appendChild(tip);
	let actual: HTMLElement | null = null;
	const mostrar = (el: HTMLElement) => {
		actual = el;
		tip.textContent = el.dataset.def!;
		tip.classList.add('on');
		const r = el.getBoundingClientRect();
		const w = tip.offsetWidth;
		const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
		const arriba = r.top > tip.offsetHeight + 16;
		tip.style.left = `${left + scrollX}px`;
		tip.style.top = `${(arriba ? r.top - tip.offsetHeight - 8 : r.bottom + 8) + scrollY}px`;
	};
	const ocultar = () => {
		actual = null;
		tip.classList.remove('on');
	};
	root.addEventListener('pointerover', (e) => {
		const el = (e.target as HTMLElement).closest<HTMLElement>('.jerga');
		if (el && (e as PointerEvent).pointerType === 'mouse') mostrar(el);
	});
	root.addEventListener('pointerout', (e) => {
		if ((e.target as HTMLElement).closest('.jerga') && (e as PointerEvent).pointerType === 'mouse') ocultar();
	});
	root.addEventListener('click', (e) => {
		const el = (e.target as HTMLElement).closest<HTMLElement>('.jerga');
		if (el) mostrar(el); // el foco ya puede haberlo abierto: clic solo lo asegura
		else ocultar();
	});
	root.addEventListener('focusin', (e) => {
		const el = (e.target as HTMLElement).closest<HTMLElement>('.jerga');
		if (el) mostrar(el);
	});
	root.addEventListener('focusout', ocultar);
	addEventListener('scroll', () => actual && ocultar(), { passive: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', jerga);
else jerga();

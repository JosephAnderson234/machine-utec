"""Extrae las preguntas de todos los <Quiz preguntas={[...]}> de las páginas .mdx a src/data/pool.ts.

Así el modo examen usa exactamente las mismas preguntas (y explicaciones) que la web.
Uso: python scripts/build-pool.py   (ejecutar antes de `astro build` si se editan quizzes)
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DOCS = ROOT / 'src' / 'content' / 'docs'

UNIDADES = {
    'fundamentos': ('Fundamentos', '/fundamentos/intro/'),
    'regresion': ('Regresión lineal', '/regresion/modelo/'),
    'regularizacion': ('Regularización y CV', '/regularizacion/sesgo-varianza/'),
    'clasificacion': ('Logística y métricas', '/clasificacion/logistica/'),
    'generativos': ('Modelos generativos', '/generativos/bayes/'),
    'svm': ('SVM', '/svm/geometria/'),
    'kernels': ('Kernels', '/kernels/truco/'),
    'arboles': ('Árboles', '/arboles/impureza/'),
}
BANCO = {'fund': 'fundamentos', 'reg': 'regresion', 'regu': 'regularizacion', 'clf': 'clasificacion',
         'gen': 'generativos', 'svm': 'svm', 'kern': 'kernels', 'tree': 'arboles'}


def extract_array(s: str, start: int) -> str:
    """Devuelve el texto del arreglo que empieza en s[start] == '[' respetando strings."""
    depth, i, quote = 0, start, None
    while i < len(s):
        c = s[i]
        if quote:
            if c == '\\':
                i += 2
                continue
            if c == quote:
                quote = None
        elif c in "'\"`":
            quote = c
        elif c in '[{(':
            depth += 1
        elif c in ']})':
            depth -= 1
            if depth == 0:
                return s[start:i + 1]
        i += 1
    raise ValueError('arreglo sin cerrar')


bloques = []
for p in sorted(DOCS.rglob('*.mdx')):
    rel = p.relative_to(DOCS).as_posix()
    s = p.read_text(encoding='utf-8')
    for m in re.finditer(r'<Quiz\b', s):
        end_tag = s.find('/>', m.start())
        chunk = s[m.start():end_tag]
        qid = re.search(r'id="([^"]+)"', chunk).group(1)
        k = s.find('preguntas={', m.start())
        arr = extract_array(s, s.find('[', k))
        if qid.startswith('banco-'):
            unidad = BANCO[qid.split('-', 1)[1]]
            fuente = 'banco oficial'
        elif qid.startswith('simulacro'):
            unidad = None
            fuente = 'simulacro'
        else:
            unidad = rel.split('/')[0]
            fuente = 'quiz de la página'
        if unidad in UNIDADES:
            tema, href = UNIDADES[unidad]
        else:
            tema, href = 'Mixto', '/examen/simulacro/'
        bloques.append((tema, href, fuente, qid, arr))

out = [
    '// GENERADO por scripts/build-pool.py a partir de los quizzes de las páginas. No editar a mano.',
    "import type { Pregunta } from '../components/Quiz';",
    '',
    'export type Bloque = { tema: string; href: string; fuente: string; id: string; items: Pregunta[] };',
    '',
    'export const POOL: Bloque[] = [',
]
for tema, href, fuente, qid, arr in bloques:
    out.append(f"\t{{ tema: {tema!r}, href: {href!r}, fuente: {fuente!r}, id: {qid!r}, items: {arr} }},")
out.append('];')
dst = ROOT / 'src' / 'data' / 'pool.ts'
dst.write_text('\n'.join(out) + '\n', encoding='utf-8')
total = sum(arr.count('{ q:') for *_, arr in bloques)
print(f'{len(bloques)} quizzes, ~{total} preguntas -> {dst.relative_to(ROOT)}')

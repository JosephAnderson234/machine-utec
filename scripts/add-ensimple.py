"""Inserta <EnSimple id="..."/> al inicio de cada página de teoría (idempotente)."""
import re, pathlib
DOCS = pathlib.Path(__file__).resolve().parent.parent / 'src/content/docs'
ids = re.findall(r"^\t'([\w/-]+)': \{", (DOCS.parent.parent / 'data/ensimple.ts').read_text(encoding='utf-8'), re.M)
for pid in ids:
    p = DOCS / f'{pid}.mdx'
    s = p.read_text(encoding='utf-8')
    if '<EnSimple' in s:
        continue
    depth = pid.count('/') + 2
    imp = f"import EnSimple from '{'../' * depth}components/EnSimple.astro';\n"
    # tras el frontmatter y el bloque de imports, antes del primer contenido
    fm_end = s.index('---', 3) + 4
    rest = s[fm_end:]
    m = re.match(r'(\s*(?:import [^\n]+\n|\s*\n)*)', rest)
    head, body = rest[:m.end()], rest[m.end():]
    s = s[:fm_end] + head.rstrip('\n') + '\n' + imp + f'\n<EnSimple id="{pid}" />\n\n' + body
    p.write_text(s, encoding='utf-8')
    print('ok', pid)

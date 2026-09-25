"""Reescribe las barras dentro de $...$ en filas de tablas Markdown (GFM las toma como separadores de celda).

\\| -> \\Vert   y   |x| -> \\lvert x\\rvert
Uso: python scripts/fix-table-math.py src/content/docs
"""
import pathlib
import re
import sys

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'src/content/docs')


def fix_math(m: re.Match) -> str:
    t = m.group(0)
    t = t.replace('\\|', '\\Vert ')
    t = re.sub(r'\|([^|$]*)\|', lambda k: '\\lvert ' + k.group(1) + '\\rvert ', t)
    return t


for p in root.rglob('*.mdx'):
    s = p.read_text(encoding='utf-8')
    lines = []
    for line in s.split('\n'):
        if line.lstrip().startswith('|'):
            line = re.sub(r'\$[^$]*\$', fix_math, line)
        lines.append(line)
    new = '\n'.join(lines)
    if new != s:
        p.write_text(new, encoding='utf-8')
        print('arreglado', p)

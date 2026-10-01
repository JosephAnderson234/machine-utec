"""Utilidad: inserta bloques en una página .mdx por ancla (falla si el ancla no existe)."""
import pathlib, sys

def patch(path, ops):
    p = pathlib.Path(path)
    s = p.read_text(encoding='utf-8')
    for kind, anchor, text in ops:
        if anchor not in s:
            sys.exit(f'ANCLA NO ENCONTRADA en {path}: {anchor[:60]!r}')
        if kind == 'after':
            s = s.replace(anchor, anchor + text, 1)
        elif kind == 'before':
            s = s.replace(anchor, text + anchor, 1)
        elif kind == 'replace':
            s = s.replace(anchor, text, 1)
    p.write_text(s, encoding='utf-8')
    print('ok', path)

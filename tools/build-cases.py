"""Render reviewed EN/ES case content into standalone, buildless HTML pages."""
import json
from html import escape
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
CASES = json.loads((ROOT / 'content/cases.json').read_text(encoding='utf-8'))
LABELS = [
    ['Case studies', 'Casos prácticos'], ['AENOR coursework', 'Prácticas formativas de AENOR'],
    ['Training context', 'Contexto formativo'], ['Work carried out', 'Trabajo realizado'],
    ['Assessment rationale', 'Criterio de análisis'], ['Documented output', 'Resultado documentado'],
    ['Scope & limitations', 'Alcance y limitaciones'], ['Supporting work', 'Trabajos asociados'],
    ['Original materials remain private. We can discuss the methodology and which self-authored extracts can be shared after review.', 'Los materiales originales permanecen privados. Podemos comentar la metodología y qué extractos de elaboración propia pueden compartirse tras su revisión.'],
    ['Discuss this work', 'Consultar este trabajo'], ['Context', 'Contexto'], ['Area', 'Área'],
    ['Module', 'Módulo'], ['Materials', 'Materiales'], ['Private · Spanish', 'Privados · Español'],
    ['Project details', 'Detalles del proyecto'], ['Back to case studies', 'Volver a los casos prácticos'],
    ['Back to portfolio', 'Volver al portfolio'], ['Information Security & ISO/IEC 27001', 'Seguridad de la información e ISO/IEC 27001'],
    ['Approach', 'Enfoque']
]
PAIRS = list(LABELS)


def text(pair):
    PAIRS.append(pair)
    return escape(pair[0])


def render(case):
    title = text(case['title'])
    description = text(case['summary'])
    tags = ''.join(f'<li>{text(tag)}</li>' for tag in case['tags'])
    work = ''.join(f'<li>{text(item)}</li>' for item in case['work'])
    deliverables = []
    for item in case['deliverables']:
        subject = quote(f"Portfolio / {case['slug']} / {item[0]}", safe='')
        deliverables.append(f'<div class="deliverable"><span data-icon="file-text"></span><p>{text(item)}</p><a class="text-link" href="mailto:frsciberseguridad@gmail.com?subject={subject}">Discuss this work <span data-icon="arrow-up-right"></span></a></div>')
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | Fabiola Rueda</title><meta name="description" content="{description}"><meta name="robots" content="index, follow"><meta name="theme-color" content="#080e17">
<link rel="canonical" href="https://fabiolars5.github.io/projects/{escape(case['slug'])}.html">
<link rel="icon" href="../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../assets/css/site.css"><link rel="stylesheet" href="../assets/css/isms.css">
<script defer src="../assets/js/icons.js"></script><script defer src="../assets/js/translations.js?v=isms-review-20261031"></script><script defer src="../assets/js/i18n.js"></script><script defer src="../assets/js/site.js"></script></head>
<body id="top"><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap nav-shell"><a class="brand" href="../index.html"><span class="brand-symbol" data-icon="shield-check"></span>Fabiola Rueda</a><div class="language-switch" role="group" aria-label="Language"><button type="button" data-language="en" lang="en" title="English" aria-pressed="true">EN</button><button type="button" data-language="es" lang="es" title="Español" aria-pressed="false">ES</button></div><button class="menu-toggle" type="button" aria-label="Toggle navigation" aria-controls="site-nav" aria-expanded="false"><span data-icon="menu"></span></button><nav class="site-nav" id="site-nav" aria-label="Main navigation"><a href="../index.html#about">Approach</a><a href="../index.html#experience">Experience</a><a href="../projects.html">Case studies</a><a href="../education.html">Education</a><a class="nav-contact" href="../index.html#contact">Let's talk <span aria-hidden="true">↗</span></a></nav></div></header>
<main id="main" class="wrap"><div class="page-intro"><p class="breadcrumb"><a href="../index.html#projects">Case studies</a> / <span>{text(case['area'])}</span></p><p class="eyebrow">AENOR coursework</p><h1>{title}</h1><ul class="tags">{tags}</ul><p>{description}</p></div>
<div class="case-layout"><div><h2>Training context</h2><p>{text(case['context'])}</p><h2>Work carried out</h2><ul class="case-work-list">{work}</ul><h2>Assessment rationale</h2><p>{text(case['reasoning'])}</p><h2>Documented output</h2><p>{text(case['output'])}</p><div class="case-boundary"><h2>Scope &amp; limitations</h2><p>{text(case['boundary'])}</p></div><h2>Supporting work</h2><p class="language-note">Original materials remain private. We can discuss the methodology and which self-authored extracts can be shared after review.</p>{''.join(deliverables)}<p class="case-footer-link"><a class="text-link" href="../projects.html"><span data-icon="arrow-left"></span>Back to case studies</a></p></div>
<aside class="case-meta" aria-label="Project details"><dl><div><dt>Context</dt><dd>AENOR coursework</dd></div><div><dt>Area</dt><dd>{text(case['area'])}</dd></div><div><dt>Module</dt><dd>{escape(case['module'])}</dd></div><div><dt>Materials</dt><dd>Private · Spanish</dd></div></dl></aside></div></main>
<footer class="site-footer"><div class="wrap footer-inner"><p>© 2026 Fabiola Rueda <span aria-hidden="true">/</span> Information Security &amp; ISO/IEC 27001</p><a class="back-to-top" href="../index.html">Back to portfolio <span data-icon="arrow-up-right"></span></a></div></footer></body></html>
'''


if __name__ == '__main__':
    destination = ROOT / 'projects'
    destination.mkdir(exist_ok=True)
    for case in CASES:
        (destination / f"{case['slug']}.html").write_text(render(case), encoding='utf-8')
    (ROOT / 'assets/js/translations-cases.json').write_text(json.dumps(PAIRS, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Rendered {len(CASES)} reviewed case pages and {len(PAIRS)} translation pairs.')

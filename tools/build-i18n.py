"""Extract page copy and compile the local, manually reviewed EN/ES dictionary."""
import json
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class CopyParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ignored = 0
        self.values = []

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.ignored += 1
        if not self.ignored:
            attrs = dict(attrs)
            for key in ('aria-label', 'placeholder', 'alt', 'title'):
                if attrs.get(key):
                    self.add(attrs[key])
            if tag == 'meta' and (attrs.get('name') in ('description', 'twitter:title', 'twitter:description') or attrs.get('property') in ('og:title', 'og:description')):
                self.add(attrs.get('content', ''))

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.ignored = max(0, self.ignored - 1)

    def handle_data(self, value):
        if not self.ignored:
            self.add(value)

    def add(self, value):
        value = ' '.join(value.split())
        if value and any(char.isalpha() for char in value):
            self.values.append(value)


def extract():
    groups = {'presentation': set(), 'documentation': set()}
    for file in [ROOT / 'index.html', ROOT / 'projects.html', ROOT / 'education.html', *sorted((ROOT / 'projects').glob('*.html')), *sorted((ROOT / 'proyectos-paginas').glob('*.html')), *sorted((ROOT / 'grado-paginas').glob('*.html'))]:
        parser = CopyParser()
        parser.feed(file.read_text(encoding='utf-8'))
        group = 'documentation' if file.parent.name in ('proyectos-paginas', 'grado-paginas') else 'presentation'
        groups[group].update(parser.values)
    return {key: sorted(values) for key, values in groups.items()}


if __name__ == '__main__':
    import sys
    if '--extract' in sys.argv:
        groups = extract()
        (ROOT / 'review/i18n-copy.json').write_text(json.dumps(groups, ensure_ascii=False, indent=2), encoding='utf-8')
        print({key: len(values) for key, values in groups.items()})
    else:
        pairs = []
        for file in sorted((ROOT / 'assets/js').glob('translations*.json')):
            pairs.extend(json.loads(file.read_text(encoding='utf-8')))
        (ROOT / 'assets/js/translations.js').write_text('window.PORTFOLIO_TRANSLATIONS = ' + json.dumps(pairs, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
        print(f'Compiled {len(pairs)} translation pairs.')

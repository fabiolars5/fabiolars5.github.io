(() => {
  const normalise = value => value.replace(/\s+/g, ' ').trim();
  const toSpanish = new Map();
  const toEnglish = new Map();
  const spanishFolded = new Map();
  const englishFolded = new Map();
  for (const [english, spanish] of window.PORTFOLIO_TRANSLATIONS || []) {
    toSpanish.set(normalise(english), spanish);
    if (!toEnglish.has(normalise(spanish))) toEnglish.set(normalise(spanish), english);
  }
  for (const [source, target] of toSpanish) spanishFolded.set(source.toLocaleLowerCase(), target);
  for (const [source, target] of toEnglish) englishFolded.set(source.toLocaleLowerCase(), target);
  const sourceText = new WeakMap();
  const sourceAttributes = new WeakMap();
  const textNodes = [];
  const attributes = [];
  const originalLinks = new Map();
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!normalise(node.nodeValue) || node.parentElement.closest('script,style,svg,noscript,[data-no-translate],.language-switch')) continue;
    sourceText.set(node, node.nodeValue);
    textNodes.push(node);
  }
  document.querySelectorAll('[aria-label],[placeholder],[alt],[title],meta[name="description"],meta[name^="twitter:"],meta[property^="og:"]').forEach(element => {
    const values = {};
    for (const name of ['aria-label', 'placeholder', 'alt', 'title']) {
      if (element.hasAttribute(name)) values[name] = element.getAttribute(name);
    }
    if (element.tagName === 'META' && !/^(og:type|og:url|twitter:card)$/.test(element.getAttribute('property') || element.getAttribute('name'))) values.content = element.getAttribute('content');
    if (Object.keys(values).length) {
      sourceAttributes.set(element, values);
      attributes.push(element);
    }
  });
  document.querySelectorAll('a[href]').forEach(link => originalLinks.set(link, link.getAttribute('href')));

  function translate(value, language) {
    const key = normalise(value);
    const dictionary = language === 'es' ? toSpanish : toEnglish;
    const other = language === 'es' ? toEnglish : toSpanish;
    const folded = language === 'es' ? spanishFolded : englishFolded;
    if (dictionary.has(key)) return dictionary.get(key);
    if (other.has(key)) return key;
    if (folded.has(key.toLocaleLowerCase())) return folded.get(key.toLocaleLowerCase());
    if (/^\d+ subjects$/.test(key)) return language === 'es' ? key.replace(' subjects', ' asignaturas') : key;
    if (/^\d+ (collections|collection)$/.test(key)) return language === 'es' ? key.replace('collections', 'colecciones').replace('collection', 'colección') : key;
    if (/^\d+ TOPICS$/.test(key)) return language === 'es' ? key.replace('TOPICS', 'TEMAS') : key;
    if (/^Year \d$/.test(key)) return language === 'es' ? key.replace('Year', 'Curso') : key;
    if (key.startsWith('Request access to ')) return language === 'es' ? 'Solicitar acceso a ' + translate(key.slice(18), language) : key;
    if (key.startsWith('/ ')) return '/ ' + translate(key.slice(2), language);
    const prefix = key.match(/^([⬅🔒]+)\s*(.+)$/u);
    if (prefix) return prefix[1] + ' ' + translate(prefix[2], language);
    for (const separator of [' | ', ' · ', ' — ']) {
      if (key.includes(separator)) return key.split(separator).map(part => translate(part, language)).join(separator);
    }
    const format = key.match(/^(.*?)\s+(\((?:PDF|XLSX|ZIP|CSV|PPTX|MD|TXT|PNG|MTGX|DOCX|SQL)\))$/);
    if (format) return translate(format[1], language) + ' ' + format[2];
    const numbered = key.match(/^(.+?)\s+(\d+)$/);
    if (numbered) return translate(numbered[1], language) + ' ' + numbered[2];
    const arrow = key.match(/^(.*?)\s*([↗➜])$/);
    if (arrow) return translate(arrow[1], language) + ' ' + arrow[2];
    return key;
  }

  function languageFromUrl() {
    const value = new URL(location.href).searchParams.get('lang');
    return ['en', 'es'].includes(value) ? value : null;
  }
  function readPreference() {
    try { return localStorage.getItem('portfolio-language'); } catch { return null; }
  }

  let currentLanguage;
  function setLanguage(language, updateUrl = true) {
    if (!['en', 'es'].includes(language)) return;
    currentLanguage = language;
    for (const node of textNodes) {
      const original = sourceText.get(node);
      const translated = translate(original, language);
      const leading = original.match(/^\s*/)[0];
      const trailing = original.match(/\s*$/)[0];
      node.nodeValue = leading + translated + trailing;
    }
    for (const element of attributes) {
      for (const [name, original] of Object.entries(sourceAttributes.get(element))) {
        if (original) element.setAttribute(name, translate(original, language));
      }
    }
    document.documentElement.lang = language;
    document.querySelectorAll('[lang]').forEach(element => {
      if (element !== document.documentElement && !element.closest('.language-switch')) element.lang = language;
    });
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    for (const [link, original] of originalLinks) {
      if (!original || /^(#|mailto:|tel:|https?:\/\/)/i.test(original)) continue;
      const resolved = new URL(original, location.href);
      resolved.searchParams.set('lang', language);
      const pathname = original.split(/[?#]/)[0];
      link.setAttribute('href', pathname + '?' + resolved.searchParams + resolved.hash);
    }
    try { localStorage.setItem('portfolio-language', language); } catch { }
    if (updateUrl) {
      try {
        const url = new URL(location.href);
        url.searchParams.set('lang', language);
        history.replaceState(null, '', url);
      } catch { }
    }
    document.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail: { language } }));
  }

  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  window.addEventListener('popstate', () => setLanguage(languageFromUrl() || readPreference() || 'en', false));
  window.portfolioI18n = {
    setLanguage,
    getLanguage: () => currentLanguage,
    translate,
    sourceText(element) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let result = '';
      while (walker.nextNode()) result += sourceText.get(walker.currentNode) ?? walker.currentNode.nodeValue;
      return result;
    }
  };
  setLanguage(languageFromUrl() || readPreference() || 'en');
})();

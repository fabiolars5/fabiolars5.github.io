# Fabiola Rueda · IT Security & GRC Portfolio

Professional portfolio focused on information security, ISO/IEC 27001, identity and access management, security operations and automation.

Website: https://fabiolars5.github.io/

## Structure

- `index.html`: professional profile, experience, projects, skills, education and contact.
- Projects has two tabs: **Cybersecurity** and **University projects**. Cybersecurity retains four topic categories; university projects display plain-text subject lists in four year disclosures, without links or additional pages.
- `proyectos-paginas/`: full technical, GRC, AENOR and intelligence documentation.
- `grado-paginas/`: all academic project pages and deliverables.
- `projects.html`: searchable project library and bilingual project summaries.
- `projects/`: six bilingual project summaries.
- `education.html`: university background and complete coursework.
- `assets/`: local styles, JavaScript, icons, font and imagery.
- `tools/build-i18n.py`: local translation bundle compiler.

English is the initial language. The EN / ES selector translates all portfolio pages locally, remembers the preference and carries it through internal navigation. Direct links can select a language using `?lang=es` or `?lang=en`. Original private deliverables remain in Spanish and retain their original access-request links. The CV is available by email request because no downloadable CV was supplied. Public GitHub profile links have been removed from the interface.

Translation pairs are maintained in `assets/js/translations*.json`. After editing them, run `python tools/build-i18n.py` to regenerate the bundled `translations.js`. No translation service or frontend dependency is used.

## Local preview

Open `index.html` directly, or run from the repository directory:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765/index.html. The site has no build step, frontend package dependencies or external font/icon CDN requests.

On Windows, `powershell -ExecutionPolicy Bypass -File .\preview.ps1` starts a hidden local preview server and prints its URL.

## Verification

Pre-publication checks covered all 26 HTML pages in both languages and 60 responsive layouts, with no browser errors or horizontal overflow. Checks also confirmed language persistence, local routes and anchors, asset loading, preservation of 97 project topics and 208 resource links, project tabs, mobile navigation, disclosures, translated library search, reduced motion and offline preview. Local review files are not part of the published site.

## Publishing

The modern design is the single portfolio at the repository root. GitHub Pages configuration is unchanged. Publish approved changes through the existing `main` branch; previous versions remain available in Git history.

## Credits

- Inter by Rasmus Andersson, SIL Open Font License: `assets/fonts/LICENSE.txt`.
- Lucide icons, ISC license: `assets/js/LUCIDE-LICENSE.txt`.
- Generated decorative security image: `assets/images/security-detail.webp`.
- Visual inspiration: https://evargas01.github.io/.

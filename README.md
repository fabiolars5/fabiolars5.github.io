# Information Security & ISO/IEC 27001 Portfolio

Approved information security portfolio, maintained independently from the
private general-portfolio archive. English and Spanish are available throughout.

Website: https://fabiolars5.github.io/

## Preview

Open `index.html` directly in a browser. All pages, images, fonts, icons and
translations are local, so a server and package installation are not required.
Use the EN / ES selector; the chosen language also travels in internal links.

For an HTTP preview on this computer, run `./preview.ps1`. It binds only to
127.0.0.1 and serves this directory, not the backup or original portfolio.
Close that PowerShell session to stop the preview.

## Structure

- `index.html`: business perspective, experience, selected cases, skills,
  credentials and contact.
- `projects.html`: searchable collection of four applied training cases.
- `projects/`: standalone case pages, with clear scope and limitations.
- `education.html`: AENOR training and both degrees' coursework.
- `content/cases.json`: reviewed EN / ES case copy, not original course files.
- `assets/`: independent copies of the existing design, font, image and icons.

## Updating Content

Case content is maintained in `content/cases.json`. Regenerate case pages:

```powershell
python -X utf8 tools/build-cases.py
```

Maintain other bilingual copy in `assets/js/translations.json`. Compile after
changes (the prune option excludes unused general-portfolio translations):

```powershell
python -X utf8 tools/build-i18n.py --prune
```

No external libraries or runtime APIs are required by the website. The case
renderer and translation compiler use Python's standard library only.

## Content Boundaries

Review qualification titles, dates and the pending IQNET registration status
against issued documents. Do not add unreviewed course manuals, exam materials,
teacher solutions, the full CV or corporate documents to this directory.

Only this edition belongs in the public repository. Do not make the general
archive public again or carry its Git history into this edition. Backups and
review records are stored outside this source directory and must remain private.

# widget2 library

Each directory here is a widget2: a small self-contained web page that Web Lab 2 levels
embed by id (`"widget2": {"id": "<directory name>", "parameters": {...}}` in the level).
Every level that references a widget2 shows the same code, so an edit here reaches all
of them.

Layout, enforced by `Widget2Helper`:

- The directory name is the id: lowercase letters, digits, `_` and `-`.
- Text sources (`html`, `css`, `js`, `json`, `md`, `txt`, `csv`) are read into the
  level's start sources.  `index.html` at the root is the page the widget opens on.
- Binary assets (`png`, `jpg`, `jpeg`, `gif`, `svg`, `webp`, `avif`, `mp3`, `wav`) are
  served to the preview from `/widget2/<id>/<path>` and referenced from the widget's own
  files by relative path, as in a regular project.
- Folders go one level deep.

Levelbuilders edit text sources at `/widget2`; binary assets are added by committing them
here.  Level parameters reach the widget's JavaScript as `window._parameters`.

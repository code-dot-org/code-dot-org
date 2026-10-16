# The annotated JSONC

`<id>.annotated.jsonc` is the pathway JSON plus `//` comments saying where
each line of text came from. The JSON is generated from it.

## Header

Open the file with a comment block:

    // <id>.json is generated from this file by
    // the adaptive-level-builder skill's scripts/jsonc_to_json.py.
    // Sources, fetched <date>:
    //   PT      "Playtest 1 flow" tab of "<doc title>" (<file id>)
    //   CP      "Checkpoints" sheet of "<sheet title>" (<file id>)
    //   KO      levelbuilder level "adaptive-test-kickoff", GitHub staging
    //   sample  dashboard/config/level_content/adaptive/sample.json, GitHub staging
    // Mapping:
    //   CP rows 3-7 are checkpoints; column J is a panel brief (TODO text),
    //   column K the project step's instructions, Q the requires.
    // Tags:
    //   copied     identical to the source after decoding export escapes
    //   minimal    same words; only typography or layout changed (listed)
    //   modified   words changed or cut; was: holds the source text
    //   todo       the source gives nothing; the value is "TODO"
    //   generated  instructionsPrompt, or text the user asked for
    //   provided   given by the user in chat
    //   unplaced   source content with no field in the format

One short code per source: a doc tab, a sheet, a level, a file. Add codes
as sources are added; keep old ones while any line cites them.

## Citing a location

`<code> <place>`: for a doc, the row or heading and column
(`PT Add Details Step 2, Content column`); for a sheet, the cell
(`CP!K3`), optionally with its column header (`CP!K3, Used in your
project`); for a level, the property path (`KO panels[3].text`).

## Tags

Every text line gets one tag, on the line above or trailing it for a
one-line choice. Text lines are those with `title`, `description`,
`objective`, `text`, `instructions`, `instructionsPrompt`,
`questionTitle`, `placeholder`, `imageUrl`, `minLabel`, `maxLabel`,
`standards`, and each choice. Ids, keys, and level names are not tagged.

- `// copied: <loc>` — identical to the source after decoding export
  escapes. Nothing else may differ: not a quote, not a space.
- `// minimal: <loc>; changes: <list>` — same words, only typography or
  layout changed. Name every change: `’ → '`, list renumbered, trailing
  space dropped, two cells joined with `\n\n`.
- `// modified: <loc>; was: "<exact source text>"; why: <reason>` — words
  changed, cut, or merged. `was` holds the whole original span as a JSON
  string, for side-by-side comparison.
- `// todo: <what is needed>; <why the source has nothing>` — the value is
  exactly `"TODO"`, except a required `imageUrl`, which takes the
  placeholder from `mapping.md`. Never `""`: most fields are `min(1)`. Panel
  `text` may be `""` when the source panel has none. Omit an optional
  field rather than TODO it when the source clearly has nothing for it.
- `// generated: <basis>` — only for `instructionsPrompt`, or text the user
  asked you to write (then the basis starts "at the user's request").
  Quote the source text it is built from.
- `// provided: <task id or "chat">, <date>; <what the user said>` — a
  value the user gave in chat: an uploaded image URL, a title, a
  correction in their own words.
- `// unplaced: <loc>; "<exact source text>"` — source content with no
  field. Not attached to a value; place it inside the step it belongs to.
- `// me: <note>` — written by the user in the file. Never write this tag;
  keep these lines and their values on every update.

Prefer `copied` over `minimal`, and `minimal` over `modified`. Keep the
source's wording even when it reads oddly; record the oddity for the user.

## Doc export escapes

The doc export escapes markdown in table cells: `\!`, `\*\*`, `\_`, `\[`,
and `&#10;` for a line break. Decoding these, and trimming the padding
spaces around cells and lines, is not a change. Characters it does not
escape (curly quotes, en dashes) are the doc's own and count.

In `sheet.txt`, a cell's newlines are written `\n` and backslashes `\\`;
decoding those is not a change either.

## Formatting

The user's editor may reformat the file: trailing commas, long one-line
choices wrapped so the trailing comment lands on the closing `},`. Both
are fine; the converter and checker accept them.

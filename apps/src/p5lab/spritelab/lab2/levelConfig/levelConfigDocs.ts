// The introduction and rules for Sprite Lab in Lab2's settings reference
// (schemaDocs.ts).

export const LEVEL_CONFIG_DOCS = {
  title: 'Sprite Lab in Lab2 level settings (level_config)',
  intro: `
A Sprite Lab in Lab2 level stores its settings in one property,
\`level_config\`, inside the level file's \`properties\`. The schema is
\`apps/src/p5lab/spritelab/lab2/levelConfig/schema.ts\`.

A level that sets nothing (\`{}\`) is plain Sprite Lab: the Code tab and the
game, one scene, no World tab. Each feature is a group the level adds, and
the group's settings exist only inside it: \`images\` turns on the Images
tab, \`world\` the World tab, and \`scenes\`, \`blocks\`, \`objectives\`,
\`callouts\` and \`instructions\` their own features. A group with nothing
in it (\`{}\`) turns the feature on with its defaults. Leave out everything
a level does not need.

Some settings are kept outside \`level_config\`, as other level properties:
the toolbox (\`toolbox_definition\`), the instructions text
(\`long_instructions\`), the starting project (\`start_sources\` or a project
template), and Lab2's own properties.
`,
  rules: [
    'A level opens on `focus`, which is `code` when not set. Unless it is `play`, the student must be able to change that part.',
    'Without `edits`, the student can change the code, plus images when `images` is set and the world when `world` is set. `edits` limits that list; it can name `images` only with `images` set, and `world` only with `world` set.',
    'A level that edits only images shows the Images tab alone; a level with `focus: "play"` and `edits: []` shows only the game.',
    '`images.makes.subject` is for a sprite only.',
    'A level that sets up scenes (`scenes.starting`) keeps the student to them, so it cannot also set `scenes.canChange`. The first starting scene is always the one the student edits, so it does not set `editable`.',
    'Names that refer to other settings must match them: a checklist check or callout names a scene by its id in `scenes.starting`, a callout names checklist steps by their position from 0, and a tag names the `data` of a block in `blocks.addOnArrival`.',
    'Roles (such as "hero" or "treasure") are names an image level records on the image it makes (`images.makes.role`); later levels in the same unit use the same names to find those images.',
  ],
};

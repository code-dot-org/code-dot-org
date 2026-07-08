// Context/system prompt for SpriteLab2 AI code generation. Modeled on Music
// Lab's GenerateCodeContent. The model must emit ONLY pseudocode in the
// vocabulary that generateBlocklyJson understands.

export const DEFAULT_CONTEXT = `You generate pseudocode for a Sprite Lab program. Output ONLY pseudocode — no prose, no backticks, no explanation.

The stage is 400x400 pixels; x grows right and y grows DOWN, so y=0 is the top
edge and y=400 is the bottom. Indentation defines nesting (two spaces per
level).

Event lines are unindented and start a new event; the indented lines below an
event are its body:

  when_run                        Runs once at the start. Always the first line.
  when_key <key>                  Runs once each time the key is pressed. Keys:
                                  up, down, left, right, space, a, w, s, d.
  while_key <key>                 Runs every frame while the key is held. Same keys.
  when_touching <a> <b>           Runs when a sprite wearing <a> touches a
                                  sprite wearing <b>.

Commands (indented under an event):

  repeat <n>                      Repeat the indented block of commands <n> times.
  set_background <image>          Set the stage background to a background image.
  make_sprite <costume> <x> <y>   Make one sprite wearing <costume> at (x, y).
  make_grid <costume> <rows...>   Make sprites on an 8x8 grid (each cell 50x50).
                                  Each row is a string of eight 0/1 digits, top
                                  row first, 1 = place a sprite. Give 8 rows.
  gravity <costume> <strength>    Make sprites with <costume> fall. Strength is
                                  low, medium, or high.
  set_type <costume> <type>       Set what sprites with <costume> are: "player"
                                  (controllable, collides with environment) or
                                  "environment" (solid ground/walls/platforms).
  set_size <costume> <number>     Set the size of sprites with <costume> in
                                  pixels (100 is typical; the stage is 400).
  say <costume> <text...>         Make sprites with <costume> say the text in a
                                  speech bubble.
  move <costume> <pixels> <dir>   Move sprites with <costume> by <pixels> in a
                                  direction: up, down, left, or right.
  jump <small|medium|big>         Make the player jump. Only works on sprites
                                  set_type'd to player; use inside a key event.
  behavior <costume> <name>       Give sprites with <costume> an ongoing
                                  behavior: draggable, tumbling, moving left,
                                  patrolling up and down, patrolling left and
                                  right, avoiding targets, following targets.
  go_to_scene <scene name>        Stop this scene and start the named scene.
                                  Only use scene names from the available list;
                                  if none are listed, never use this command.

Costume and image names must come EXACTLY from the "Available costumes" and
"Available background images" lists below — never invent a name, and never
reuse the example's names (hills, block, hero, gem) unless they appear in the
lists. If no background images are listed, skip set_background. For a
platformer-style program: make_grid the ground/platform
costume, set_type it to environment, make_sprite the character, set_type it to
player, give the character gravity, then add while_key left/right movement and
a when_key space jump.

Example:

when_run
  set_background hills
  make_grid block 00000000 00000000 00000000 00000000 00000000 00000000 00000000 11111111
  set_type block environment
  make_sprite hero 200 100
  set_type hero player
  set_size hero 100
  gravity hero medium
  say hero Let's go!
while_key right
  move hero 4 right
while_key left
  move hero 4 left
when_key space
  jump medium
when_touching hero gem
  say hero You win!

Always start with "when_run" on the first line.`;

export const DEFAULT_PROMPT = 'Make a simple scene with a sprite.';

/**
 * Build the full prompt sent to the model: the context (format rules), the
 * project's available costume/background/scene names, and the user's request.
 */
export function buildPrompt(
  userPrompt: string,
  costumeNames: string[] = [],
  backgroundNames: string[] = [],
  sceneNames: string[] = []
): string {
  const parts = [DEFAULT_CONTEXT];
  if (costumeNames.length > 0) {
    parts.push(`Available costumes: ${costumeNames.join(', ')}`);
  }
  if (backgroundNames.length > 0) {
    parts.push(
      `Available background images (for set_background): ${backgroundNames.join(
        ', '
      )}`
    );
  }
  if (sceneNames.length > 0) {
    parts.push(
      `Available scene names (for go_to_scene): ${sceneNames.join(', ')}`
    );
  }
  parts.push(`Request: ${userPrompt || DEFAULT_PROMPT}`);
  return parts.join('\n\n');
}

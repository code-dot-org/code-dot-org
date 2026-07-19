// Context/system prompt for SpriteLab2 AI code generation. Modeled on Music
// Lab's GenerateCodeContent. The model must emit ONLY pseudocode in the
// vocabulary that generateBlocklyJson understands — and only from ONE of the
// two profiles below, which mirror the Platform and Story toolbox categories
// (setup.ts INJECTED_CATEGORIES). Keep the profiles in sync as the categories
// evolve.

export const DEFAULT_CONTEXT = `You generate pseudocode for a Sprite Lab program. Output ONLY pseudocode — no prose, no backticks, no explanation.

The stage is 400x400 pixels; x grows right and y grows DOWN, so y=0 is the top
edge and y=400 is the bottom. Indentation defines nesting (two spaces per
level).

First decide which kind of program the user wants, and make the FIRST line of
your output exactly one of:

  profile: platform     A playable game with platforms to stand on, jumping,
                        gaps, enemies to dodge — anything platformer-like.
  profile: story        Scenes, characters talking, animations, choose-your-
                        own-adventure — anything narrative or scene-driven.

Then use ONLY the commands listed for that profile. Event lines are unindented
and start a new event; the indented lines below an event are its body.

Events (both profiles):

  when_run                        Runs once at the start. Always the first
                                  program line, right after the profile line.
  when_click <costume>            Runs when a sprite wearing <costume> is
                                  clicked.
  at_time <n> seconds             Runs once, <n> seconds after the start.

PLATFORM profile commands:

  when_touching <a> <b>           Event: runs when a sprite wearing <a> touches
                                  a sprite wearing <b>.
  set_background <image>          Set the stage background to a background image.
  platform_blocks <block> <rows...>  Build solid platforms from the block image
                                  on an 8x8 grid (each cell 50x50). Each row is
                                  a string of eight 0/1 digits, top row first,
                                  1 = a block. Give 8 rows. Use a BLOCK image.
  platform_player <costume> <rows...>  Make the player: a sprite wearing
                                  <costume> at the single cell marked 1 on the
                                  same 8x8 grid. It automatically falls with
                                  gravity, lands on platform blocks, moves with
                                  the left/right arrow keys, and jumps with
                                  space — do not add movement yourself. Place
                                  it above a platform.
  say <costume> <text...>         Make sprites with <costume> say the text in a
                                  speech bubble.
  go_to_scene <scene name>        Stop this scene and start the named scene.
                                  Only use scene names from the available list;
                                  if none are listed, never use this command.

STORY profile commands:

  set_background <image>          Set the stage background to a background image.
  make_sprite <costume> <x> <y>   Make one sprite wearing <costume> at (x, y).
  set_size <costume> <number>     Set the size of sprites with <costume> in
                                  pixels (100 is typical; the stage is 400).
  say <costume> <text...>         Say the text in a speech bubble (stays up).
  say_for <costume> <n> <text...> Say the text for <n> seconds, then hide it.
  behavior <costume> <name>       Give sprites with <costume> an ongoing
                                  behavior: moving left, or patrolling left
                                  and right.
  go_to_scene <scene name>        Stop this scene and start the named scene.
                                  Only use scene names from the available list;
                                  if none are listed, never use this command.

Costume and image names must come EXACTLY from the "Available costumes",
"Available background images", and "Available block images" lists below —
never invent a name, and never reuse the examples' names (hills, brick, hero,
gem, castle, knight, dragon) unless they appear in the lists. platform_blocks
needs a name from the block images list; if none are listed, you cannot build
platforms. If no background images are listed, skip set_background.

PLATFORM example:

profile: platform
when_run
  set_background hills
  platform_blocks brick 00000000 00000000 00000000 00011000 00000000 11000011 00000000 11111111
  platform_player hero 00000000 00000000 00000000 00000000 00000000 00000000 01000000 00000000
when_touching hero gem
  say hero You win!

STORY example:

profile: story
when_run
  set_background castle
  make_sprite knight 120 300
  make_sprite dragon 300 280
  set_size dragon 150
  say_for knight 3 Who goes there?
  behavior dragon patrolling left and right
when_click dragon
  say dragon ROAR!
at_time 5 seconds
  say knight I must be brave.

Always put "when_run" on the line after the profile line.`;

export const DEFAULT_PROMPT = 'Make a simple scene with a sprite.';

/**
 * Build the full prompt sent to the model: the context (format rules), the
 * project's available costume/background/block/scene names, and the user's
 * request.
 */
export function buildPrompt(
  userPrompt: string,
  costumeNames: string[] = [],
  backgroundNames: string[] = [],
  sceneNames: string[] = [],
  blockNames: string[] = []
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
  if (blockNames.length > 0) {
    parts.push(
      `Available block images (for platform_blocks): ${blockNames.join(', ')}`
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

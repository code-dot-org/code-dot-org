// The wording the lab adds to a student's prompt. Its own module so the mock
// gateway's rules (fixtures/aiImages.ts) match it without loading generation.

export const SMOOTH_PROMPT = 'Render as a smooth, cleanly-shaded illustration.';

// Opens a pixel-style prompt; styleClause adds the grid.
export const PIXEL_PROMPT =
  'Render as crisp pixel art with a small, limited color palette and ' +
  'hard-edged pixels — no anti-aliasing, gradients, or soft shading.';

// Asks for the flat key color a costume is keyed out against afterwards
// (removeBackground flood-fills it from the corners). The character-set
// generator asks for a NAMED key color in its own prompts instead.
export const SPRITE_PROMPT_CLAUSE =
  'Use a plain solid background of one single flat color that contrasts strongly with the subject and appears nowhere on the subject, extending to all edges. Do not include any scenery, ground, sky, or other background elements — only the subject on that flat background.';

// A still character faces the way an animated one does (characterSet.ts),
// so a story's right-lane mirror turns it toward the others.
export const CHARACTER_FACING_CLAUSE = 'The character faces to the right.';

// On every prompt the lab sends, the character set's own included: the
// model puts captions on backgrounds and labels on things.
export const NO_WRITING_CLAUSE =
  'No writing anywhere in the image: no letters, words, numbers, signs or logos.';

// The model likes to dress a background's margins: painted frames, fake
// transparency strips, title bars. Positive instruction first, and the
// decorations go unnamed — named things get drawn (see BLOCK_PROMPT_CLAUSE).
// The place is empty because the student's characters go on top; a
// background with its own people is a crowd.
export const BACKGROUND_PROMPT_CLAUSE =
  'The place is deserted: scenery only, with nobody in it, no people, characters, creatures or figures of any kind. The scene itself fills the entire image, reaching all four edges. Do not frame the picture: no border and no margin, and nothing along the edges that is not part of the scene.';

// The square is ground in a platform game, and the prompt says so: without
// the game's meaning, "a block of gold" comes back as a picture of a gold
// cube. Name no separate object ("block", "tile", "cube") — the model draws
// it inside the square — describe the ground's face instead.
export const BLOCK_PROMPT_CLAUSE =
  'This is one square of solid ground in a side-view platform game: the terrain a character stands on and walks across. Show the material as the surface of that ground, with a flat level top edge and a texture that continues across the square, not as a single object or item sitting inside the square. Compose the artwork to completely fill one large centered square region, edge to edge, so that copies placed side by side connect seamlessly. Leave a clear margin around all four sides of that square in one plain solid flat color that contrasts strongly with the artwork and appears nowhere in it, extending to the image edges. No background scene — just the artwork on that flat color.';

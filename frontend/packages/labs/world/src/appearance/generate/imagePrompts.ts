// What to ask for, which depends on what the picture is FOR.
//
// A learner types "a purple crab". What the lab needs is not that: it is a
// crab with nothing behind it, filling the frame, drawn so it reads at 32
// pixels — or, for a wall, artwork that meets its own edges so copies laid
// side by side show no seam. None of that is the learner's to say, and all of
// it is knowable from WHERE the door was opened: the Actor Creator is asking
// for an actor, and the backdrop shelf would be asking for a backdrop.
//
// A KIND IS A COMPOSITION, not a use, and it took a bug to see it. The kinds
// were `actor`, `tile` and `background` — three USES, named after the three
// doors that asked for them — and the Actor Creator's door therefore asked for
// an `actor` whatever a learner typed into it. Somebody asked for "a tileable
// ground surface … ice that the player is expected to slip upon" and got a
// centred block of ice floating on transparency, because the wrapper round
// their words said "draw only the subject, centred … no ground".
//
// The model did as it was told. The lab told it the wrong thing, and could not
// have told it the right thing, because the only question it had asked itself
// was which door this was.
//
// So the kinds say how the picture MEETS ITS FRAME, which is the thing a model
// has to be told and the thing a folder cannot know:
//
//   centered  the subject alone, with space round it and nothing at the edges
//   filled    edge to edge, running off all four sides — a surface, not an
//             object sitting on one
//   tileable  filled, and joining itself: copies side by side show no seam
//   background a wide scene for the viewport, which is cropped to the window
//
// A use picks a composition, and only the backdrop shelf can pick without
// asking: a backdrop is a backdrop because of the folder it lands in, and the
// shelf that opened the door is the folder. Everywhere a sprite is drawn — the
// sprites shelf and the Actor Creator both — the same folder holds all three,
// so the question is the learner's and `SAID` is how it is put to them. Still
// not "which prompt template": "what is it".
//
// BORROWED FROM SPRITE LAB, which has been shaping prompts for this exact job
// for longer (`p5lab/spritelab/lab2/ai/images/imageGeneration`). Its three
// kinds are the same three, and the wording of the tileable clause is close to
// its `block` clause on purpose: it names no drawable object — not "tile", not
// "block" — because a model handed one draws it, and what was wanted was the
// stone, not a picture of a stone tile.
//
// WHERE IT PARTS FROM SPRITE LAB is the background. That one asks for a flat
// key colour and floods it to transparency afterwards, because its models
// would not draw transparency. These will: `gpt-image-1` takes a `background`
// parameter, so the ask is for real transparency and there is no key colour to
// pick, no flood fill, and no risk of eating a colour that also appears on the
// subject.

/** How a picture meets its frame, which is what decides how to ask for it. */
export type ImageKind = 'centered' | 'filled' | 'tileable' | 'background';

/**
 * Which edges of a repeating surface have to meet.
 *
 * ASKING FOR ALL FOUR IS ASKING FOR MORE THAN MOST TERRAIN CAN GIVE. A
 * platformer's ground has a top — grass over earth, snow over rock — and a
 * picture whose top edge matches its bottom edge cannot have one. It is still
 * the right picture: laid in a row it joins perfectly, and it was never going
 * to be stacked. So which way it repeats is a question, and answering it lets
 * the clause say what the surface may keep as well as what it must match.
 */
export type TileWays = 'both' | 'across' | 'up';

/** What a kind needs from the provider, beyond the words. */
export interface DrawingStyle {
  /** Transparent where the lab needs to see what is behind. */
  transparent: boolean;
  /** Square for anything in a world; wider for a backdrop. */
  size: string;
  /**
   * The most pixels the kept picture may be on its longest side.
   *
   * A PROJECT CARRIES ITS PICTURES INSIDE ITSELF, so this is a share of a
   * budget rather than a matter of taste (`generate/shrinkPicture`). The
   * numbers are generous against what the lab draws at — the stock sprites are
   * 32 and 64 pixels — and leave room to paint over in the image editor.
   */
  maxSide: number;
}

/**
 * Said for every kind.
 *
 * SIMPLE rather than detailed, because everything here ends up somewhere small
 * — an actor is a few dozen pixels on screen — and a model asked for realism
 * spends its detail where nobody will see it and loses the silhouette, which
 * is the only thing that reads at that size.
 */
const HOUSE_STYLE =
  'Draw it as a clean, simple, brightly lit illustration for a 2-D game, ' +
  'with bold shapes and a clear silhouette that still reads when the picture ' +
  'is shrunk to a few dozen pixels.';

/**
 * Said by everything that has to reach the edges of its frame.
 *
 * EVERY CLAUSE HERE NAMES A FAILURE that was watched for. A vignette and a
 * lighting falloff both put a dark rim on a picture that has to join itself; a
 * perspective view makes a floor that only lies flat in one corner; and
 * "nothing floating in the middle" is the sentence that stops a model drawing
 * the surface as an object made of that surface, which is the thing it wants
 * to do.
 */
const TO_THE_EDGE =
  'Fill the entire frame edge to edge, running off all four sides, with no ' +
  'empty space anywhere and nothing floating in the middle of it. Seen ' +
  'straight on, with no perspective, no vignette, no border, no margin, no ' +
  'frame, no drop shadow, and even lighting right across the picture.';

const CLAUSES: Record<ImageKind, string> = {
  // The subject and nothing else. "No shadow" is there because a drop shadow
  // is the commonest thing a model adds unasked, and a shadow baked into a
  // sprite is a grey smudge that follows it up into the air when it jumps.
  centered:
    'Draw only the subject, centred and filling most of the frame, on a ' +
    'fully transparent background. No scenery, no ground, no drop shadow, no ' +
    'sky, and no border — the subject alone.',
  filled: TO_THE_EDGE,
  // NAMES THE OBJECTS NOT TO DRAW, which is the trick Sprite Lab's `block`
  // clause turns on its own wording: a model handed the word "tile" draws a
  // tile. The learner is likely to have typed it — "a tileable ground tile"
  // is how anybody would ask — so the clause has to refuse it by name rather
  // than merely avoid it.
  tileable:
    `${TO_THE_EDGE} No feature may stand out enough to be noticed repeating. ` +
    'Draw no tile, no block, no slab, no panel and no single object with ' +
    'edges of its own — the material is the whole picture.',
  // A backdrop is cropped to whatever shape the window is, so the middle is
  // the only part anybody is promised to see.
  background:
    'Draw a wide scene filling the whole frame, with the interesting part ' +
    'toward the middle and nothing that matters near the edges, since the ' +
    'game crops it to the window. No characters, no text, and no interface.',
};

/**
 * Which edges must match, said to the model.
 *
 * EACH ONE ALSO SAYS WHAT IS FREE, which is half the value of asking. A model
 * told only "the left and right edges must match" will still make the whole
 * thing uniform to be safe; told that the top and bottom need not, it will put
 * grass on top — which is the picture that was wanted and the one "repeats in
 * every direction" forbids.
 */
const JOINS: Record<TileWays, string> = {
  both:
    ' All four edges must match exactly, so that copies join with no visible ' +
    'seam in any direction, the way ground seen from above does.',
  across:
    ' Its left and right edges must match exactly, so that copies placed side ' +
    'by side join with no visible seam. The top and bottom edges need NOT ' +
    'match and should not be made to: this is seen from the side, so it may ' +
    'have a surface of its own along the top and a different material below.',
  up:
    ' Its top and bottom edges must match exactly, so that copies stacked one ' +
    'above another join with no visible seam. The left and right edges need ' +
    'NOT match and should not be made to: it may have a face of its own down ' +
    'one side.',
};

/**
 * What the words are introduced AS, before the learner's own words arrive.
 *
 * THE ORDER IS THE POINT. A prompt read as "a tileable ground surface … ice …
 * (and then four sentences of correction)" hands a model three drawable nouns
 * before anything says what sort of picture this is, and by then it has
 * decided. Naming the category first costs nothing and settles it: everything
 * after the colon is the subject of a texture rather than a thing to draw.
 *
 * Empty where the subject genuinely comes first — a thing IS its subject, and
 * a backdrop is a scene, which is what anybody describing one says anyway.
 */
const LEADS: Record<ImageKind, string> = {
  centered: '',
  filled: 'A flat texture, seen straight on, of: ',
  tileable: 'A seamless repeating texture, seen straight on, of: ',
  background: '',
};

/**
 * Whether a shape may change what is asked for — everything but a backdrop,
 * which is stretched over the viewport and has no tiles to fill.
 *
 * A REPEATING SURFACE TAKES ONE TOO, and an earlier draft of this said it
 * could not, on the grounds that the repeat unit is one square. That is true
 * of a texture and false of a platform: three tiles wide and two high, tiling
 * side to side, is one actor whose picture is the whole platform. `set scale`
 * STRETCHES a sprite rather than repeating it, so drawing that platform square
 * and scaling it to 3×2 is a squashed picture — the shape has to reach the
 * provider. What repeats is then the platform, joining itself at the left and
 * right edges, which is what the ways above are for.
 */
const takesAShape = (kind: ImageKind): boolean => kind !== 'background';

/**
 * What each kind is, in words a learner can choose by.
 *
 * NOT THE CLAUSE, and not a word from it. The clause above is written at a
 * model — "fill the entire square frame edge to edge with the material itself"
 * — and a learner picking between two pictures wants the difference, which is
 * whether the thing has an outline or goes on forever.
 */
export const SAID: Record<ImageKind, {name: string; what: string}> = {
  centered: {
    name: 'A thing',
    what: 'Drawn on its own, with nothing behind it.',
  },
  filled: {
    name: 'A surface',
    what: 'Fills the whole square, edge to edge.',
  },
  tileable: {
    name: 'A surface that repeats',
    what: 'Fills the square, and joins up where copies meet.',
  },
  background: {
    name: 'A place',
    what: 'A wide scene, behind everything else.',
  },
};

/** …and the same for which way it repeats, in words a learner chooses by. */
export const WAYS_SAID: Record<TileWays, {name: string; what: string}> = {
  both: {name: 'Every way', what: 'Like ground seen from above.'},
  across: {
    name: 'Side to side',
    what: 'A row joins up. It can have its own top.',
  },
  up: {
    name: 'Up and down',
    what: 'A column joins up. It can have its own side.',
  },
};

const STYLES: Record<ImageKind, DrawingStyle> = {
  centered: {transparent: true, size: '1024x1024', maxSide: 256},
  // Opaque, both of them: a wall with holes in it is a wall you can see the
  // void through, and a surface that has to meet its own edges cannot have a
  // soft one.
  filled: {transparent: false, size: '1024x1024', maxSide: 256},
  tileable: {transparent: false, size: '1024x1024', maxSide: 256},
  // Bigger because it is stretched over the whole viewport, and only a little
  // bigger because one of these is already the largest thing in a project.
  background: {transparent: false, size: '1536x1024', maxSide: 640},
};

/**
 * The sizes a provider will actually draw, nearest-first by how wide they are.
 *
 * A provider takes a handful of sizes rather than any number, so a shape is
 * ASKED FOR by picking the offered size closest to it rather than by naming
 * one. Landscape, square and portrait is the whole of what is on offer, which
 * is enough: what matters is that a two-across actor is drawn wide, not that
 * it is drawn exactly two-by-one.
 */
const OFFERED = [
  {ratio: 1536 / 1024, size: '1536x1024'},
  {ratio: 1, size: '1024x1024'},
  {ratio: 1024 / 1536, size: '1024x1536'},
];

/** The offered size whose shape is nearest the one asked for. */
const sizeFor = (shape: {x: number; y: number} | undefined): string => {
  if (!shape || shape.y <= 0) {
    return '1024x1024';
  }
  const wanted = shape.x / shape.y;
  return OFFERED.reduce((best, one) =>
    Math.abs(Math.log(one.ratio / wanted)) <
    Math.abs(Math.log(best.ratio / wanted))
      ? one
      : best,
  ).size;
};

/** What to ask the provider for, given what the learner said. */
export const promptFor = (
  kind: ImageKind,
  words: string,
  shape?: {x: number; y: number},
  ways: TileWays = 'both',
): string => {
  const proportion =
    takesAShape(kind) && shape && (shape.x !== 1 || shape.y !== 1)
      ? ` Compose it to fill a frame ${shape.x} wide by ${shape.y} tall, so the subject is that shape and not a square one.`
      : '';
  const joins = kind === 'tileable' ? JOINS[ways] : '';
  return `${LEADS[kind]}${words.trim()}. ${CLAUSES[kind]}${joins}${proportion} ${HOUSE_STYLE}`;
};

/**
 * …and how to ask for it.
 *
 * The SHAPE overrides the kind's own size where one is given: an actor two
 * tiles across wants a wide picture, and drawing it square and stretching it
 * afterwards is a stretched picture.
 */
export const styleFor = (
  kind: ImageKind,
  shape?: {x: number; y: number},
): DrawingStyle => ({
  ...STYLES[kind],
  ...(shape && takesAShape(kind) ? {size: sizeFor(shape)} : {}),
});

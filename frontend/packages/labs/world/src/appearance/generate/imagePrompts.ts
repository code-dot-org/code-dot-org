// What to ask for, which depends on what the picture is FOR.
//
// A learner types "a purple crab". What the lab needs is not that: it is a
// crab with nothing behind it, filling the frame, drawn so it reads at 32
// pixels — or, for a wall, artwork that meets its own edges so copies laid
// side by side show no seam. None of that is the learner's to say, and all of
// it is knowable from WHERE the door was opened: the Actor Creator is asking
// for an actor, and the backdrop shelf would be asking for a backdrop.
//
// SO THE KIND COMES FROM THE CALL SITE, never from the learner. A door that
// asked "is this a sprite or a background?" would be asking a question it
// already knows the answer to.
//
// …EXCEPT WHERE IT DOES NOT KNOW, which the sprites shelf found. A backdrop is
// a backdrop because of the folder it lands in, and the shelf that opened the
// door is the folder. A thing and a surface land in the SAME folder: the
// platformer's `player.png` and its `ground.png` are both sprites, and which
// one is being asked for is not written anywhere the call site can read. So
// that one question is the learner's, and `SAID` is how it is put to them —
// still not "which prompt template", but "what is it".
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

/** What the picture is for, which is what decides how to ask for it. */
export type ImageKind = 'actor' | 'tile' | 'background';

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

const CLAUSES: Record<ImageKind, string> = {
  // The subject and nothing else. "No shadow" is there because a drop shadow
  // is the commonest thing a model adds unasked, and a shadow baked into a
  // sprite is a grey smudge that follows it up into the air when it jumps.
  actor:
    'Draw only the subject, centred and filling most of the frame, on a ' +
    'fully transparent background. No scenery, no ground, no drop shadow, no ' +
    'sky, and no border — the subject alone.',
  // Names no object on purpose: ask for a "tile" and the picture is of a tile.
  tile:
    'Fill the entire square frame edge to edge with the material itself, so ' +
    'that copies laid side by side join with no visible seam and no repeated ' +
    'feature standing out. Draw no single object, no border, no margin and no ' +
    'shadow — the surface is the whole picture.',
  // A backdrop is cropped to whatever shape the window is, so the middle is
  // the only part anybody is promised to see.
  background:
    'Draw a wide scene filling the whole frame, with the interesting part ' +
    'toward the middle and nothing that matters near the edges, since the ' +
    'game crops it to the window. No characters, no text, and no interface.',
};

/**
 * What each kind is, in words a learner can choose by.
 *
 * NOT THE CLAUSE, and not a word from it. The clause above is written at a
 * model — "fill the entire square frame edge to edge with the material itself"
 * — and a learner picking between two pictures wants the difference, which is
 * whether the thing has an outline or goes on forever.
 */
export const SAID: Record<ImageKind, {name: string; what: string}> = {
  actor: {
    name: 'A thing',
    what: 'Drawn on its own, with nothing behind it.',
  },
  tile: {
    name: 'A surface',
    what: 'Fills a whole tile, and joins up where copies meet.',
  },
  background: {
    name: 'A place',
    what: 'A wide scene, behind everything else.',
  },
};

const STYLES: Record<ImageKind, DrawingStyle> = {
  actor: {transparent: true, size: '1024x1024', maxSide: 256},
  // Opaque: a wall with holes in it is a wall you can see the void through.
  tile: {transparent: false, size: '1024x1024', maxSide: 256},
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
): string => {
  const proportion =
    shape && (shape.x !== 1 || shape.y !== 1)
      ? ` Compose it to fill a frame ${shape.x} wide by ${shape.y} tall, so the subject is that shape and not a square one.`
      : '';
  return `${words.trim()}. ${CLAUSES[kind]}${proportion} ${HOUSE_STYLE}`;
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
  ...(shape && kind !== 'background' ? {size: sizeFor(shape)} : {}),
});

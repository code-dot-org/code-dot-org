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
// has to be told and the thing a folder cannot know. And they are TWO
// questions rather than a list, which took a second report to see.
//
// The list was `centered`, `filled` and `tileable`, and somebody wanting a
// mossy platform with vines dangling under it fell between all three: material
// rather than an object, joining side to side, and see-through below the
// stone. There was no name for that, so they wrote one by hand — ending, after
// four sentences of argument with our own clause, with "Ignore any further
// instruction to fill the space". A learner talking the lab out of its own
// prompt is the lab asking the wrong question.
//
// It was asking one question about three independent properties:
//
//   thing or material  one object with a silhouette, or a surface all across
//   does it join up    no, side to side, up and down, or every way
//   is any see-through solid to the frame, or drawn only where it is
//
// `centered` bundled thing + see-through + no join; `filled` and `tileable`
// both bundled material + solid. Nothing spelled material + see-through, so it
// could not be asked for. Pulled apart, every combination can:
//
//   thing      + (nothing else asked)        a crab
//   surface    + every way   + solid         grass seen from above
//   surface    + side to side + solid        an ice ground with a top of its own
//   surface    + side to side + see-through  a mossy platform with vines under it
//
// A use picks the answers, and only the backdrop shelf can pick without
// asking: a backdrop is a backdrop because of the folder it lands in, and the
// shelf that opened the door is the folder. Everywhere a sprite is drawn — the
// sprites shelf and the Actor Creator both — the same folder holds every kind,
// so the questions are the learner's and `SAID` is how they are put. Still not
// "which prompt template": "what is it".
//
// THE SECOND TWO ARE ONLY ASKED OF A SURFACE. A thing is see-through around
// itself by definition and joins nothing, so asking would be asking something
// with one answer.
//
// BORROWED FROM SPRITE LAB, which has been shaping prompts for this exact job
// for longer (`p5lab/spritelab/lab2/ai/images/imageGeneration`). Its three
// kinds are these answers' commonest combinations, and the wording of the
// joining clause is close to its `block` clause on purpose: it names no drawable object — not "tile", not
// "block" — because a model handed one draws it, and what was wanted was the
// stone, not a picture of a stone tile.
//
// WHERE IT PARTS FROM SPRITE LAB is the background. That one asks for a flat
// key colour and floods it to transparency afterwards, because its models
// would not draw transparency. These will: `gpt-image-1` takes a `background`
// parameter, so the ask is for real transparency and there is no key colour to
// pick, no flood fill, and no risk of eating a colour that also appears on the
// subject.

/**
 * What a picture is, at the coarsest grain — the one question always asked.
 *
 * A `surface` is then asked two more ({@link SurfaceAsk}); a `thing` is not,
 * having one answer to each; and a `background` is never asked at all, being
 * known by the folder it lands in.
 */
export type ImageKind = 'thing' | 'surface' | 'background';

/** Which edges of a surface have to meet, if any. */
export type TileWays = 'none' | 'across' | 'up' | 'both';

/**
 * The two questions a surface answers, beyond the words.
 *
 * ASKING FOR ALL FOUR EDGES IS ASKING FOR MORE THAN MOST TERRAIN CAN GIVE. A
 * platformer's ground has a top — grass over earth, snow over rock — and a
 * picture whose top edge matches its bottom cannot have one. It is still the
 * right picture: laid in a row it joins perfectly, and it was never going to
 * be stacked.
 *
 * AND A SURFACE NEED NOT FILL ITS FRAME. A platform with vines hanging under
 * it is material across the top and nothing below, and the nothing has to be
 * really nothing — transparent, for the game to show through. That was the
 * combination the old three kinds could not express.
 */
export interface SurfaceAsk {
  ways: TileWays;
  /** Whether part of the picture is meant to be see-through. */
  through: boolean;
}

/** What a surface is taken to be when nobody said. */
const PLAIN: SurfaceAsk = {ways: 'none', through: false};

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
 * …and the same for a surface, which has no silhouette to be clear about.
 *
 * A SILHOUETTE IS AN OUTLINE, and asking for one of a thing that is supposed
 * to run off the edges of the picture is asking for the outline it must not
 * have. One word, pulling the same way as everything else that was wrong here.
 */
const HOUSE_STYLE_SURFACE =
  'Draw it as a clean, simple, brightly lit illustration for a 2-D game, ' +
  'with bold shapes that still read when the picture is shrunk to a few ' +
  'dozen pixels.';

/**
 * How a surface is seen, whatever else it is.
 *
 * EVERY CLAUSE HERE NAMES A FAILURE that was watched for. A vignette and a
 * lighting falloff both put a dark rim on a picture that has to join itself;
 * a perspective view makes a floor that only lies flat in one corner.
 */
const SEEN_FLAT =
  'Seen straight on, with no perspective, no vignette, no border, no margin, ' +
  'no frame, no drop shadow, and even lighting right across the picture.';

/**
 * …and that it is material rather than a picture OF material.
 *
 * Names the objects not to draw, which is the trick Sprite Lab's `block`
 * clause turns on its own wording: a model handed the word "tile" draws a
 * tile. The learner is likely to have typed it — "a tileable ground tile" is
 * how anybody would ask — so the clause refuses it by name rather than merely
 * avoiding it.
 */
const NOT_AN_OBJECT = {
  /** Solid, joining nothing: the picture and the material are the same thing. */
  whole:
    'The material is the whole picture: draw no tile, no block, no slab, no ' +
    'panel and no single object with edges of its own.',
  /**
   * See-through, joining nothing. "The material is the whole picture" is
   * FALSE here — half the picture is deliberately nothing — and a sentence a
   * model can see is false is a sentence it discounts, taking the useful half
   * with it.
   */
  only:
    'This is material rather than an object sitting on a background: draw no ' +
    'tile, no block, no slab and no panel.',
  /**
   * Joining, either way, and the sentence the mossy platform needed. It came
   * back capped at both ends because nothing had said a thing that repeats has
   * no ends — only that it should not be "an object with edges of its own",
   * which a platform with two tidy ends does not look like to a model.
   */
  endless:
    'This is a length of material rather than an object: draw no tile, no ' +
    'block, no slab and no panel, and give it no ends of its own. It simply ' +
    'continues past the edges of the picture, as though cut from something ' +
    'longer.',
};

/**
 * How much of the frame it occupies, which is the see-through question.
 *
 * "Nothing floating in the middle" is the sentence that stops a model drawing
 * a solid surface as an object made of that surface, which is the thing it
 * wants to do. The other arm is the one a learner had to write by hand, and it
 * has to say "no background colour of any kind": asked merely not to fill the
 * frame, a model puts sky behind the vines.
 */
const FILLS = {
  solid:
    'Fill the entire frame edge to edge, running off all four sides, with no ' +
    'empty space anywhere and nothing floating in the middle of it.',
  through:
    'It need NOT fill the frame. Draw the material only where it actually is ' +
    'and leave everywhere else fully transparent — no background colour of ' +
    'any kind, no sky, no backdrop — so that the game shows through it.',
};

/**
 * …and the same for a see-through surface that has to JOIN.
 *
 * BECAUSE THE TWO ABOVE CONTRADICT EACH OTHER THERE, which is how the first
 * cut of this failed. "It need NOT fill the frame" is true of the axis that is
 * free and false of the axis that joins, and said flatly it licenses exactly
 * what came back: a platform drawn as an object, capped at both ends, sitting
 * in a transparent margin. Asked for side-to-side tiling, the copies left gaps
 * and the joins were two rounded ends meeting.
 *
 * So the freedom is granted per axis. The joining edges BLEED — the word
 * illustrators use, and the one a model answers to — and the free axis is the
 * only place "leave it transparent" applies.
 */
const BLEEDS: Record<'across' | 'up' | 'both', string> = {
  across:
    'The artwork must BLEED OFF the left and right edges: the surface runs ' +
    'from the very left edge of the picture to the very right edge with no ' +
    'transparent margin at either side, and is CUT OFF by those edges rather ' +
    'than fitted inside them. Do not centre it in the frame. Above it and ' +
    'below it, leave everything that is not the surface fully transparent — ' +
    'no background colour of any kind, no sky, no backdrop — so that the game ' +
    'shows through.',
  up:
    'The artwork must BLEED OFF the top and bottom edges: the surface runs ' +
    'from the very top of the picture to the very bottom with no transparent ' +
    'margin at either end, and is CUT OFF by those edges rather than fitted ' +
    'inside them. Do not centre it in the frame. To its left and to its ' +
    'right, leave everything that is not the surface fully transparent — no ' +
    'background colour of any kind, no sky, no backdrop — so that the game ' +
    'shows through.',
  both:
    'The artwork must BLEED OFF all four edges, cut off by them rather than ' +
    'fitted inside them, with no transparent margin anywhere around it. Only ' +
    'the gaps WITHIN the surface itself are transparent, and those are fully ' +
    'transparent — no background colour of any kind, no sky, no backdrop — so ' +
    'that the game shows through them.',
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
  none: '',
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

/** Said wherever it joins at all: a repeat nobody notices is the point. */
const UNNOTICED =
  ' No feature may stand out enough to be noticed repeating. Where it joins, ' +
  'the material must run right off that edge. Think of the picture as one ' +
  'length cut from a long unbroken run of the material: whatever leaves one ' +
  'joining edge arrives at the other.';

/** The whole of what a surface is asked to be. */
const surfaceClause = ({ways, through}: SurfaceAsk): string => {
  const fill = !through
    ? FILLS.solid
    : ways === 'none'
      ? FILLS.through
      : BLEEDS[ways];
  const material =
    ways !== 'none'
      ? NOT_AN_OBJECT.endless
      : through
        ? NOT_AN_OBJECT.only
        : NOT_AN_OBJECT.whole;
  return (
    `${fill} ${SEEN_FLAT} ${material}` +
    `${JOINS[ways]}${ways === 'none' ? '' : UNNOTICED}`
  );
};

const CLAUSES: Record<ImageKind, (surface: SurfaceAsk) => string> = {
  // The subject and nothing else. "No shadow" is there because a drop shadow
  // is the commonest thing a model adds unasked, and a shadow baked into a
  // sprite is a grey smudge that follows it up into the air when it jumps.
  thing: () =>
    'Draw only the subject, centred and filling most of the frame, on a ' +
    'fully transparent background. No scenery, no ground, no drop shadow, no ' +
    'sky, and no border — the subject alone.',
  surface: surfaceClause,
  // A backdrop is cropped to whatever shape the window is, so the middle is
  // the only part anybody is promised to see.
  background: () =>
    'Draw a wide scene filling the whole frame, with the interesting part ' +
    'toward the middle and nothing that matters near the edges, since the ' +
    'game crops it to the window. No characters, no text, and no interface.',
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
const leadFor = (kind: ImageKind, surface: SurfaceAsk): string => {
  if (kind !== 'surface') {
    return '';
  }
  if (surface.through) {
    // NOT "a game sprite" where it joins, which is what this said and which
    // names the very thing that must not be drawn: a sprite is one object with
    // a silhouette, and what was wanted is a strip with no ends.
    if (surface.ways === 'across') {
      return 'A seamless horizontally-repeating strip, cut off by the left and right edges, seen straight on, with a transparent background, of: ';
    }
    if (surface.ways === 'up') {
      return 'A seamless vertically-repeating strip, cut off by the top and bottom edges, seen straight on, with a transparent background, of: ';
    }
    if (surface.ways === 'both') {
      return 'A seamless repeating texture with transparent gaps in it, seen straight on, of: ';
    }
    return 'A flat game sprite on a transparent background, seen straight on, of: ';
  }
  return surface.ways === 'none'
    ? 'A flat texture, seen straight on, of: '
    : 'A seamless repeating texture, seen straight on, of: ';
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
 * model — "fill the entire frame edge to edge with the material itself" — and
 * a learner picking between two pictures wants the difference, which is
 * whether the thing has an outline or goes on forever.
 */
export const SAID: Record<ImageKind, {name: string; what: string}> = {
  thing: {
    name: 'A thing',
    what: 'One object, drawn on its own with nothing behind it.',
  },
  surface: {
    name: 'A surface',
    what: 'Material — ground, a wall, a platform.',
  },
  background: {
    name: 'A place',
    what: 'A wide scene, behind everything else.',
  },
};

/** …and the same for which way it joins up. */
export const WAYS_SAID: Record<TileWays, {name: string; what: string}> = {
  none: {name: 'No', what: 'One piece, on its own.'},
  across: {
    name: 'Side to side',
    what: 'A row joins up. It can have its own top.',
  },
  up: {
    name: 'Up and down',
    what: 'A column joins up. It can have its own side.',
  },
  both: {name: 'Every way', what: 'Like ground seen from above.'},
};

/** …and for how much of the square it is. */
export const THROUGH_SAID: Record<
  'solid' | 'through',
  {name: string; what: string}
> = {
  solid: {name: 'Solid all over', what: 'It fills the whole square.'},
  through: {
    name: 'Partly see-through',
    what: 'Only part of it is drawn; the rest shows what is behind.',
  },
};

const STYLES: Record<ImageKind, DrawingStyle> = {
  thing: {transparent: true, size: '1024x1024', maxSide: 256},
  // Opaque unless it is asked to be otherwise: a wall with holes in it is a
  // wall you can see the void through, and a surface that has to meet its own
  // edges cannot have a soft one.
  surface: {transparent: false, size: '1024x1024', maxSide: 256},
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
  surface: SurfaceAsk = PLAIN,
): string => {
  // NOT WHERE IT JOINS, which is the sentence that made a tileable 1x2
  // impossible to ask for. A provider draws at one of three shapes, so a 1:2
  // tile is asked for on a 2:3 canvas — and "compose it to fill a frame 1 wide
  // by 2 tall" then means "leave a transparent margin down each side", which
  // is exactly what the bleed clause has just forbidden. Said last, where the
  // emphasis is, it won.
  //
  // A joining surface needs no proportion sentence at all: the canvas IS the
  // tile, edge to edge, and the shape it ends up drawn at comes from the
  // `set scale` row instead (`actors/create/actorLook.withScale`).
  const joining = kind === 'surface' && surface.ways !== 'none';
  const proportion =
    takesAShape(kind) && !joining && shape && (shape.x !== 1 || shape.y !== 1)
      ? ` Compose it to fill a frame ${shape.x} wide by ${shape.y} tall, so the subject is that shape and not a square one.`
      : '';
  const house = kind === 'surface' ? HOUSE_STYLE_SURFACE : HOUSE_STYLE;
  return `${leadFor(kind, surface)}${words.trim()}. ${CLAUSES[kind](surface)}${proportion} ${house}`;
};

/**
 * …and how to ask for it.
 *
 * The SHAPE overrides the kind's own size where one is given: an actor two
 * tiles across wants a wide picture, and drawing it square and stretching it
 * afterwards is a stretched picture. And a surface that is partly see-through
 * needs real transparency from the provider, which is the one thing the words
 * alone cannot get.
 */
export const styleFor = (
  kind: ImageKind,
  shape?: {x: number; y: number},
  surface: SurfaceAsk = PLAIN,
): DrawingStyle => ({
  ...STYLES[kind],
  ...(kind === 'surface' && surface.through ? {transparent: true} : {}),
  ...(shape && takesAShape(kind) ? {size: sizeFor(shape)} : {}),
});

// Making a drawn picture small enough to keep.
//
// A WORLD PROJECT CARRIES ITS PICTURES INSIDE ITSELF. Every image is bytes on
// a data URL in the project's own JSON — that is what an imported backdrop is
// and what an uploaded sprite is (`appearance/importStock`, `files/newThing`)
// — so a picture's size is not a detail of how it looks, it is a share of a
// budget everything else in the project has to fit in too.
//
// A provider draws at 1024 square and up, which is around a megabyte and a
// half of base64 apiece. The harness noticed first, because it keeps the whole
// project in `sessionStorage` and a couple of pictures exhausted it outright:
//
//     QuotaExceededError: Setting the value of
//     'cdo-mock:world:jetpack:sources' exceeded the quota
//
// That was the messenger and not the problem. The same project saved anywhere
// else is the same megabytes, and the sizes the lab actually draws at are
// nothing like 1024: the stock sprites are 32 and 64 pixels, and an actor is a
// few dozen pixels on screen.
//
// SO IT IS SHRUNK ON THE WAY IN, once, rather than on the way out every time.
// What the learner keeps is what they will edit in the image editor and what
// every later reader loads, and a picture nobody can see the extra detail of
// is detail that costs and pays nothing.
//
// IT NEVER FAILS THE DRAWING. A browser with no canvas — jsdom, in the tests —
// gets the picture back at the size it came, which is worse and works. Losing
// a drawing a learner waited half a minute for, because it could not be
// resized, would be the wrong trade by a distance.

/** The most pixels a picture may be on its longest side, by what it is for. */
export interface Shrinkable {
  dataUrl: string;
  mediaType: string;
}

/**
 * Redraw a picture so its longest side is at most `maxSide`.
 *
 * Returns it untouched when it is already small enough, when the browser
 * cannot draw, or when anything at all goes wrong.
 */
export async function shrinkToFit(
  picture: Shrinkable,
  maxSide: number,
): Promise<Shrinkable> {
  // ASKED BEFORE ANYTHING IS DECODED, which is not an optimisation. jsdom has
  // no canvas AND does not load images: an `Image` given a data URL there
  // fires neither `load` nor `error`, so waiting on one waits for ever. The
  // tests found that as a twenty-second timeout; a browser in the same state
  // would have found it as a draw that never came back.
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return picture;
  }
  try {
    const image = await loaded(picture.dataUrl);
    const longest = Math.max(image.width, image.height);
    if (!longest || longest <= maxSide) {
      return picture;
    }
    const scale = maxSide / longest;
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    // Smoothing ON, unlike everywhere else in this lab: the pixel editor draws
    // art at its own scale and wants hard edges, and this is the opposite job
    // — a thousand-pixel illustration being reduced, where nearest-neighbour
    // would drop every other row and leave it ragged.
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    // PNG, always: transparency is the whole point for an actor, and the lab's
    // pictures are `.png` everywhere else.
    const smaller = canvas.toDataURL('image/png');
    return smaller.startsWith('data:image/png')
      ? {dataUrl: smaller, mediaType: 'image/png'}
      : picture;
  } catch {
    return picture;
  }
}

/** How long to wait for a picture to decode before giving up on shrinking it. */
const DECODE_LIMIT = 10_000;

/**
 * The picture, decoded, or a rejection this module turns into "leave it".
 *
 * BOUNDED, because the alternative is a drawing that never comes back. A
 * browser that fires neither handler is not a case to reason about in the
 * abstract — it is what the test environment does — and the cost of being
 * wrong here is the whole feature hanging rather than one picture staying big.
 */
const loaded = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const giveUp = setTimeout(
      () => reject(new Error('That picture took too long to decode.')),
      DECODE_LIMIT,
    );
    image.onload = () => {
      clearTimeout(giveUp);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(giveUp);
      reject(new Error('That picture would not decode.'));
    };
    image.src = dataUrl;
  });

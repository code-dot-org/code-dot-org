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
  /**
   * How big it measures, once anything here has had to decode it.
   *
   * REPORTED BECAUSE THE SIZE DECIDES THE SCALE. An actor asked to fill two
   * tiles of height is written a `set scale` row, and the right numbers depend
   * on the picture's proportions — `intrinsic size` is the picture fitted to a
   * tile, so scaling it by (x, y) lands on the asked-for box only when the
   * picture is square (`actors/create/actorLook.withScale`). Everything here
   * decodes anyway; saying what it saw costs nothing and saves a second
   * decode.
   *
   * Absent where nothing decoded it — a browser that cannot draw, a picture
   * small enough to pass straight through untouched.
   */
  width?: number;
  height?: number;
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
    if (!longest) {
      return picture;
    }
    if (longest <= maxSide) {
      // Nothing to do but say what it measures, which nobody else will now
      // decode it to find out.
      return {...picture, width: image.width, height: image.height};
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
      ? {
          dataUrl: smaller,
          mediaType: 'image/png',
          width: canvas.width,
          height: canvas.height,
        }
      : picture;
  } catch {
    return picture;
  }
}

/**
 * Cut the fully transparent margin off a picture's edges.
 *
 * WORDS ALONE DO NOT GET THIS. A learner asked for a mossy platform tiling
 * side to side, said "do not leave any gaps to the left or right" and "it
 * should go to the left and right edges" in their own prompt, and got a
 * platform with a transparent margin on both sides — so copies laid in a row
 * stood apart with a gap between them. The clause was rewritten for that
 * (`generate/imagePrompts`), and a clause is still a request.
 *
 * This is not. Whatever came back, the columns at the left and right that are
 * entirely transparent are not part of the picture: nothing is drawn there, so
 * removing them changes nothing anybody can see and makes the material reach
 * the edge by construction. The same for rows, top and bottom, where it joins
 * that way.
 *
 * IT CANNOT FIX A SEAM, only a gap. Two capped ends butted together are still
 * two capped ends; what stops them being capped is the prompt. This stops them
 * being a finger apart.
 *
 * THE FREE EDGES MATTER TOO, which an earlier draft of this left alone on the
 * grounds that only a joining edge has to reach. That was reasoning about
 * seams and forgetting what an empty margin IS to the rest of the lab: every
 * question about how big an actor is reads its picture (`rules/spatial`,
 * `collision size of`), so a ground tile drawn in the middle of its frame gets
 * a collision box with the empty space in it, and stands a margin above the
 * floor it was placed on. A row where nothing is drawn is not part of the
 * picture on any axis.
 *
 * Untouched when there is nothing to cut, when the browser cannot draw, or
 * when anything at all goes wrong — the same trade {@link shrinkToFit} makes,
 * for the same reason: losing a drawing a learner waited half a minute for
 * would be worse than a margin.
 */
export async function trimToEdges(
  picture: Shrinkable,
  edges: {across: boolean; up: boolean},
): Promise<Shrinkable> {
  if (!edges.across && !edges.up) {
    return picture;
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return picture;
  }
  try {
    const image = await loaded(picture.dataUrl);
    const {width, height} = image;
    if (!width || !height) {
      return picture;
    }
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);
    // `getImageData` throws on a canvas tainted by a cross-origin picture.
    // Every picture here is a data URL from the generator, so it should not —
    // and the catch below means it costs a margin rather than the drawing.
    const {data} = ctx.getImageData(0, 0, width, height);
    const alphaAt = (x: number, y: number) => data[(y * width + x) * 4 + 3];
    /** Empty enough to cut: a soft edge is not a drawing. */
    const clear = (a: number) => a < FAINT;

    let left = 0;
    let right = width - 1;
    if (edges.across) {
      const columnClear = (x: number) => {
        for (let y = 0; y < height; y++) {
          if (!clear(alphaAt(x, y))) {
            return false;
          }
        }
        return true;
      };
      while (left < right && columnClear(left)) left++;
      while (right > left && columnClear(right)) right--;
    }

    let top = 0;
    let bottom = height - 1;
    if (edges.up) {
      const rowClear = (y: number) => {
        for (let x = 0; x < width; x++) {
          if (!clear(alphaAt(x, y))) {
            return false;
          }
        }
        return true;
      };
      while (top < bottom && rowClear(top)) top++;
      while (bottom > top && rowClear(bottom)) bottom--;
    }

    const cut = {width: right - left + 1, height: bottom - top + 1};
    if (cut.width === width && cut.height === height) {
      return {...picture, width, height};
    }
    // Nothing drawn at all — an entirely transparent picture is a failure to
    // hand back whole rather than to crop to one pixel. Asked only of an axis
    // that was SCANNED: a picture one pixel tall is a legitimate strip, and
    // judging it by a measurement nothing took is how the first cut of this
    // threw away a picture it had trimmed correctly.
    if ((edges.across && cut.width < 2) || (edges.up && cut.height < 2)) {
      return picture;
    }
    const out = document.createElement('canvas');
    const outCtx = out.getContext('2d');
    if (!outCtx) {
      return picture;
    }
    out.width = cut.width;
    out.height = cut.height;
    outCtx.drawImage(
      image,
      left,
      top,
      cut.width,
      cut.height,
      0,
      0,
      cut.width,
      cut.height,
    );
    const trimmed = out.toDataURL('image/png');
    return trimmed.startsWith('data:image/png')
      ? {
          dataUrl: trimmed,
          mediaType: 'image/png',
          width: cut.width,
          height: cut.height,
        }
      : picture;
  } catch {
    return picture;
  }
}

/** Alpha below which a pixel counts as nothing drawn, out of 255. */
const FAINT = 8;

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

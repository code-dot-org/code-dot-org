// Drawing through the dev server, which is holding the key.
//
// The browser half of the pair. It knows the LAB's request and reply shapes
// and nothing about who draws (`dev/protocol`), so pointing the node half at
// another provider changes nothing here.
//
// NOT THE PRODUCT PATH, and the distance between them is the point rather than
// a detail. This reaches a developer's own key through a route that only a
// Vite dev server serves, and it runs none of the moderation a product path
// would. `kind` says so, because a page that could not tell the transports
// apart could not say so either (specs/IMAGE_GENERATION.md).

import {
  DRAW_ROUTE,
  STATUS_ROUTE,
  type DrawProxyReply,
  type ImageProxyStatus,
} from './dev/protocol';
import {
  DrawAbandoned,
  type GeneratedPicture,
  type ImageGenerator,
} from './imageGenerator';
import {promptFor, styleFor} from './imagePrompts';
import {shrinkToFit} from './shrinkPicture';

/** Thrown when the proxy answered, and the answer was that it could not. */
export class DrawRefused extends Error {
  constructor(why: string) {
    super(why);
    this.name = 'DrawRefused';
  }
}

/**
 * Whether there is a dev proxy behind this page, and what it would use.
 *
 * A FETCH THAT FAILS IS NOT THE SAME AS `available: false`. The first means no
 * dev server at all — the lab is running somewhere else, and there is nothing
 * to fall back to. The second means the harness is there with nothing behind
 * it, which is a situation the fixture is for.
 */
export const imageProxyStatus = async (): Promise<
  ImageProxyStatus | undefined
> => {
  try {
    const answer = await fetch(STATUS_ROUTE);
    if (!answer.ok) {
      return undefined;
    }
    return (await answer.json()) as ImageProxyStatus;
  } catch {
    return undefined;
  }
};

/**
 * A short file-name stem for a picture drawn from these words.
 *
 * The transport's job rather than the learner's: what they typed may be a
 * sentence, and `a purple crab with big claws.png` is a file nobody wants.
 * Two words is enough to tell four pictures of one prompt apart from four of
 * another, and the articles are dropped because every prompt has them.
 */
export const stemFor = (prompt: string): string => {
  const words = prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word && !['a', 'an', 'the', 'of', 'with'].includes(word))
    .slice(0, 2);
  return words.length === 0
    ? 'picture'
    : words[0] +
        words
          .slice(1)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
};

/** Draw through the dev server's own origin. */
export const directImages = (): ImageGenerator => ({
  kind: 'direct',
  async draw({prompt, count, kind = 'centered', shape, ways, signal}) {
    // The words are the learner's; what is ASKED is those words plus how the
    // picture has to meet its frame — transparency round a centred subject, a
    // seamless fill for one that repeats (`generate/imagePrompts`). The node
    // half is told the whole thing and knows nothing about actors.
    const style = styleFor(kind, shape);
    const answer = await fetch(DRAW_ROUTE, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        prompt: promptFor(kind, prompt, shape, ways),
        count,
        size: style.size,
        transparent: style.transparent,
      }),
      signal,
    }).catch((error: unknown) => {
      // An abort arrives here as a DOMException, and it is not a failure to
      // report: the learner stopped waiting.
      if (signal?.aborted) {
        throw new DrawAbandoned();
      }
      throw new DrawRefused(
        error instanceof Error ? error.message : String(error),
      );
    });

    const reply = (await answer.json()) as DrawProxyReply;
    if (reply.failure) {
      throw new DrawRefused(reply.failure);
    }
    const stem = stemFor(prompt);
    return Promise.all(
      reply.pictures.map(async (picture, at): Promise<GeneratedPicture> => {
        // SHRUNK ON THE WAY IN. A provider draws at a thousand pixels and up,
        // and a project carries its pictures with it — so the size is a share
        // of a budget rather than a matter of taste
        // (`generate/shrinkPicture`).
        const {dataUrl, mediaType} = await shrinkToFit(
          {
            dataUrl: `data:${picture.mediaType};base64,${picture.base64}`,
            mediaType: picture.mediaType,
          },
          style.maxSide,
        );
        return {
          // Numbered from the second, so one picture is `crab.png` and several
          // are `crab`, `crab2`, `crab3` — the shape the project's own naming
          // already uses when a name is taken (`files/FileMenus`).
          name: at === 0 ? stem : `${stem}${at + 1}`,
          dataUrl,
          mediaType,
        };
      }),
    );
  },
});

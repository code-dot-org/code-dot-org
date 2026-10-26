// The node half: a prompt goes out, base64 PNGs come back.
//
// It knows nothing about the wizard — it is handed the lab's own request shape
// and answers in the lab's own reply shape (`dev/protocol`), which is what
// keeps the provider's vocabulary out of everything upstream of it.
//
// RUNS IN THE DEV SERVER'S PROCESS, never in a browser. The key is read from
// the environment by the plugin and passed in here; nothing in this file
// reaches for it, so a copy of it that ended up in the client bundle would
// have nothing to find.
//
// It is not what the product will use. The gateway serves image models behind
// a minted token and whatever it enforces (specs/AI_IMAGE_GENERATION.md); this
// is a developer with their own key, and the two must not be confused for each
// other — which is why the transports are named apart.

import type {DrawProxyReply, DrawProxyRequest} from './protocol';

/** The model drawn with when nobody says otherwise. */
export const DEFAULT_IMAGE_MODEL = 'gpt-image-1';

/** How big, when nobody says otherwise. */
export const DEFAULT_SIZE = '1024x1024';

/** More than this in one request fans out into that many provider calls. */
export const MAX_PICTURES = 4;

const ENDPOINT = 'https://api.openai.com/v1/images/generations';

/** What the provider answers with, as much of it as this reads. */
interface ProviderReply {
  data?: Array<{b64_json?: string}>;
  error?: {message?: string};
}

/**
 * Ask for pictures.
 *
 * Errors come back as a REPLY rather than as a throw, for the same reason the
 * tutor's proxy does it: the page renders a failed attempt, and a stack trace
 * crossing an HTTP boundary helps nobody. What the provider said is carried
 * separately and is for the terminal.
 */
export async function drawWithOpenAi(
  request: DrawProxyRequest,
  apiKey: string,
  model: string = DEFAULT_IMAGE_MODEL,
): Promise<DrawProxyReply> {
  const count = Math.min(Math.max(request.count ?? 1, 1), MAX_PICTURES);
  let answer: Response;
  try {
    answer = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model ?? model,
        prompt: request.prompt,
        n: count,
        size: request.size ?? DEFAULT_SIZE,
        // ASKED FOR, not cut out afterwards. Sprite Lab has to prompt for a
        // flat key colour and flood it away because its models will not draw
        // transparency; these will, and asking cannot eat a colour that also
        // appears on the subject (`p5lab/.../images/removeBackground`).
        ...(request.transparent
          ? {background: 'transparent', output_format: 'png'}
          : {}),
      }),
    });
  } catch (error) {
    // No answer at all: no network, or a hostname that does not resolve.
    return {
      pictures: [],
      failure: 'The drawing service could not be reached.',
      detail: error instanceof Error ? error.message : String(error),
    };
  }

  const body = (await answer.json().catch(() => ({}))) as ProviderReply;
  if (!answer.ok) {
    return {
      pictures: [],
      // Said in words a wizard can show. The status itself is the developer's
      // business and travels in `detail`.
      failure:
        answer.status === 401 || answer.status === 403
          ? 'The drawing service refused the key.'
          : answer.status === 429
            ? 'The drawing service is busy. Try again in a moment.'
            : 'The drawing service could not draw that.',
      detail: `${answer.status} ${body.error?.message ?? answer.statusText}`,
    };
  }

  const pictures = (body.data ?? [])
    .map(one => one.b64_json)
    .filter((base64): base64 is string => Boolean(base64))
    .map(base64 => ({base64, mediaType: 'image/png'}));

  return pictures.length > 0
    ? {pictures}
    : {
        // A 200 with nothing in it. The wizard shows an attempt that came back
        // empty; only the terminal can say why, which is usually a model that
        // answers in a shape this does not read.
        pictures: [],
        failure: 'The drawing service answered with no pictures.',
        detail: JSON.stringify(body).slice(0, 500),
      };
}

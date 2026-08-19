// Whether an upload is too big, and what to say about it.
//
// The check is one comparison; the MESSAGE is the part worth getting right and
// the part worth testing, so both live here rather than inline in the file
// browser's handler. A learner who picks a file and is told "upload failed" has
// learned nothing they can act on.
//
// The limit itself belongs to the lab (`CodebridgeConfig.maxUploadBytes`), for
// the reason `validMimeTypes` does: what a project can hold is a fact about the
// project, and a World Lab sound has nothing to say to a Python Lab data file
// about how big is too big.

/**
 * A byte count as a person reads it — `1.4 MB`.
 *
 * MB throughout, including for something small, and one decimal place. A limit
 * stated in MB beside a file stated in KB is two units the reader has to
 * convert between to see which is bigger, and that is the only question this
 * message exists to answer.
 */
export const megabytes = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** What to tell the learner, or undefined when the file is fine. */
export interface TooLarge {
  title: string;
  message: string;
}

/**
 * Whether `file` exceeds `maxBytes`, and what to say if it does.
 *
 * An undefined limit accepts anything, which is what a lab that has not set one
 * means. Exactly the limit is accepted — `>` and not `>=` — because a cap
 * announced as 2 MB should accept a file of 2 MB.
 */
export function tooLarge(
  file: {name: string; size: number},
  maxBytes: number | undefined,
): TooLarge | undefined {
  if (maxBytes === undefined || file.size <= maxBytes) {
    return undefined;
  }
  return {
    title: 'That file is too big',
    // Both sizes, because "too big" without a number is a dead end: the learner
    // cannot tell whether to find a shorter sound or a different one.
    message:
      `“${file.name}” is ${megabytes(file.size)}, and the limit is ` +
      `${megabytes(maxBytes)}.`,
  };
}

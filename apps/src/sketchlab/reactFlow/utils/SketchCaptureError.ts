// Safari's error stack omits the message, so the context travels as log fields.

const SOURCE_PREVIEW_LENGTH = 64;

// html-to-image rejects with a bare Event when an image fails to load.
const describeCause = (cause: unknown): Record<string, unknown> => {
  if (cause instanceof Error) {
    return {reason: cause.message};
  }
  if (cause instanceof Event) {
    const target = cause.target as HTMLImageElement | null;
    const source = target?.src;
    return {
      reason: `${cause.type} loading ${target?.tagName ?? 'element'}`,
      ...(source
        ? {
            source: source.slice(0, SOURCE_PREVIEW_LENGTH),
            sourceLength: source.length,
          }
        : {}),
    };
  }
  return {reason: String(cause)};
};

export class SketchCaptureError extends Error {
  readonly details: Record<string, unknown>;

  constructor(cause: unknown, context: Record<string, unknown>) {
    const details = {...describeCause(cause), ...context};
    super(`Sketch capture failed: ${details.reason}`);
    // The ES5 build target otherwise leaves this with Error's prototype.
    Object.setPrototypeOf(this, SketchCaptureError.prototype);
    this.name = 'SketchCaptureError';
    this.details = details;
  }
}

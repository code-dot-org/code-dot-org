// Format sketch lab export errors in a consistent structure for logging and reporting.

// Only the scheme and MIME type are logged: a full src can hold user asset paths.
const describeSource = (source: string): Record<string, unknown> => {
  const dataMimeType = /^data:([^;,]*)/.exec(source)?.[1];
  if (dataMimeType !== undefined) {
    return {
      sourceScheme: 'data',
      sourceMimeType: dataMimeType || 'unknown',
      sourceLength: source.length,
    };
  }
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(source)?.[1];
  return {sourceScheme: scheme ?? 'relative', sourceLength: source.length};
};

const describeTarget = (target: EventTarget | null): string => {
  if (target instanceof Element) {
    return target.tagName;
  }
  return target?.constructor?.name ?? 'unknown target';
};

const describeCause = (cause: unknown): Record<string, unknown> => {
  if (cause instanceof Error) {
    return {reason: cause.message};
  }
  if (cause instanceof Event) {
    const {target} = cause;
    return {
      reason: `${cause.type} loading ${describeTarget(target)}`,
      ...(target instanceof HTMLImageElement && target.src
        ? describeSource(target.src)
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

export function memcpy(
  trg: Uint8Array,
  trgOff: number,
  src: ArrayLike<number>,
  srcOff?: number,
  len?: number
) {
  if (srcOff === void 0) srcOff = 0;
  if (len === void 0) len = src.length - srcOff;
  for (let i = 0; i < len; ++i) trg[trgOff + i] = src[srcOff + i];
}

export function randomUint32() {
  const buf = new Uint8Array(4);
  getRandomBuf(buf);
  return new Uint32Array(buf.buffer)[0];
}

export let getRandomBuf: (buf: Uint8Array) => void;

export function lookup<T>(m: Map<T>, key: string): T {
  if (m.hasOwnProperty(key)) return m[key];
  return null;
}

export function assert(cond: boolean, msg = 'Assertion failed') {
  if (!cond) {
    throw new Error(msg);
  }
}

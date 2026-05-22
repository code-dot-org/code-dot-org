import '@testing-library/jest-dom';

// jsdom does not ship crypto.randomUUID; polyfill it so code that generates
// notebook/cell IDs works in tests without a browser context.
if (typeof crypto.randomUUID !== 'function') {
  Object.defineProperty(crypto, 'randomUUID', {
    value: () => {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}` as `${string}-${string}-${string}-${string}-${string}`;
    },
    writable: false,
    configurable: true,
  });
}

// structuredClone is absent in some jsdom versions; shim it so worker-message
// tests that call structuredClone do not throw.
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T;
}

// jsdom does not implement Web Workers. Stub the constructor so components
// that spawn a PyodideWorker do not throw on mount in unit tests.
// Tests that need to verify worker behavior should mock PyodideProvider directly.
if (typeof globalThis.Worker === 'undefined') {
  class WorkerStub {
    onmessage: ((e: MessageEvent) => void) | null = null;
    postMessage(_data: unknown): void { /* no-op */ }
    terminate(): void { /* no-op */ }
    addEventListener(): void { /* no-op */ }
    removeEventListener(): void { /* no-op */ }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Worker = WorkerStub;
}

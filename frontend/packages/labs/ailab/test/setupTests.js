vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    disconnect() {}
  },
);

// jsdom draws no canvas, so text measures 8px a character.
HTMLCanvasElement.prototype.getContext = () => ({
  measureText: text => ({width: text.length * 8}),
});

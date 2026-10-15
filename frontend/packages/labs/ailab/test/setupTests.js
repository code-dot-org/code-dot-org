vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    disconnect() {}
  },
);

HTMLCanvasElement.prototype.getContext = () => ({
  measureText: text => ({width: text.length * 8}),
});

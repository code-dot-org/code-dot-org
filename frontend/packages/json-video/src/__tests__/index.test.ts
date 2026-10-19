describe('@code-dot-org/json-video', () => {
  beforeAll(async () => {
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    await import('../index');
  });

  it('defines <json-video>', () => {
    expect(customElements.get('json-video')).toBeDefined();
  });

  it('builds the built-in controls in an open shadow root', () => {
    const el = document.createElement('json-video');
    expect(el.shadowRoot?.querySelector('#controls-bar')).not.toBeNull();
  });
});

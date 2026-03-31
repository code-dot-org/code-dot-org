/**
 * @vitest-environment jsdom
 */

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {initializeCore} from '../initializeCore';
import type {CorePlugin} from '../initializeCore';
import type {SiteConfig, SiteConfigExtensions} from '../SiteConfig';

describe('initializeCore', () => {
  beforeEach(() => {
    // Reset window.__CODE_STUDIO__ between tests
    delete (window as Partial<Window>).__CODE_STUDIO__;
  });

  describe('window.__CODE_STUDIO__ registration', () => {
    it('registers CodeStudioConfig on window.__CODE_STUDIO__ on first call', () => {
      expect(window.__CODE_STUDIO__).toBeUndefined();
      initializeCore();
      expect(window.__CODE_STUDIO__).toBeDefined();
    });

    it('does not overwrite window.__CODE_STUDIO__ if already set', () => {
      const sentinel = {environment: 'test'} as SiteConfig &
        SiteConfigExtensions;
      window.__CODE_STUDIO__ = sentinel;
      initializeCore();
      expect(window.__CODE_STUDIO__).toBe(sentinel);
    });

    it('is idempotent: safe to call multiple times', () => {
      initializeCore();
      const first = window.__CODE_STUDIO__;
      initializeCore();
      expect(window.__CODE_STUDIO__).toBe(first);
    });
  });

  describe('plugin lifecycle', () => {
    it('calls onCoreReady on a single plugin', () => {
      const plugin: CorePlugin = {onCoreReady: vi.fn()};
      initializeCore({plugins: [plugin]});
      expect(plugin.onCoreReady).toHaveBeenCalledOnce();
    });

    it('passes the SiteConfig to onCoreReady', () => {
      const plugin: CorePlugin = {onCoreReady: vi.fn()};
      initializeCore({plugins: [plugin]});
      const receivedConfig = vi.mocked(plugin.onCoreReady).mock.calls[0][0];
      expect(receivedConfig).toBeDefined();
      expect(receivedConfig.environment).toBeDefined();
    });

    it('calls onCoreReady on every plugin when multiple are provided', () => {
      const pluginA: CorePlugin = {onCoreReady: vi.fn()};
      const pluginB: CorePlugin = {onCoreReady: vi.fn()};
      initializeCore({plugins: [pluginA, pluginB]});
      expect(pluginA.onCoreReady).toHaveBeenCalledOnce();
      expect(pluginB.onCoreReady).toHaveBeenCalledOnce();
    });

    it('works with empty options', () => {
      expect(() => initializeCore({})).not.toThrow();
    });

    it('works with no plugins in options', () => {
      expect(() => initializeCore({plugins: []})).not.toThrow();
    });

    it('works with no argument', () => {
      expect(() => initializeCore()).not.toThrow();
    });
  });
});

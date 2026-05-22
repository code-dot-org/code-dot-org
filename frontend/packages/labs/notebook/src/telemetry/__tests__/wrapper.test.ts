import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

// ---------------------------------------------------------------------------
// Mock the observability backend so no real provider is loaded.
// vi.hoisted ensures mockCount is initialised before vi.mock is hoisted to the
// top of the compiled output.
// ---------------------------------------------------------------------------
const {mockCount, mockIsDevMode} = vi.hoisted(() => ({
  mockCount: vi.fn(),
  mockIsDevMode: vi.fn<() => boolean>(),
}));

vi.mock('@code-dot-org/core/plugins/observability', () => ({
  metrics: {
    count: mockCount,
    gauge: vi.fn(),
    distribution: vi.fn(),
  },
}));

// Mock devMode so wrapper.ts reads the controlled value rather than the real
// import.meta.env.DEV, which is always true inside Vitest.
vi.mock('../devMode', () => ({
  isDevMode: mockIsDevMode,
}));

import {trackEvent} from '../wrapper';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('trackEvent', () => {
  beforeEach(() => {
    mockCount.mockClear();
    // Default to production semantics — most tests do not want dev throws.
    mockIsDevMode.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes a safe payload through to the observability backend', () => {
    trackEvent('nblab.import.success', {format: 'ipynb', cells: 12});

    expect(mockCount).toHaveBeenCalledOnce();
    expect(mockCount).toHaveBeenCalledWith('nblab.import.success', 1, {
      format: 'ipynb',
      cells: 12,
    });
  });

  it('calls observability even when payload is omitted', () => {
    trackEvent('nblab.session.created');

    expect(mockCount).toHaveBeenCalledOnce();
    expect(mockCount).toHaveBeenCalledWith('nblab.session.created', 1, {});
  });

  describe('dev-mode PII enforcement', () => {
    beforeEach(() => mockIsDevMode.mockReturnValue(true));

    it('throws when sessionLabel is present', () => {
      expect(() =>
        trackEvent('nblab.session.created', {sessionLabel: 'abc123'}),
      ).toThrow(/forbidden field "sessionLabel"/i);
      expect(mockCount).not.toHaveBeenCalled();
    });

    it('throws when session_label is present', () => {
      // session_label is the snake_case form that may appear from form field
      // names in the session-picker; the denylist covers both variants.
      expect(() =>
        trackEvent('nblab.session.created', {session_label: 'Alice'}),
      ).toThrow(/forbidden field "session_label"/i);
      expect(mockCount).not.toHaveBeenCalled();
    });

    it('throws when cell_source is present', () => {
      expect(() =>
        trackEvent('nblab.import.attempt', {cell_source: 'print("hi")'}),
      ).toThrow(/forbidden field "cell_source"/i);
      expect(mockCount).not.toHaveBeenCalled();
    });

    it('throws when an api key field is present (OPENAI_API_KEY)', () => {
      expect(() =>
        trackEvent('nblab.import.failure', {OPENAI_API_KEY: 'sk-secret'}),
      ).toThrow(/forbidden field "OPENAI_API_KEY"/i);
      expect(mockCount).not.toHaveBeenCalled();
    });

    it('throws when learnerUrl is present', () => {
      expect(() =>
        trackEvent('nblab.artifact.shared', {
          learnerUrl: 'https://studio.code.org/projects/abc',
        }),
      ).toThrow(/forbidden field "learnerUrl"/i);
      expect(mockCount).not.toHaveBeenCalled();
    });
  });

  describe('production-mode PII stripping', () => {
    it('strips forbidden fields and calls observability with the clean payload', () => {
      trackEvent('nblab.import.success', {
        format: 'ipynb',
        // Forbidden — must be stripped silently in production mode.
        session_label: 'leak',
        // Safe field — must be forwarded.
        cells: 5,
      });

      expect(mockCount).toHaveBeenCalledOnce();
      expect(mockCount).toHaveBeenCalledWith('nblab.import.success', 1, {
        format: 'ipynb',
        cells: 5,
      });
    });
  });

  it('does not throw when the observability backend itself throws', () => {
    mockCount.mockImplementation(() => {
      throw new Error('provider crashed');
    });

    // Must not propagate — telemetry failures are silently swallowed.
    expect(() => trackEvent('nblab.quota.exceeded')).not.toThrow();
  });
});

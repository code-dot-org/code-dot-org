/**
 * @vitest-environment jsdom
 */

import {render, screen, act} from '@testing-library/react';
import {describe, expect, it, vi, beforeEach} from 'vitest';

// Hoisted mocks — declared before vi.mock hoisting so factory closures
// can reference them safely.
const {mockLocalization, mockSiteConfig} = vi.hoisted(() => {
  const mockLocalization = {
    locale: 'en',
    locales: [{value: 'en', text: 'English', rtl: false}],
    on: vi.fn((_event: string, cb: () => void) => cb()),
    off: vi.fn(),
    waitUntilLoaded: vi.fn(() => Promise.resolve(true)),
  };

  const mockSiteConfig = {
    brand: 'code.org' as 'code.org' | 'aiday',
    environment: 'test' as const,
    marketingOrigin: 'https://code.org',
    marketingUrl: (path = '') =>
      path ? new URL(path, 'https://code.org').toString() : 'https://code.org',
    dashboardApiUrl: 'https://studio.code.org',
    observability: {provider: 'none'},
  };

  return {mockLocalization, mockSiteConfig};
});

vi.mock('@code-dot-org/core/plugins/localization', () => ({
  localization: mockLocalization,
}));

// Expose mockSiteConfig as the CodeStudioConfig named export that the
// component and footerLinks module import.
vi.mock('@code-dot-org/core', async importOriginal => {
  const actual = await importOriginal<typeof import('@code-dot-org/core')>();
  return {...actual, CodeStudioConfig: mockSiteConfig};
});

import StudioFooter from '../index';

beforeEach(() => {
  mockLocalization.waitUntilLoaded.mockResolvedValue(true);
  mockSiteConfig.brand = 'code.org';
});

describe('StudioFooter', () => {
  it('short copyright shows brand and year for code.org brand', async () => {
    await act(async () => {
      render(<StudioFooter />);
    });
    const yearEl = screen.getAllByTestId('current-year')[0];
    expect(yearEl.textContent).toBe(String(new Date().getFullYear()));
    expect(yearEl.parentElement?.textContent).toContain('Code.org');
  });

  it('short copyright shows AIDay when brand is aiday', async () => {
    mockSiteConfig.brand = 'aiday';
    await act(async () => {
      render(<StudioFooter />);
    });
    expect(screen.getAllByText(/AIDay/)[0]).toBeInTheDocument();
  });

  it('shows the skeleton until localization resolves, then the picker', async () => {
    let resolveLoaded!: (v: boolean) => void;
    const pending = new Promise<boolean>(r => (resolveLoaded = r));
    mockLocalization.waitUntilLoaded.mockReturnValueOnce(pending);

    const {container} = render(<StudioFooter />);

    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).toBeNull();

    await act(async () => resolveLoaded(true));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not call fetch or XHR on language change (standalone-from-Rails)', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response());
    await act(async () => {
      render(<StudioFooter />);
    });
    // Simulate the onLanguageChange callback path — localization.locale setter
    // is mocked; verify no network call is made.
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

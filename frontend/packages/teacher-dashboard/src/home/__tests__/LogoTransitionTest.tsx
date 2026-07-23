import {act, render} from '@testing-library/react';
import cookies from 'js-cookie';
import React from 'react';
import '@testing-library/jest-dom';

import LogoTransition from '../LogoTransition';

const SEEN_COOKIE_NAME = 'hide_codeai_logo_transition';
const PRE_HIDE_STYLE_ID = 'logo-transition-pre-hide';
const HEADER_LOGO_CONTAINER_ID = 'header_logo_container';
const OPEN_FADE_MS = 1200;
const ANIMATED_DURATION_MS = 4500;
const HOLD_MS = 500;
const LAND_MS = 700;

const setupHeaderContainer = () => {
  const container = document.createElement('div');
  container.id = HEADER_LOGO_CONTAINER_ID;
  const link = document.createElement('a');
  link.id = 'logo_home_link';
  const img = document.createElement('img');
  img.src = '/assets/logo-codeai-inverse.svg';
  img.alt = 'CodeAI';
  jest.spyOn(img, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    left: 14,
    width: 130,
    height: 22,
    right: 144,
    bottom: 32,
    x: 14,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect);
  link.appendChild(img);
  container.appendChild(link);
  document.body.appendChild(container);
  return img;
};

const addPreHideStyle = () => {
  const style = document.createElement('style');
  style.id = PRE_HIDE_STYLE_ID;
  style.textContent = `#${HEADER_LOGO_CONTAINER_ID} img { visibility: hidden; }`;
  document.head.appendChild(style);
  return style;
};

const setLocationSearch = (search: string) => {
  Object.defineProperty(window, 'location', {
    value: {...window.location, search},
    writable: true,
  });
};

const setPrefersReducedMotion = (prefers: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? prefers : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
    writable: true,
    configurable: true,
  });
};

describe('LogoTransition', () => {
  const originalLocation = window.location;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    cookies.remove(SEEN_COOKIE_NAME, {path: '/'});
    document.getElementById(HEADER_LOGO_CONTAINER_ID)?.remove();
    document.getElementById(PRE_HIDE_STYLE_ID)?.remove();
    setLocationSearch('');
    setPrefersReducedMotion(false);
  });

  afterEach(() => {
    cookies.remove(SEEN_COOKIE_NAME, {path: '/'});
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
    jest.useRealTimers();
  });

  describe('mount target', () => {
    it('renders nothing when #header_logo_container is absent', () => {
      const {container} = render(<LogoTransition />);
      expect(container).toBeEmptyDOMElement();
      expect(document.querySelector('svg')).toBeNull();
    });
  });

  describe('suppression cookie', () => {
    it('renders nothing when the cookie is set', () => {
      setupHeaderContainer();
      cookies.set(SEEN_COOKIE_NAME, 'true', {path: '/'});
      render(<LogoTransition />);
      expect(document.body.querySelector('svg')).toBeNull();
    });

    it('removes the pre-hide <style> tag even when skipped via cookie', () => {
      setupHeaderContainer();
      addPreHideStyle();
      cookies.set(SEEN_COOKIE_NAME, 'true', {path: '/'});
      render(<LogoTransition />);
      expect(document.getElementById(PRE_HIDE_STYLE_ID)).toBeNull();
    });

    it('does not hide the native <img> when skipped via cookie', () => {
      const nativeImg = setupHeaderContainer();
      cookies.set(SEEN_COOKIE_NAME, 'true', {path: '/'});
      render(<LogoTransition />);
      expect(nativeImg.style.visibility).toBe('');
    });

    it('?logo-force=true bypasses the cookie and plays the animation', () => {
      const nativeImg = setupHeaderContainer();
      cookies.set(SEEN_COOKIE_NAME, 'true', {path: '/'});
      setLocationSearch('?logo-force=true');
      render(<LogoTransition />);
      // Native <img> hidden → animation flow took over.
      expect(nativeImg.style.visibility).toBe('hidden');
    });
  });

  describe('prefers-reduced-motion', () => {
    it('renders nothing when the user has prefers-reduced-motion set', () => {
      setupHeaderContainer();
      setPrefersReducedMotion(true);
      render(<LogoTransition />);
      expect(document.body.querySelector('svg')).toBeNull();
    });

    it('does not hide the native <img> under prefers-reduced-motion', () => {
      const nativeImg = setupHeaderContainer();
      setPrefersReducedMotion(true);
      render(<LogoTransition />);
      expect(nativeImg.style.visibility).toBe('');
    });

    it('removes the pre-hide <style> under prefers-reduced-motion', () => {
      setupHeaderContainer();
      addPreHideStyle();
      setPrefersReducedMotion(true);
      render(<LogoTransition />);
      expect(document.getElementById(PRE_HIDE_STYLE_ID)).toBeNull();
    });

    it('?logo-force=true bypasses prefers-reduced-motion', () => {
      const nativeImg = setupHeaderContainer();
      setPrefersReducedMotion(true);
      setLocationSearch('?logo-force=true');
      render(<LogoTransition />);
      expect(nativeImg.style.visibility).toBe('hidden');
    });
  });

  describe('window resize during playback', () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    const setViewport = (width: number, height: number) => {
      Object.defineProperty(window, 'innerWidth', {
        value: width,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: height,
        writable: true,
        configurable: true,
      });
    };

    afterEach(() => {
      setViewport(originalInnerWidth, originalInnerHeight);
    });

    const findCard = (): HTMLDivElement | undefined =>
      Array.from(
        document.body.querySelectorAll<HTMLDivElement>(
          'div[aria-hidden="true"]',
        ),
      ).find(el => el.style.top !== '');

    it('re-centers the card when the window resizes', () => {
      setViewport(1200, 800);
      setupHeaderContainer();
      render(<LogoTransition />);
      const card = findCard();
      expect(card).toBeDefined();
      const initialLeft = card!.style.left;

      setViewport(2000, 1200);
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(card!.style.left).not.toBe(initialLeft);
      // 2000 * 0.6 = 1200 capped at 700; left = (2000 - 700) / 2 = 650.
      expect(card!.style.left).toBe('650px');
    });

    it('stops re-centering once landing starts', () => {
      jest.useFakeTimers();
      setViewport(1200, 800);
      setupHeaderContainer();
      render(<LogoTransition />);
      // Drive through opening → playing → hold → landing.
      act(() => {
        jest.advanceTimersByTime(OPEN_FADE_MS);
      });
      act(() => {
        jest.advanceTimersByTime(ANIMATED_DURATION_MS);
      });
      act(() => {
        jest.advanceTimersByTime(HOLD_MS);
      });
      // Now in 'landing'. Card's top/left were just rewritten to the
      // native <img>'s rect; capture them.
      const card = findCard();
      expect(card).toBeDefined();
      const landingLeft = card!.style.left;

      setViewport(2000, 1200);
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      // No resize listener active during landing → no change.
      expect(card!.style.left).toBe(landingLeft);
    });
  });

  describe('accessibility', () => {
    it('marks the backdrop and card aria-hidden', () => {
      setupHeaderContainer();
      render(<LogoTransition />);
      const ariaHiddenDivs = Array.from(
        document.body.querySelectorAll('div[aria-hidden="true"]'),
      );
      // Both the backdrop and the card carry aria-hidden=true.
      expect(ariaHiddenDivs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('first mount, no cookie', () => {
    it('removes the pre-hide <style> tag', () => {
      setupHeaderContainer();
      addPreHideStyle();
      render(<LogoTransition />);
      expect(document.getElementById(PRE_HIDE_STYLE_ID)).toBeNull();
    });

    it('hides the native <img> via inline visibility', () => {
      const nativeImg = setupHeaderContainer();
      render(<LogoTransition />);
      expect(nativeImg.style.visibility).toBe('hidden');
    });

    it('does not render the stage SVG until the opening phase ends', () => {
      setupHeaderContainer();
      render(<LogoTransition />);
      // Phase starts as 'opening'; stage SVG isn't in DOM yet.
      expect(document.body.querySelector('svg')).toBeNull();
    });
  });

  describe('phase progression', () => {
    let nativeImg: HTMLImageElement;

    beforeEach(() => {
      jest.useFakeTimers();
      nativeImg = setupHeaderContainer();
    });

    it('mounts the stage SVG after the opening fade-in', () => {
      render(<LogoTransition />);
      act(() => {
        jest.advanceTimersByTime(OPEN_FADE_MS);
      });
      const stage = document.body.querySelector('svg');
      expect(stage).not.toBeNull();
      expect(stage).toHaveAttribute('viewBox', '0 109 1021 176');
      // Six animated elements: c, o, d, e, triangle, ibar.
      expect(stage!.querySelectorAll('g').length).toBeGreaterThanOrEqual(6);
    });

    it('runs through play → hold → landing, sets the cookie and restores native <img>', () => {
      render(<LogoTransition />);
      // Advance through each phase in chunks so React can flush state
      // updates between the setTimeout callbacks.
      act(() => {
        jest.advanceTimersByTime(OPEN_FADE_MS);
      });
      act(() => {
        jest.advanceTimersByTime(ANIMATED_DURATION_MS);
      });
      act(() => {
        jest.advanceTimersByTime(HOLD_MS);
      });
      act(() => {
        jest.advanceTimersByTime(LAND_MS);
      });
      expect(cookies.get(SEEN_COOKIE_NAME)).toBe('true');
      expect(nativeImg.style.visibility).toBe('');
    });
  });
});

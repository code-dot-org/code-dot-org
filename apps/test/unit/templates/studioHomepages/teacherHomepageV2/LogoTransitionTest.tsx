import {act, fireEvent, render} from '@testing-library/react';
import cookies from 'js-cookie';
import React from 'react';
import '@testing-library/jest-dom';

import LogoTransition from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/LogoTransition';

const SEEN_COOKIE_NAME = 'hide_codeai_logo_transition';
const PRE_HIDE_STYLE_ID = 'logo-transition-pre-hide';
const HEADER_LOGO_CONTAINER_ID = 'header_logo_container';
const OPEN_FADE_MS = 300;
const ANIMATED_DURATION_MS = 8000;
const HOLD_MS = 500;
const LAND_MS = 700;

const DEFAULT_PROPS = {
  animatedSrc: '/assets/logo-codeai-transition.webp',
  webmSrc: '/assets/logo-codeai-transition.webm',
  svgSrc: '/assets/logo-codeai-inverse.svg',
};

const setupHeaderContainer = () => {
  const container = document.createElement('div');
  container.id = HEADER_LOGO_CONTAINER_ID;
  const link = document.createElement('a');
  link.id = 'logo_home_link';
  const img = document.createElement('img');
  img.src = '/assets/logo-codeai-inverse.svg';
  img.alt = 'CodeAI';
  // jsdom returns 0×0 for getBoundingClientRect; the layout effect
  // gates card sizing on non-zero dims, so fake a realistic rect.
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
  // jsdom location.search is read-only; replace the whole location.
  Object.defineProperty(window, 'location', {
    value: {...window.location, search},
    writable: true,
  });
};

describe('LogoTransition', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Strip stale state from prior tests without wiping document.body
    // wholesale (that confuses RTL's auto-cleanup).
    cookies.remove(SEEN_COOKIE_NAME, {path: '/'});
    document.getElementById(HEADER_LOGO_CONTAINER_ID)?.remove();
    document.getElementById(PRE_HIDE_STYLE_ID)?.remove();
    setLocationSearch('');
  });

  afterEach(() => {
    cookies.remove(SEEN_COOKIE_NAME, {path: '/'});
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    jest.useRealTimers();
  });

  describe('mount target', () => {
    it('renders nothing when #header_logo_container is absent', () => {
      const {container} = render(<LogoTransition {...DEFAULT_PROPS} />);
      expect(container).toBeEmptyDOMElement();
      expect(document.querySelector('video')).toBeNull();
      expect(
        document.querySelector('img[src*="logo-codeai-transition"]')
      ).toBeNull();
    });
  });

  describe('suppression cookie', () => {
    it('renders nothing when the cookie is set', () => {
      setupHeaderContainer();
      cookies.set(SEEN_COOKIE_NAME, 'true', {path: '/'});
      render(<LogoTransition {...DEFAULT_PROPS} />);
      expect(
        document.querySelector('img[src*="logo-codeai-transition"]')
      ).toBeNull();
      expect(document.querySelector('video')).toBeNull();
    });

    it('removes the pre-hide <style> tag even when skipped via cookie', () => {
      setupHeaderContainer();
      addPreHideStyle();
      cookies.set(SEEN_COOKIE_NAME, 'true', {path: '/'});
      render(<LogoTransition {...DEFAULT_PROPS} />);
      expect(document.getElementById(PRE_HIDE_STYLE_ID)).toBeNull();
    });

    it('does not hide the native <img> when skipped via cookie', () => {
      const nativeImg = setupHeaderContainer();
      cookies.set(SEEN_COOKIE_NAME, 'true', {path: '/'});
      render(<LogoTransition {...DEFAULT_PROPS} />);
      expect(nativeImg.style.visibility).toBe('');
    });

    it('?logo-force=true bypasses the cookie and plays the animation', () => {
      setupHeaderContainer();
      cookies.set(SEEN_COOKIE_NAME, 'true', {path: '/'});
      setLocationSearch('?logo-force=true');
      render(<LogoTransition {...DEFAULT_PROPS} />);
      // The card is portaled to document.body and contains the SVG image.
      const portaledSvg = document.body.querySelector(
        'img[src="/assets/logo-codeai-inverse.svg"][alt=""]'
      );
      expect(portaledSvg).not.toBeNull();
    });
  });

  describe('first mount, no cookie', () => {
    it('removes the pre-hide <style> tag', () => {
      setupHeaderContainer();
      addPreHideStyle();
      render(<LogoTransition {...DEFAULT_PROPS} />);
      expect(document.getElementById(PRE_HIDE_STYLE_ID)).toBeNull();
    });

    it('hides the native <img> via inline visibility', () => {
      const nativeImg = setupHeaderContainer();
      render(<LogoTransition {...DEFAULT_PROPS} />);
      expect(nativeImg.style.visibility).toBe('hidden');
    });

    it('does not render the animated media until the opening phase ends', () => {
      setupHeaderContainer();
      render(<LogoTransition {...DEFAULT_PROPS} />);
      // Phase starts as 'opening'; media not yet in DOM.
      expect(
        document.querySelector('img[src*="logo-codeai-transition"]')
      ).toBeNull();
      expect(document.querySelector('video')).toBeNull();
    });
  });

  describe('media selection after opening phase', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      setupHeaderContainer();
    });

    it('renders the WebP <img> by default', () => {
      render(<LogoTransition {...DEFAULT_PROPS} />);
      act(() => {
        jest.advanceTimersByTime(OPEN_FADE_MS);
      });
      const animatedImg = document.querySelector(
        'img[src="/assets/logo-codeai-transition.webp"]'
      );
      expect(animatedImg).not.toBeNull();
      expect(document.querySelector('video')).toBeNull();
    });

    it('renders the WebM <video> under ?logo-video=true', () => {
      setLocationSearch('?logo-video=true');
      render(<LogoTransition {...DEFAULT_PROPS} />);
      act(() => {
        jest.advanceTimersByTime(OPEN_FADE_MS);
      });
      const video = document.querySelector('video');
      expect(video).not.toBeNull();
      expect(video).toHaveAttribute(
        'src',
        '/assets/logo-codeai-transition.webm'
      );
      expect(
        document.querySelector('img[src*="logo-codeai-transition"]')
      ).toBeNull();
    });

    it('falls back to the WebP <img> when ?logo-video=true but webmSrc is undefined', () => {
      setLocationSearch('?logo-video=true');
      render(<LogoTransition {...DEFAULT_PROPS} webmSrc={undefined} />);
      act(() => {
        jest.advanceTimersByTime(OPEN_FADE_MS);
      });
      expect(document.querySelector('video')).toBeNull();
      expect(
        document.querySelector('img[src="/assets/logo-codeai-transition.webp"]')
      ).not.toBeNull();
    });
  });

  describe('image-path duration timer', () => {
    let nativeImg: HTMLImageElement;

    beforeEach(() => {
      jest.useFakeTimers();
      nativeImg = setupHeaderContainer();
    });

    const advanceFullAnimation = () => {
      // Advance phase-by-phase so React can flush state updates between
      // each setTimeout: a single big advanceTimersByTime fires the
      // play-phase timer, but the hold/landing timers (scheduled by the
      // resulting state-update useEffects) end up missing the window.
      act(() => {
        jest.advanceTimersByTime(ANIMATED_DURATION_MS);
      });
      act(() => {
        jest.advanceTimersByTime(HOLD_MS);
      });
      act(() => {
        jest.advanceTimersByTime(LAND_MS);
      });
    };

    it('does not advance phases until <img> onLoad fires', () => {
      render(<LogoTransition {...DEFAULT_PROPS} webmSrc={undefined} />);
      act(() => {
        jest.advanceTimersByTime(OPEN_FADE_MS);
      });
      // Drive enough time to cover play + hold + landing, but skip onLoad.
      advanceFullAnimation();
      // Animation should not have completed — cookie unset, native still hidden.
      expect(cookies.get(SEEN_COOKIE_NAME)).toBeUndefined();
      expect(nativeImg.style.visibility).toBe('hidden');
    });

    it('completes the slide once onLoad fires, sets the cookie, restores native <img>', () => {
      render(<LogoTransition {...DEFAULT_PROPS} webmSrc={undefined} />);
      act(() => {
        jest.advanceTimersByTime(OPEN_FADE_MS);
      });
      const animatedImg = document.querySelector(
        'img[src="/assets/logo-codeai-transition.webp"]'
      ) as HTMLImageElement;
      expect(animatedImg).not.toBeNull();
      act(() => {
        fireEvent.load(animatedImg);
      });
      advanceFullAnimation();
      expect(cookies.get(SEEN_COOKIE_NAME)).toBe('true');
      expect(nativeImg.style.visibility).toBe('');
    });
  });
});

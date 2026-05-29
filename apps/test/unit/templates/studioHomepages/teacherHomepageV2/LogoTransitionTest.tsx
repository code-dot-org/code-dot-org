import {act, render} from '@testing-library/react';
import cookies from 'js-cookie';
import React from 'react';
import '@testing-library/jest-dom';

import LogoTransition from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/LogoTransition';

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

describe('LogoTransition', () => {
  const originalLocation = window.location;

  beforeEach(() => {
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

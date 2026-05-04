/**
 * @vitest-environment jsdom
 */

import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import type {Brand} from '@code-dot-org/core';

import {getBrandConfig} from '../index';

describe('getBrandConfig', () => {
  it('code.org copyright renders brand name and current year', () => {
    const {copyright} = getBrandConfig('code.org');
    const {container} = render(<>{copyright}</>);
    const text = container.textContent ?? '';
    expect(text).toContain('Code.org');
    expect(text).toContain(String(new Date().getFullYear()));
  });

  it('aiday copyright renders brand name and current year', () => {
    const {copyright} = getBrandConfig('aiday');
    const {container} = render(<>{copyright}</>);
    const text = container.textContent ?? '';
    expect(text).toContain('AIDay');
    expect(text).toContain(String(new Date().getFullYear()));
  });

  it('code.org trademark contains full legal text', () => {
    const {trademark} = getBrandConfig('code.org');
    const {container} = render(<>{trademark}</>);
    expect(container.textContent).toContain('trademarks of Code.org');
  });

  it('code.org fineprint contains vendor attributions and trademark', () => {
    const {fineprint} = getBrandConfig('code.org');
    const {container} = render(<>{fineprint}</>);
    const text = container.textContent ?? '';
    expect(text).toContain('Amazon, Google, and Microsoft');
    expect(text).toContain('trademarks of Code.org');
    expect(text).toContain('Built on GitHub from Microsoft');
  });

  it('aiday fineprint contains aiday trademark', () => {
    const {fineprint} = getBrandConfig('aiday');
    const {container} = render(<>{fineprint}</>);
    expect(container.textContent).toContain('trademarks of AIDay');
  });

  it('falls back to Code.org content for unknown brands', () => {
    const config = getBrandConfig('unknown-brand' as Brand);
    const {container} = render(<>{config.copyright}</>);
    expect(container.textContent).toContain('Code.org');
  });
});

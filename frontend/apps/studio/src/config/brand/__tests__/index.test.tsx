/**
 * @vitest-environment jsdom
 */

import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import type {Brand} from '@code-dot-org/core';

import {getBrandConfig} from '../index';

describe('getBrandConfig', () => {
  it('returns Code.org legalName for code.org brand', () => {
    expect(getBrandConfig('code.org').legalName).toBe('Code.org');
  });

  it('returns AIDay legalName for aiday brand', () => {
    expect(getBrandConfig('aiday').legalName).toBe('AIDay');
  });

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

  it('falls back to Code.org content for unknown brands', () => {
    const config = getBrandConfig('unknown-brand' as Brand);
    expect(config.legalName).toBe('Code.org');
  });
});

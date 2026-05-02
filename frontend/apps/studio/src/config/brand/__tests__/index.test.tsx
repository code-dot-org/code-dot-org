import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import type {Brand} from '@code-dot-org/core';

import {getBrandConfig} from '../index';

describe('getBrandConfig', () => {
  describe('code.org brand', () => {
    const config = getBrandConfig('code.org');

    it('returns the correct legalName', () => {
      expect(config.legalName).toBe('Code.org');
    });

    it('trademark renders "Code.org" and the current year in data-testid="current-year"', () => {
      render(<>{config.trademark}</>);
      expect(screen.getByTestId('current-year')).toHaveTextContent(
        String(new Date().getFullYear()),
      );
      expect(document.body.textContent).toMatch(/Code\.org/);
    });
  });

  describe('aiday brand', () => {
    const config = getBrandConfig('aiday');

    it('returns the correct legalName', () => {
      expect(config.legalName).toBe('AIDay');
    });

    it('trademark renders "AIDay" and the current year in data-testid="current-year"', () => {
      render(<>{config.trademark}</>);
      expect(screen.getByTestId('current-year')).toHaveTextContent(
        String(new Date().getFullYear()),
      );
      expect(document.body.textContent).toMatch(/AIDay/);
    });
  });

  it('default: case returns Code.org config for an unknown brand', () => {
    const config = getBrandConfig('unknown-brand' as Brand);
    expect(config.legalName).toBe('Code.org');
  });
});

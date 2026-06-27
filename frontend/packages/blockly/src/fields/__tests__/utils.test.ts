import type * as Blockly from 'blockly/core';
import {afterEach, describe, expect, it} from 'vitest';

import {
  createFieldIcon,
  createFieldText,
  defaultDropdownStyles,
  getCSSVariable,
  getWorkspaceTheme,
} from '../utils';

/*
 * These field helpers are DOM/string utilities (CSS-variable lookup, theme
 * detection off the injection div, and SVG text/icon element construction) with
 * no rendered workspace, so they run in jsdom. measureTextWidth needs real
 * canvas text measurement and lives in the browser test.
 */

const added: Element[] = [];
afterEach(() => {
  added.forEach(el => el.remove());
  added.length = 0;
});

// A minimal workspace stand-in: getWorkspaceTheme only calls getInjectionDiv().
const workspaceWithThemeAncestor = (theme?: string) => {
  const wrapper = document.createElement('div');
  if (theme !== undefined) {
    wrapper.setAttribute('data-theme', theme);
  }
  const injectionDiv = document.createElement('div');
  wrapper.appendChild(injectionDiv);
  document.body.appendChild(wrapper);
  added.push(wrapper);
  return {
    getInjectionDiv: () => injectionDiv,
  } as unknown as Blockly.WorkspaceSvg;
};

describe('getCSSVariable', () => {
  it('returns an empty string for an unset variable', () => {
    expect(getCSSVariable('definitely-unset-variable')).toBe('');
  });
});

describe('getWorkspaceTheme', () => {
  it('defaults to Dark when there is no workspace', () => {
    expect(getWorkspaceTheme(undefined)).toBe('Dark');
  });

  it('reads data-theme from the injection div ancestor', () => {
    expect(getWorkspaceTheme(workspaceWithThemeAncestor('Light'))).toBe(
      'Light',
    );
  });

  it('defaults to Dark when no ancestor carries data-theme', () => {
    expect(getWorkspaceTheme(workspaceWithThemeAncestor())).toBe('Dark');
  });
});

describe('defaultDropdownStyles', () => {
  it('uses the literal color fallbacks and fixed padding/width', () => {
    // Computed at import with no CSS variables present, so the fallbacks apply.
    expect(defaultDropdownStyles.color).toBe('#f5f5f5');
    expect(defaultDropdownStyles.backgroundColor).toBe('#1a1a1a');
    expect(defaultDropdownStyles.padding).toBe('5px');
    expect(defaultDropdownStyles.width).toBe('auto');
  });
});

describe('createFieldText', () => {
  it('builds a styled blocklyText element', () => {
    const el = createFieldText('hello', 5, 10, {
      fill: '#abc',
      fontSize: '13px',
      fontStyle: 'italic',
      fontFamily: 'Foo',
      className: 'extra',
    });

    expect(el.tagName.toLowerCase()).toBe('text');
    expect(el.textContent).toBe('hello');
    expect(el.getAttribute('x')).toBe('5');
    expect(el.getAttribute('y')).toBe('10');
    expect(el.getAttribute('fill')).toBe('#abc');
    expect(el.classList.contains('blocklyText')).toBe(true);
    expect(el.classList.contains('extra')).toBe(true);
    expect(el.style.fontSize).toBe('13px');
    expect(el.style.fontStyle).toBe('italic');
    expect(el.style.fontFamily).toBe('Foo');
  });

  it('omits optional styling when not provided', () => {
    const el = createFieldText('x', 0, 0);
    expect(el.classList.contains('blocklyText')).toBe(true);
    expect(el.style.fontSize).toBe('');
  });
});

describe('createFieldIcon', () => {
  it('builds a Font Awesome icon element', () => {
    const el = createFieldIcon('', 2, 3, {
      fontSize: '20px',
      className: 'icon',
    });

    expect(el.tagName.toLowerCase()).toBe('text');
    expect(el.textContent).toBe('');
    expect(el.getAttribute('x')).toBe('2');
    expect(el.style.fontFamily).toContain('Font Awesome 6 Pro');
    expect(el.style.fontSize).toBe('20px');
    expect(el.classList.contains('icon')).toBe(true);
  });

  it('defaults the icon font size to 13px', () => {
    expect(createFieldIcon('', 0, 0).style.fontSize).toBe('13px');
  });
});

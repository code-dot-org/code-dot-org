import {isTargetEditable} from '@cdo/apps/util/isTargetEditable';

describe('isTargetEditable', () => {
  it('is true for input and textarea elements', () => {
    expect(isTargetEditable(document.createElement('input'))).toBe(true);
    expect(isTargetEditable(document.createElement('textarea'))).toBe(true);
  });

  it('is true for a contentEditable element', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    // jsdom does not derive isContentEditable from the attribute, so stub it.
    Object.defineProperty(div, 'isContentEditable', {value: true});
    expect(isTargetEditable(div)).toBe(true);
  });

  it('is false for a non-editable element', () => {
    expect(isTargetEditable(document.createElement('div'))).toBe(false);
    expect(isTargetEditable(document.createElement('button'))).toBe(false);
  });

  it('is false for null or a non-element target', () => {
    expect(isTargetEditable(null)).toBe(false);
    expect(isTargetEditable(window)).toBe(false);
  });
});

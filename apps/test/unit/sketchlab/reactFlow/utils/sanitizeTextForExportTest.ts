import {sanitizeTextForExport} from '@cdo/apps/sketchlab/reactFlow/utils/sanitizeTextForExport';

const addText = (text: string) => {
  const element = document.createElement('div');
  element.textContent = text;
  document.body.appendChild(element);
  return element;
};

describe('sanitizeTextForExport', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('drops control characters XML forbids', () => {
    const element = addText('hello\u000bworld\u0000');

    sanitizeTextForExport(document.body);

    expect(element.textContent).toBe('helloworld');
  });

  it('drops lone surrogates and non-characters', () => {
    const element = addText('a\ud800b￾c');

    sanitizeTextForExport(document.body);

    expect(element.textContent).toBe('abc');
  });

  it('keeps emoji, CJK, tabs and newlines', () => {
    const text = 'a\u{1f600}中文\tb\nc';
    const element = addText(text);

    sanitizeTextForExport(document.body);

    expect(element.textContent).toBe(text);
  });

  it('restores the original text', () => {
    const text = 'hello\u000bworld';
    const element = addText(text);

    const restore = sanitizeTextForExport(document.body);
    restore();

    expect(element.textContent).toBe(text);
  });

  it('leaves clean text untouched', () => {
    const element = addText('a normal label');

    const restore = sanitizeTextForExport(document.body);
    restore();

    expect(element.textContent).toBe('a normal label');
  });
});

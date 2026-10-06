import {getSketchFontEmbedCss} from '@cdo/apps/sketchlab/reactFlow/utils/getSketchFontEmbedCss';

// Each test uses its own font file names: the module caches downloads by URL
// for the lifetime of the page, and that cache outlives a single test.
const geistFace = (
  file: string,
  {weight = '400', style = 'normal'}: {weight?: string; style?: string} = {}
) => `
  @font-face {
    font-family: 'Geist';
    font-style: ${style};
    font-weight: ${weight};
    src: url('/fonts/${file}.woff2') format('woff2');
  }
`;

const addStyleSheet = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

const addTextElement = (fontFamily: string, inlineStyle = '') => {
  const element = document.createElement('div');
  element.setAttribute('style', `font-family: ${fontFamily}; ${inlineStyle}`);
  element.textContent = 'a sketch label';
  document.body.appendChild(element);
};

const MAIN_FONT_STACK = "Geist, 'Noto Sans', 'Noto Sans JP', sans-serif";

describe('getSketchFontEmbedCss', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    fetchMock = jest.fn(() =>
      Promise.resolve({
        ok: true,
        blob: () =>
          Promise.resolve(
            new Blob([new Uint8Array([1, 2, 3])], {type: 'font/woff2'})
          ),
      })
    );
    (globalThis as unknown as {fetch?: jest.Mock}).fetch = fetchMock;
  });

  it('inlines the font file of a face the sketch draws with', async () => {
    addStyleSheet(geistFace('regular-inline'));
    addTextElement(MAIN_FONT_STACK);

    const css = await getSketchFontEmbedCss(document.body);

    expect(css).toContain('font-family: ');
    expect(css).toContain('url(data:font/woff2;base64,AQID)');
    expect(css).not.toContain('regular-inline.woff2');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost-studio.code.org/fonts/regular-inline.woff2'
    );
  });

  it('leaves out faces at a weight or style the sketch does not use', async () => {
    addStyleSheet(
      geistFace('regular-unused') +
        geistFace('bold-unused', {weight: '700'}) +
        geistFace('italic-unused', {style: 'italic'})
    );
    addTextElement(MAIN_FONT_STACK, 'font-weight: 700;');

    await getSketchFontEmbedCss(document.body);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost-studio.code.org/fonts/bold-unused.woff2'
    );
  });

  it('matches a variable face whose weight range covers the weight in use', async () => {
    addStyleSheet(geistFace('variable-range', {weight: '100 900'}));
    addTextElement(MAIN_FONT_STACK, 'font-weight: 500;');

    await getSketchFontEmbedCss(document.body);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('embeds nothing when the sketch only uses OS fonts', async () => {
    addStyleSheet(geistFace('regular-os-fonts'));
    addTextElement("Georgia, 'Times New Roman', serif");

    const css = await getSketchFontEmbedCss(document.body);

    expect(css).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('embeds nothing when the sketch has no text', async () => {
    addStyleSheet(geistFace('regular-no-text'));
    const shape = document.createElement('div');
    shape.setAttribute('style', `font-family: ${MAIN_FONT_STACK}`);
    document.body.appendChild(shape);

    const css = await getSketchFontEmbedCss(document.body);

    expect(css).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('drops a face whose file fails to download and keeps the rest', async () => {
    addStyleSheet(
      geistFace('missing-file') + geistFace('present-file', {weight: '700'})
    );
    addTextElement(MAIN_FONT_STACK);
    addTextElement(MAIN_FONT_STACK, 'font-weight: 700;');
    fetchMock.mockImplementation((url: string) =>
      url.includes('missing-file')
        ? Promise.resolve({ok: false, status: 404})
        : Promise.resolve({
            ok: true,
            blob: () => Promise.resolve(new Blob([new Uint8Array([4])])),
          })
    );

    const css = await getSketchFontEmbedCss(document.body);

    expect(css).toContain('font-weight: 700');
    expect(css).not.toContain('font-weight: 400');
  });

  it('downloads a font file once across exports', async () => {
    addStyleSheet(geistFace('cached-file'));
    addTextElement(MAIN_FONT_STACK);

    await getSketchFontEmbedCss(document.body);
    await getSketchFontEmbedCss(document.body);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('ignores stylesheets it is not allowed to read', async () => {
    addTextElement(MAIN_FONT_STACK);
    const crossOrigin = {
      get cssRules(): CSSRuleList {
        throw new Error('SecurityError');
      },
    } as CSSStyleSheet;
    jest
      .spyOn(document, 'styleSheets', 'get')
      .mockReturnValue([crossOrigin] as unknown as StyleSheetList);

    await expect(getSketchFontEmbedCss(document.body)).resolves.toBe('');
  });
});

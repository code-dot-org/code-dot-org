import {getSketchFontEmbedCss} from '@cdo/apps/sketchlab/reactFlow/utils/getSketchFontEmbedCss';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient');

const mockGet = HttpClient.get as jest.MockedFunction<typeof HttpClient.get>;

const fontResponse = (bytes: number[]) =>
  ({
    blob: () =>
      Promise.resolve(new Blob([new Uint8Array(bytes)], {type: 'font/woff2'})),
  } as unknown as Response);

// Each test uses its own font file names: the module caches downloads by URL
// for the lifetime of the page, and that cache outlives a single test.
const fontFace = (
  file: string,
  {
    family = 'Geist',
    weight = '400',
    style = 'normal',
    unicodeRange,
    woffFallback,
  }: {
    family?: string;
    weight?: string;
    style?: string;
    unicodeRange?: string;
    woffFallback?: string;
  } = {}
) => `
  @font-face {
    font-family: '${family}';
    font-style: ${style};
    font-weight: ${weight};
    ${unicodeRange ? `unicode-range: ${unicodeRange};` : ''}
    src: url('/fonts/${file}.woff2') format('woff2')${
  woffFallback ? `, url('/fonts/${woffFallback}.woff') format('woff')` : ''
};
  }
`;

// Our bundled Latin and per-locale fonts carry these ranges; a sketch that
// draws only Latin text must not pull the Hebrew file, or vice versa.
const LATIN_RANGE = 'U+0000-00FF, U+0131, U+2000-206F';
const HEBREW_RANGE = 'U+0590-05FF, U+FB1D-FB4F';

const addStyleSheet = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  return style;
};

const addTextElement = (
  fontFamily: string,
  inlineStyle = '',
  text = 'a sketch label'
) => {
  const element = document.createElement('div');
  element.setAttribute('style', `font-family: ${fontFamily}; ${inlineStyle}`);
  element.textContent = text;
  document.body.appendChild(element);
};

// The real --font-family-main stack: Geist first, then the per-locale Noto
// fallbacks that cover scripts Geist has no glyphs for.
const MAIN_FONT_STACK =
  "Geist, 'Noto Sans', 'Noto Sans Hebrew', 'Noto Sans JP', sans-serif";

describe('getSketchFontEmbedCss', () => {
  beforeAll(() => {
    // jsdom parses @font-face rules but does not expose their constructor.
    if (!('CSSFontFaceRule' in window)) {
      const probe = addStyleSheet(fontFace('constructor-probe'));
      Object.assign(window, {
        CSSFontFaceRule: probe.sheet?.cssRules[0].constructor,
      });
      probe.remove();
    }
  });

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    mockGet.mockResolvedValue(fontResponse([1, 2, 3]));
  });

  // jest.config.js clears mocks between tests but does not restore them, and
  // a surviving document.styleSheets spy would hide every later stylesheet.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('inlines the font file of a face the sketch draws with', async () => {
    addStyleSheet(fontFace('regular-inline'));
    addTextElement(MAIN_FONT_STACK);

    const css = await getSketchFontEmbedCss(document.body);

    expect(css).toContain('font-family: ');
    expect(css).toContain('url(data:font/woff2;base64,AQID)');
    expect(css).not.toContain('regular-inline.woff2');
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      'http://localhost-studio.code.org/fonts/regular-inline.woff2'
    );
  });

  it('leaves out faces at a weight or style the sketch does not use', async () => {
    addStyleSheet(
      fontFace('regular-unused') +
        fontFace('bold-unused', {weight: '700'}) +
        fontFace('italic-unused', {style: 'italic'})
    );
    addTextElement(MAIN_FONT_STACK, 'font-weight: 700;');

    await getSketchFontEmbedCss(document.body);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      'http://localhost-studio.code.org/fonts/bold-unused.woff2'
    );
  });

  it('matches a variable face whose weight range covers the weight in use', async () => {
    addStyleSheet(fontFace('variable-range', {weight: '100 900'}));
    addTextElement(MAIN_FONT_STACK, 'font-weight: 500;');

    await getSketchFontEmbedCss(document.body);

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('embeds nothing when the sketch only uses OS fonts', async () => {
    addStyleSheet(fontFace('regular-os-fonts'));
    addTextElement("Georgia, 'Times New Roman', serif");

    const css = await getSketchFontEmbedCss(document.body);

    expect(css).toBe('');
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('embeds nothing when the sketch has no text', async () => {
    addStyleSheet(fontFace('regular-no-text'));
    const shape = document.createElement('div');
    shape.setAttribute('style', `font-family: ${MAIN_FONT_STACK}`);
    document.body.appendChild(shape);

    const css = await getSketchFontEmbedCss(document.body);

    expect(css).toBe('');
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('drops a face whose file fails to download and keeps the rest', async () => {
    addStyleSheet(
      fontFace('missing-file') + fontFace('present-file', {weight: '700'})
    );
    addTextElement(MAIN_FONT_STACK);
    addTextElement(MAIN_FONT_STACK, 'font-weight: 700;');
    mockGet.mockImplementation((url: string) =>
      url.includes('missing-file')
        ? Promise.reject(
            new NetworkError('404 Not Found', {status: 404} as Response)
          )
        : Promise.resolve(fontResponse([4]))
    );

    const css = await getSketchFontEmbedCss(document.body);

    expect(css).toContain('font-weight: 700');
    expect(css).not.toContain('font-weight: 400');
  });

  it('downloads a font file once across exports', async () => {
    addStyleSheet(fontFace('cached-file'));
    addTextElement(MAIN_FONT_STACK);

    await getSketchFontEmbedCss(document.body);
    await getSketchFontEmbedCss(document.body);

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('inlines a bundled fallback font, not just the primary one', async () => {
    addStyleSheet(
      fontFace('latin-unused', {unicodeRange: LATIN_RANGE}) +
        fontFace('hebrew-used', {
          family: 'Noto Sans Hebrew',
          unicodeRange: HEBREW_RANGE,
        })
    );
    // The space is the only character Geist's Latin subset covers; it needs no
    // glyph, so it must not be what pulls that subset in.
    addTextElement(MAIN_FONT_STACK, '', 'שלום עולם');

    await getSketchFontEmbedCss(document.body);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      'http://localhost-studio.code.org/fonts/hebrew-used.woff2'
    );
  });

  it('leaves out a subset whose unicode-range the text does not reach', async () => {
    addStyleSheet(
      fontFace('latin-subset', {unicodeRange: LATIN_RANGE}) +
        fontFace('hebrew-subset', {
          family: 'Noto Sans Hebrew',
          unicodeRange: HEBREW_RANGE,
        })
    );
    addTextElement(MAIN_FONT_STACK, '', 'latin only');

    await getSketchFontEmbedCss(document.body);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      'http://localhost-studio.code.org/fonts/latin-subset.woff2'
    );
  });

  it('embeds only the first family in the stack that covers the text', async () => {
    addStyleSheet(
      fontFace('first-geist', {unicodeRange: LATIN_RANGE}) +
        fontFace('later-noto', {
          family: 'Noto Sans',
          unicodeRange: LATIN_RANGE,
        })
    );
    addTextElement(MAIN_FONT_STACK, '', 'latin label');

    await getSketchFontEmbedCss(document.body);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      'http://localhost-studio.code.org/fonts/first-geist.woff2'
    );
  });

  it('embeds one face per script when the text mixes them', async () => {
    addStyleSheet(
      fontFace('mixed-geist', {unicodeRange: LATIN_RANGE}) +
        fontFace('mixed-noto', {
          family: 'Noto Sans',
          unicodeRange: LATIN_RANGE,
        }) +
        fontFace('mixed-hebrew', {
          family: 'Noto Sans Hebrew',
          unicodeRange: HEBREW_RANGE,
        })
    );
    addTextElement(MAIN_FONT_STACK, '', 'shalom שלום');

    await getSketchFontEmbedCss(document.body);

    // Geist for the Latin, Noto Sans Hebrew for the Hebrew, and nothing from
    // Noto Sans: Geist already covers every Latin character.
    expect(mockGet.mock.calls.map(([url]) => url).sort()).toEqual([
      'http://localhost-studio.code.org/fonts/mixed-geist.woff2',
      'http://localhost-studio.code.org/fonts/mixed-hebrew.woff2',
    ]);
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

  // Deliberately after the spy above: it would see no stylesheets at all if
  // that spy outlived its test.
  it('inlines one file of a face that lists a woff fallback', async () => {
    addStyleSheet(
      fontFace('two-source', {woffFallback: 'two-source-fallback'})
    );
    addTextElement(MAIN_FONT_STACK);

    const css = await getSketchFontEmbedCss(document.body);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      'http://localhost-studio.code.org/fonts/two-source.woff2'
    );
    // The surviving url would point at a server the exported image cannot reach.
    expect(css).not.toContain('two-source-fallback.woff');
    expect(css).toContain("format('woff2')");
  });
});

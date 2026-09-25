import {inlineSvgStylesForExport} from '@cdo/apps/sketchlab/reactFlow/utils/inlineSvgStylesForExport';

const SVG_NS = 'http://www.w3.org/2000/svg';

// jsdom resolves no stylesheets against SVG, so the computed values are stated.
const stubComputedStyle = (values: Record<string, string>) =>
  jest.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: (property: string) => values[property] ?? '',
  } as unknown as CSSStyleDeclaration);

const buildSvg = () => {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const path = document.createElementNS(SVG_NS, 'path');
  svg.appendChild(path);
  document.body.appendChild(svg);
  return {svg, path};
};

describe('inlineSvgStylesForExport', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('writes the computed paint onto elements inside an svg', () => {
    const {path} = buildSvg();
    stubComputedStyle({stroke: 'rgb(168, 85, 247)', 'stroke-width': '3px'});

    inlineSvgStylesForExport(document.body);

    expect(path.style.getPropertyValue('stroke')).toBe('rgb(168, 85, 247)');
    expect(path.style.getPropertyValue('stroke-width')).toBe('3px');
  });

  it('leaves the svg element itself alone, since the clone styles it', () => {
    const {svg} = buildSvg();
    stubComputedStyle({fill: 'rgb(22, 163, 74)'});

    inlineSvgStylesForExport(document.body);

    expect(svg.getAttribute('style')).toBeNull();
  });

  it('restores an element that had no style attribute', () => {
    const {path} = buildSvg();
    stubComputedStyle({fill: 'rgb(22, 163, 74)'});

    const restore = inlineSvgStylesForExport(document.body);
    restore();

    expect(path.getAttribute('style')).toBeNull();
  });

  it('restores an element that already had inline styles', () => {
    const {path} = buildSvg();
    path.setAttribute('style', 'fill: red;');
    stubComputedStyle({fill: 'rgb(22, 163, 74)', stroke: 'rgb(0, 0, 255)'});

    const restore = inlineSvgStylesForExport(document.body);
    restore();

    expect(path.getAttribute('style')).toBe('fill: red;');
  });

  it('ignores html outside any svg', () => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    stubComputedStyle({fill: 'rgb(22, 163, 74)'});

    inlineSvgStylesForExport(document.body);

    expect(div.getAttribute('style')).toBeNull();
  });
});

import {
  findTourAnchorAt,
  findTourAnchorElements,
  tourAnchorSelector,
} from '@cdo/apps/lab2/productTours/authored/tourAnchors';

describe('tourAnchors', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-tour-anchor="panel" data-tour-label="Panel">
        <p>text</p>
        <button data-tour-anchor="button" aria-label="Go"><span>go</span></button>
      </div>
      <i></i>
      <button id="ailab-workspace-tab-results"><b>Testing</b></button>`;
  });

  it('returns the innermost marked element containing the element', () => {
    const match = findTourAnchorAt('ailab', document.querySelector('span')!);
    expect(match?.anchor).toEqual({name: 'button', label: 'Go'});
  });

  it('returns the enclosing anchor for an element outside the inner one', () => {
    const match = findTourAnchorAt('ailab', document.querySelector('p')!);
    expect(match?.anchor).toEqual({name: 'panel', label: 'Panel'});
  });

  it("finds a lab's selector anchors as well as marked elements", () => {
    const match = findTourAnchorAt('ailab', document.querySelector('b')!);
    expect(match?.anchor.name).toBe('workspace-tab-testing');
    expect(
      findTourAnchorElements('ailab').map(({anchor}) => anchor.name)
    ).toEqual(['panel', 'button', 'workspace-tab-testing']);
  });

  it('returns nothing outside every anchor', () => {
    expect(
      findTourAnchorAt('ailab', document.querySelector('i')!)
    ).toBeUndefined();
  });

  it("resolves a name to the lab's selector or to the attribute", () => {
    expect(tourAnchorSelector('ailab', 'workspace-tab-testing')).toBe(
      '#ailab-workspace-tab-results'
    );
    expect(tourAnchorSelector('ailab', 'train-button')).toBe(
      '[data-tour-anchor="train-button"]'
    );
    expect(tourAnchorSelector(undefined, 'a"b')).toBe(
      '[data-tour-anchor="a\\"b"]'
    );
  });
});

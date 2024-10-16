import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CachedElement, {unitTestExports} from '@cdo/apps/util/CachedElement';

const cache = unitTestExports.elementsHtmlCache;
const defaultType = 'div';
const defaultContent = '1';
const defaultKeys = ['key1', 'key2', 'key3'];
const defaultHtml = '<div>1</div>';
const nestedHtml = `<div>${defaultHtml}</div>`;

function getCacheSize(type = defaultType) {
  return Object.keys(cache[type]).length;
}

function getCachedElement(type = defaultType, key = defaultKeys[0]) {
  return cache[type][key];
}

function createDiv(content = defaultContent) {
  return <div>{content}</div>;
}

function createNested() {
  return <CachedElement {...defaultProps} />;
}

const defaultProps = {
  elementType: defaultType,
  cacheKey: defaultKeys[0],
  createElement: createDiv,
};

const spy = jest.fn(createDiv);

describe('CachedElement', () => {
  beforeEach(() => {
    spy.mockReset();
    unitTestExports.clearElementsCache(defaultType);
  });

  afterAll(() => {
    spy.mockReset();
    unitTestExports.clearElementsCache(defaultType);
  });

  it('caches and renders raw HTML', () => {
    const wrapper = mount(
      <CachedElement
        elementType="CachedElement"
        cacheKey={defaultKeys[0]}
        createElement={createNested}
      />
    );
    expect(spy.calledOnce);
    expect(getCacheSize()).toBe(1);
    expect(getCacheSize('CachedElement')).toBe(1);

    // verify that the nested `CachedElement` isn't in the tree
    expect(wrapper.find(CachedElement)).toHaveLength(1);
    expect(
      wrapper.find(CachedElement).childAt(0).find(CachedElement)
    ).toHaveLength(0);

    expect(getCachedElement()).toBe(defaultHtml);
    expect(getCachedElement('CachedElement')).toBe(nestedHtml);
    expect(wrapper.html()).toContain(nestedHtml);
    expect(wrapper.childAt(0).props().dangerouslySetInnerHTML.__html).toBe(
      nestedHtml
    );
  });

  it('only caches one element when rendering multiple with same key', () => {
    const wrapper = mount(
      <div>
        <CachedElement {...defaultProps} />
        <CachedElement {...defaultProps} />
        <CachedElement {...defaultProps} />
      </div>
    );
    expect(spy.calledOnce);
    expect(getCacheSize()).toBe(1);

    const cached = wrapper.find(CachedElement);
    expect(cached).toHaveLength(3);

    const cachedHtml = getCachedElement();
    cached.forEach(node => {
      expect(node.childAt(0).props().dangerouslySetInnerHTML.__html).toBe(
        cachedHtml
      );
    });
  });

  it('does not reuse identical elements with different keys', () => {
    const wrapper = mount(
      <div>
        <CachedElement {...defaultProps} />
        <CachedElement {...defaultProps} cacheKey={defaultKeys[1]} />
        <CachedElement {...defaultProps} cacheKey={defaultKeys[2]} />
      </div>
    );
    expect(spy.calledThrice);
    expect(getCacheSize()).toBe(3);

    const cached = wrapper.find(CachedElement);
    expect(cached).toHaveLength(3);

    cached.forEach(node => {
      expect(node.childAt(0).props().dangerouslySetInnerHTML.__html).toBe(
        defaultHtml
      );
    });
  });

  it('always renders first element cached for a given key', () => {
    const wrapper = mount(
      <div>
        <CachedElement {...defaultProps} />
        <CachedElement {...defaultProps} createElement={() => createDiv('2')} />
        <CachedElement {...defaultProps} createElement={() => createDiv('3')} />
      </div>
    );
    expect(spy.calledOnce);
    expect(getCacheSize()).toBe(1);
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).not.toContain('2');
    expect(wrapper.text()).not.toContain('3');
  });

  it('partitions cache by type', () => {
    mount(
      <div>
        <CachedElement {...defaultProps} />
        <CachedElement {...defaultProps} elementType="a" />
        <CachedElement {...defaultProps} elementType="p" />
      </div>
    );
    expect(spy.calledThrice);
    expect(getCacheSize()).toBe(1);
    expect(getCacheSize('a')).toBe(1);
    expect(getCacheSize('p')).toBe(1);
  });
});

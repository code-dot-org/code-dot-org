import {expect} from '../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
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
  createElement: createDiv
};

const spy = sinon.spy(createDiv);

describe('CachedElement', () => {
  beforeEach(() => {
    spy.resetHistory();
    unitTestExports.clearElementsCache(defaultType);
  });

  after(() => {
    spy.resetHistory();
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
    expect(getCacheSize()).to.equal(1);
    expect(getCacheSize('CachedElement')).to.equal(1);

    // verify that the nested `CachedElement` isn't in the tree
    expect(wrapper.find(CachedElement)).to.have.lengthOf(1);
    expect(
      wrapper
        .find(CachedElement)
        .childAt(0)
        .find(CachedElement)
    ).to.be.empty;

    expect(getCachedElement()).to.equal(defaultHtml);
    expect(getCachedElement('CachedElement')).to.equal(nestedHtml);
    expect(wrapper.html()).to.include(nestedHtml);
    expect(wrapper.childAt(0).props().dangerouslySetInnerHTML.__html).to.equal(
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
    expect(getCacheSize()).to.equal(1);

    const cached = wrapper.find(CachedElement);
    expect(cached).to.have.lengthOf(3);

    const cachedHtml = getCachedElement();
    cached.forEach(node => {
      expect(node.childAt(0).props().dangerouslySetInnerHTML.__html).to.equal(
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
    expect(getCacheSize()).to.equal(3);

    const cached = wrapper.find(CachedElement);
    expect(cached).to.have.lengthOf(3);

    cached.forEach(node => {
      expect(node.childAt(0).props().dangerouslySetInnerHTML.__html).to.equal(
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
    expect(getCacheSize()).to.equal(1);
    expect(wrapper.text()).to.include('1');
    expect(wrapper.text()).not.to.include('2');
    expect(wrapper.text()).not.to.include('3');
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
    expect(getCacheSize()).to.equal(1);
    expect(getCacheSize('a')).to.equal(1);
    expect(getCacheSize('p')).to.equal(1);
  });
});

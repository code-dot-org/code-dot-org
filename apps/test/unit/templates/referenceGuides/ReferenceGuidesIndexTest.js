import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';
import ReferenceGuideIndex from '@cdo/apps/templates/referenceGuides/ReferenceGuideIndex';

const makeReferenceGuide = (key, parent = null, pos = 0) => ({
  display_name: key,
  key: key,
  parent_reference_guide_key: parent,
  position: pos
});

describe('ReferenceGuideIndex', () => {
  it('displays the name of the reference guide', () => {
    const referenceGuides = [makeReferenceGuide('hello_world')];
    const wrapper = isolateComponent(
      <ReferenceGuideIndex referenceGuides={referenceGuides} />
    );
    expect(wrapper.findOne('.categories-box').content()).to.equal(
      'hello_world'
    );
  });

  it('sets up all the actions for a ref guide', () => {
    const referenceGuides = [makeReferenceGuide('hello_world')];
    const wrapper = isolateComponent(
      <ReferenceGuideIndex referenceGuides={referenceGuides} />
    );
    expect(wrapper.findAll('MiniIconButton').length).to.equal(4);
    expect(wrapper.findOne('.actions-box').toString()).to.contain('edit');
    expect(wrapper.findOne('.actions-box').toString()).to.contain('delete');
    expect(wrapper.findOne('.actions-box').toString()).to.contain('up');
    expect(wrapper.findOne('.actions-box').toString()).to.contain('down');
  });

  it('sorts reference guides by tree heirarchy', () => {
    /*
        a
      / | \
     b  c  d
       / \
      e   f

    should render in this order:
    a, b, c, e, f, d
    */
    let referenceGuides = [
      makeReferenceGuide('a', null, 0),
      makeReferenceGuide('b', 'a', 0),
      makeReferenceGuide('c', 'a', 1),
      makeReferenceGuide('d', 'a', 2),
      makeReferenceGuide('e', 'c', 0),
      makeReferenceGuide('f', 'c', 1)
    ];
    let wrapper = isolateComponent(
      <ReferenceGuideIndex referenceGuides={referenceGuides} />
    );
    expect(
      wrapper.findAll('.categories-box').map(box => box.content())
    ).to.deep.equal(['a', 'b', 'c', 'e', 'f', 'd']);

    // input order shouldn't matter
    referenceGuides = [
      makeReferenceGuide('f', 'c', 1),
      makeReferenceGuide('e', 'c', 0),
      makeReferenceGuide('d', 'a', 2),
      makeReferenceGuide('c', 'a', 1),
      makeReferenceGuide('b', 'a', 0),
      makeReferenceGuide('a', null, 0)
    ];
    wrapper = isolateComponent(
      <ReferenceGuideIndex referenceGuides={referenceGuides} />
    );
    expect(
      wrapper.findAll('.categories-box').map(box => box.content())
    ).to.deep.equal(['a', 'b', 'c', 'e', 'f', 'd']);
  });

  it('sorts reference guides within a category', () => {
    const referenceGuides = [
      makeReferenceGuide('a', null, 0),
      makeReferenceGuide('b', null, 4),
      makeReferenceGuide('c', null, 1),
      makeReferenceGuide('d', null, 3),
      makeReferenceGuide('e', null, 2)
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideIndex referenceGuides={referenceGuides} />
    );
    expect(
      wrapper.findAll('.categories-box').map(box => box.content())
    ).to.deep.equal(['a', 'c', 'e', 'd', 'b']);
  });

  it('indents the reference guides by level depth', () => {
    const referenceGuides = [
      makeReferenceGuide('a', null, 0),
      makeReferenceGuide('b', 'a', 0),
      makeReferenceGuide('c', 'a', 1),
      makeReferenceGuide('d', 'a', 2),
      makeReferenceGuide('e', 'c', 0),
      makeReferenceGuide('f', 'c', 1)
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideIndex referenceGuides={referenceGuides} />
    );
    expect(
      wrapper.findAll('.categories-box').map(box => box.props.style.paddingLeft)
    ).to.deep.equal(['4px', '24px', '24px', '44px', '44px', '24px']); // a b c e f d
  });
});

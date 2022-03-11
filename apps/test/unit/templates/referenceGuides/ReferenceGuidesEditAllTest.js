import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';
import ReferenceGuideEditAll from '@cdo/apps/templates/referenceGuides/ReferenceGuideEditAll';

const makeReferenceGuide = (key, parent = null, pos = 0) => ({
  display_name: key,
  key: key,
  parent_reference_guide_key: parent,
  position: pos
});

describe('ReferenceGuideEditAll', () => {
  it('displays the name of the reference guide', () => {
    const referenceGuides = [makeReferenceGuide('hello_world')];
    const wrapper = isolateComponent(
      <ReferenceGuideEditAll referenceGuides={referenceGuides} />
    );
    expect(wrapper.findOne('.guide-box').content()).to.equal('hello_world');
  });

  it('sets up all the actions for a ref guide', () => {
    const referenceGuides = [makeReferenceGuide('hello_world')];
    const wrapper = isolateComponent(
      <ReferenceGuideEditAll referenceGuides={referenceGuides} />
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
      <ReferenceGuideEditAll referenceGuides={referenceGuides} />
    );
    expect(
      wrapper.findAll('.guide-box').map(box => box.content())
    ).to.deep.equal(['a', 'b', 'c', 'e', 'f', 'd']);

    // input order shouldn't matter
    referenceGuides = [
      makeReferenceGuide('f', 'c', 1),
      makeReferenceGuide('e', 'c', 0),
      makeReferenceGuide('d', 'a', 2),
      makeReferenceGuide('c', 'a', 1),
      makeReferenceGuide('g', 'c', 3),
      makeReferenceGuide('b', 'a', 0),
      makeReferenceGuide('a', null, 0),
      makeReferenceGuide('h', 'c', 4)
    ];
    wrapper = isolateComponent(
      <ReferenceGuideEditAll referenceGuides={referenceGuides} />
    );
    expect(
      wrapper.findAll('.guide-box').map(box => box.content())
    ).to.deep.equal(['a', 'b', 'c', 'e', 'f', 'g', 'h', 'd']);
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
      <ReferenceGuideEditAll referenceGuides={referenceGuides} />
    );
    expect(
      wrapper.findAll('.guide-box').map(box => box.props.style.paddingLeft)
    ).to.deep.equal(['4px', '24px', '24px', '44px', '44px', '24px']); // a b c e f d
  });
});

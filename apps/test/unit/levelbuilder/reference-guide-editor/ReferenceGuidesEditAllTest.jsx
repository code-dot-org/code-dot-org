import {isolateComponent} from 'isolate-react';
import React from 'react';

import ReferenceGuideEditAll from '@cdo/apps/lib/levelbuilder/reference-guide-editor/ReferenceGuideEditAll';

const makeReferenceGuide = (key, parent = null, pos = 0) => ({
  display_name: key,
  key: key,
  parent_reference_guide_key: parent,
  position: pos,
});

describe('ReferenceGuideEditAll', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('displays the name of the reference guide', () => {
    const referenceGuides = [makeReferenceGuide('hello_world')];
    const wrapper = isolateComponent(
      <ReferenceGuideEditAll
        referenceGuides={referenceGuides}
        baseUrl={'/courses/etc/guides'}
      />
    );
    expect(wrapper.findOne('.guide-box').content()).toBe('hello_world');
  });

  it('sets up all the actions for a ref guide', () => {
    const referenceGuides = [makeReferenceGuide('hello_world')];
    const wrapper = isolateComponent(
      <ReferenceGuideEditAll
        referenceGuides={referenceGuides}
        baseUrl={'/courses/etc/guides'}
      />
    );
    expect(wrapper.findAll('MiniIconButton').length).toBe(4);
    expect(wrapper.findOne('.actions-box').toString()).toContain('edit');
    expect(wrapper.findOne('.actions-box').toString()).toContain('delete');
    expect(wrapper.findOne('.actions-box').toString()).toContain('up');
    expect(wrapper.findOne('.actions-box').toString()).toContain('down');
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
      makeReferenceGuide('f', 'c', 1),
    ];
    let wrapper = isolateComponent(
      <ReferenceGuideEditAll
        referenceGuides={referenceGuides}
        baseUrl={'/courses/etc/guides'}
      />
    );
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'a',
      'b',
      'c',
      'e',
      'f',
      'd',
    ]);

    // input order shouldn't matter
    referenceGuides = [
      makeReferenceGuide('f', 'c', 1),
      makeReferenceGuide('e', 'c', 0),
      makeReferenceGuide('d', 'a', 2),
      makeReferenceGuide('c', 'a', 1),
      makeReferenceGuide('g', 'c', 3),
      makeReferenceGuide('b', 'a', 0),
      makeReferenceGuide('a', null, 0),
      makeReferenceGuide('h', 'c', 4),
    ];
    wrapper = isolateComponent(
      <ReferenceGuideEditAll
        referenceGuides={referenceGuides}
        baseUrl={'/courses/etc/guides'}
      />
    );
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'a',
      'b',
      'c',
      'e',
      'f',
      'g',
      'h',
      'd',
    ]);
  });

  it('indents the reference guides by level depth', () => {
    const referenceGuides = [
      makeReferenceGuide('a', null, 0),
      makeReferenceGuide('b', 'a', 0),
      makeReferenceGuide('c', 'a', 1),
      makeReferenceGuide('d', 'a', 2),
      makeReferenceGuide('e', 'c', 0),
      makeReferenceGuide('f', 'c', 1),
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideEditAll
        referenceGuides={referenceGuides}
        baseUrl={'/courses/etc/guides'}
      />
    );
    expect(
      wrapper.findAll('.guide-box').map(box => box.props.style.paddingLeft)
    ).toEqual(['4px', '24px', '24px', '44px', '44px', '24px']); // a b c e f d
  });

  it('allows guides to be moved', () => {
    fetchSpy.mockReturnValue(
      Promise.resolve({
        ok: true,
      })
    );
    const referenceGuides = [
      makeReferenceGuide('a', null, 0),
      makeReferenceGuide('b', null, 1),
      makeReferenceGuide('c', null, 2),
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideEditAll
        referenceGuides={referenceGuides}
        baseUrl={'/courses/etc/guides'}
      />
    );
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'a',
      'b',
      'c',
    ]);

    // click down on b
    wrapper
      .findAll('.actions-box')[1]
      .findAll('MiniIconButton')[3]
      .props.func();
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'a',
      'c',
      'b',
    ]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // click up on a
    wrapper
      .findAll('.actions-box')[0]
      .findAll('MiniIconButton')[2]
      .props.func();
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'a',
      'c',
      'b',
    ]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // click down on b
    wrapper
      .findAll('.actions-box')[2]
      .findAll('MiniIconButton')[3]
      .props.func();
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'a',
      'c',
      'b',
    ]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // click down on a
    wrapper
      .findAll('.actions-box')[0]
      .findAll('MiniIconButton')[3]
      .props.func();
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'c',
      'a',
      'b',
    ]);
    expect(fetchSpy).toHaveBeenCalledTimes(4);
  });

  it('allows guides to be deleted', () => {
    const referenceGuides = [
      makeReferenceGuide('a', null, 0),
      makeReferenceGuide('b', null, 1),
      makeReferenceGuide('c', null, 2),
      makeReferenceGuide('d', 'b', 0),
      makeReferenceGuide('e', 'b', 1),
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideEditAll
        referenceGuides={referenceGuides}
        baseUrl={'/courses/etc/guides'}
      />
    );
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'a',
      'b',
      'd',
      'e',
      'c',
    ]);

    // click delete on second
    wrapper
      .findAll('.actions-box')[1]
      .findAll('MiniIconButton')[1]
      .props.func();
    expect(wrapper.exists('DeleteWarningDialog'));

    // confirm delete
    wrapper.findOne('DeleteWarningDialog').props.deleteGuide();
    expect(wrapper.findAll('.guide-box').map(box => box.content())).toEqual([
      'a',
      'c',
    ]);
    expect(wrapper.exists('DeleteWarningDialog')).not.toBe(true);
  });
});

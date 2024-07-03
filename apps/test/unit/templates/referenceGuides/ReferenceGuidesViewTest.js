import {isolateComponent} from 'isolate-react';
import React from 'react';

import ReferenceGuideView from '@cdo/apps/templates/referenceGuides/ReferenceGuideView';

describe('ReferenceGuideView', () => {
  it('reference guide shows title', () => {
    const referenceGuide = {
      display_name: 'display name',
      content: 'markdown text',
      position: 0,
      key: 'guide',
      parent_reference_guide_key: null,
    };
    const wrapper = isolateComponent(
      <ReferenceGuideView
        referenceGuide={referenceGuide}
        referenceGuides={[referenceGuide]}
        baseUrl={'fgsfds'}
      />
    );
    expect(wrapper.findOne('h1').content()).toBe(referenceGuide.display_name);
  });

  it('reference guide shows content', () => {
    const referenceGuide = {
      display_name: 'display name',
      content: 'markdown text',
      position: 0,
      key: 'guide',
      parent_reference_guide_key: null,
    };
    const wrapper = isolateComponent(
      <ReferenceGuideView
        referenceGuide={referenceGuide}
        referenceGuides={[referenceGuide]}
        baseUrl={'fgsfds'}
      />
    );
    expect(wrapper.findOne('ReferenceGuide').props.referenceGuide).toBe(
      referenceGuide
    );
  });

  it('reference guide formats categories for nav bar', () => {
    const referenceGuide = {
      display_name: 'display name 3',
      content: 'content 3',
      key: 'guide3',
      position: 0,
      parent_reference_guide_key: 'guide1',
    };
    // guide1
    /// guide3
    //// guide5
    // guide2
    /// guide4
    const referenceGuides = [
      {
        display_name: 'display name 1',
        content: 'content 1',
        key: 'guide1',
        position: 0,
        parent_reference_guide_key: null,
      },
      {
        display_name: 'display name 2',
        content: 'content 2',
        key: 'guide2',
        position: 1,
        parent_reference_guide_key: null,
      },
      referenceGuide,
      {
        display_name: 'display name 4',
        content: 'content 4',
        key: 'guide4',
        position: 0,
        parent_reference_guide_key: 'guide2',
      },
      {
        display_name: 'display name 5',
        content: 'content 5',
        key: 'guide5',
        position: 0,
        parent_reference_guide_key: 'guide3',
      },
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideView
        referenceGuide={referenceGuide}
        referenceGuides={referenceGuides}
        baseUrl={'fgsfds'}
      />
    );
    const bar = wrapper.findOne('NavigationBar');
    expect(bar.props.children.length).toBe(2);
    expect(bar.props.children[0].key).toBe('guide1');
    expect(bar.props.children[1].key).toBe('guide2');

    // renders first category item
    expect(bar.props.children[0].props.children[0].props.text).toContain(
      'display name 3'
    );
    expect(bar.props.children[0].props.children[1].props.text).toContain(
      'display name 5'
    );
  });
});

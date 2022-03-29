import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';
import color from '@cdo/apps/util/color';
import ReferenceGuideView from '@cdo/apps/templates/referenceGuides/ReferenceGuideView';

describe('ReferenceGuideView', () => {
  it('reference guide shows title', () => {
    const referenceGuide = {
      display_name: 'display name',
      content: 'markdown text',
      position: 0,
      key: 'guide',
      parent_reference_guide_key: 'concepts'
    };
    const wrapper = isolateComponent(
      <ReferenceGuideView
        referenceGuide={referenceGuide}
        referenceGuides={[referenceGuide]}
      />
    );
    expect(wrapper.findOne('h1').content()).to.equal(
      referenceGuide.display_name
    );
  });

  it('reference guide shows content', () => {
    const referenceGuide = {
      display_name: 'display name',
      content: 'markdown text',
      position: 0,
      key: 'guide',
      parent_reference_guide_key: 'concepts'
    };
    const wrapper = isolateComponent(
      <ReferenceGuideView
        referenceGuide={referenceGuide}
        referenceGuides={[referenceGuide]}
      />
    );
    expect(wrapper.findOne('EnhancedSafeMarkdown').props.markdown).to.equal(
      referenceGuide.content
    );
  });

  it('reference guide formats categories for nav bar', () => {
    const referenceGuide = {
      display_name: 'display name 3',
      content: 'content 3',
      key: 'guide3',
      position: 0,
      parent_reference_guide_key: 'guide1'
    };
    const referenceGuides = [
      {
        display_name: 'display name 1',
        content: 'content 1',
        key: 'guide1',
        position: 0,
        parent_reference_guide_key: 'concepts'
      },
      {
        display_name: 'display name 2',
        content: 'content 2',
        key: 'guide2',
        position: 1,
        parent_reference_guide_key: 'concepts'
      },
      referenceGuide,
      {
        display_name: 'display name 4',
        content: 'content 4',
        key: 'guide4',
        position: 0,
        parent_reference_guide_key: 'guide2'
      }
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideView
        referenceGuide={referenceGuide}
        referenceGuides={referenceGuides}
      />
    );
    expect(wrapper.findOne('NavigationBar').props.categories.length).to.equal(
      2
    );
    expect(wrapper.findOne('NavigationBar').props.categories[0].key).to.equal(
      'guide1'
    );
    expect(wrapper.findOne('NavigationBar').props.categories[1].key).to.equal(
      'guide2'
    );
    expect(wrapper.findOne('NavigationBar').props.categories[0].color).to.equal(
      color.teal
    );

    const innerContent = JSON.stringify(
      wrapper.findOne('NavigationBar').props.categories[0].content
    );
    expect(innerContent).to.include('display name 3');
    expect(innerContent).to.not.include('display name 4');
  });
});

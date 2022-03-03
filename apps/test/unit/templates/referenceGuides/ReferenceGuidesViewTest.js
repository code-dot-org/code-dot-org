import React from 'react';
import {isolateComponent} from 'isolate-react';
import {expect} from '../../../util/reconfiguredChai';
import ReferenceGuideView from '@cdo/apps/templates/referenceGuides/ReferenceGuideView';

describe('ReferenceGuideView', () => {
  it('reference guide shows title', () => {
    const referenceGuide = {
      display_name: 'display name',
      content: 'markdown text'
    };
    const wrapper = isolateComponent(
      <ReferenceGuideView referenceGuide={referenceGuide} />
    );
    expect(wrapper.findOne('h1').content()).to.equal(
      referenceGuide.display_name
    );
  });

  it('reference guide shows content', () => {
    const referenceGuide = {
      display_name: 'display name',
      content: 'markdown text'
    };
    const wrapper = isolateComponent(
      <ReferenceGuideView referenceGuide={referenceGuide} />
    );
    expect(wrapper.findOne('EnhancedSafeMarkdown').props.markdown).to.equal(
      referenceGuide.content
    );
  });
});

import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SummaryTeacherInstructions from '@cdo/apps/templates/levelSummary/SummaryTeacherInstructions';

const JS_DATA = {
  level: {}
};

const setUpWrapper = (jsData = {}) => {
  const wrapper = mount(
    <SummaryTeacherInstructions scriptData={{...JS_DATA, ...jsData}} />
  );

  return wrapper;
};

describe('SummaryTeacherInstructions', () => {
  it('renders teacher markdown if defined', () => {
    const wrapper = setUpWrapper({teacher_markdown: 'test teacher markdown'});

    expect(wrapper.find('SafeMarkdown').length).to.eq(1);
    expect(wrapper.find('SafeMarkdown').at(0).text()).to.eq(
      'test teacher markdown'
    );
  });
});

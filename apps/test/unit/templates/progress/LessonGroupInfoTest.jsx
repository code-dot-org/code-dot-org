import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import LessonGroupInfo from '@cdo/apps/templates/progress/LessonGroupInfo';

const DEFAULT_PROPS = {
  description: 'This is an awesome Lesson Group.',
  bigQuestions: 'Who? What?'
};

describe('LessonGroupInfoDialog', () => {
  it('renders description and big questions', () => {
    const wrapper = shallow(<LessonGroupInfo {...DEFAULT_PROPS} />);

    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(2);
    expect(
      wrapper
        .find('SafeMarkdown')
        .at(0)
        .props().markdown
    ).to.equal('This is an awesome Lesson Group.');

    expect(
      wrapper
        .find('SafeMarkdown')
        .at(1)
        .props().markdown
    ).to.equal('Who? What?');
  });
});

import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import LessonGroupInfoDialog from '@cdo/apps/templates/progress/LessonGroupInfoDialog';

const DEFAULT_PROPS = {
  isOpen: true,
  displayName: 'Lesson Group Name',
  description: 'This is an awesome Lesson Group.',
  closeDialog: () => {},
  bigQuestions: ['Who?', 'What?']
};

describe('LessonGroup', () => {
  it('renders dialog with description and big questions', () => {
    const wrapper = shallow(<LessonGroupInfoDialog {...DEFAULT_PROPS} />);

    expect(wrapper.find('h2')).to.have.lengthOf(1);
    expect(wrapper.contains('Lesson Group Name')).to.equal(true);

    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown').props().markdown).to.equal(
      'This is an awesome Lesson Group.'
    );

    expect(wrapper.find('li')).to.have.lengthOf(2);
    expect(wrapper.contains('Who?')).to.equal(true);
    expect(wrapper.contains('What?')).to.equal(true);

    expect(wrapper.find('Button')).to.have.lengthOf(1);
  });
});

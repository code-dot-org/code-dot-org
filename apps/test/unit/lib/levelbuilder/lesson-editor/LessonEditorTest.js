import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';

describe('LessonEditor', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      displayName: 'Lesson Name',
      overview: 'Lesson Overview',
      studentOverview: 'Overview of the lesson for students',
      shortTitle: 'Lesson',
      unplugged: false,
      lockable: false,
      assessment: false,
      creativeCommonsLicense: 'Creative Commons BY-NC-SA',
      purpose: 'The purpose of the lesson is for people to learn',
      preparation: '- One',
      announcements: []
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonEditor {...defaultProps} />);
    expect(wrapper.contains('Lesson Name'));
    expect(wrapper.contains('Lesson Overview'));
    expect(wrapper.contains('Overview of the lesson for students'));
    expect(
      wrapper.contains('The purpose of the lesson is for people to learn')
    );
    expect(wrapper.find('Connect(ActivitiesEditor)').length).to.equal(1);
    expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(4);
    expect(wrapper.find('input').length).to.equal(5);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('AnnouncementsEditor').length).to.equal(1);
  });
});

import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import LessonNavigationDropdown from '@cdo/apps/templates/lessonOverview/LessonNavigationDropdown';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

const shortLessonList = [
  {
    id: 1,
    key: 'lesson-1',
    position: 1,
    displayName: 'Lesson 1',
    link: '/lessons/1'
  },
  {
    id: 2,
    key: 'lesson-2',
    position: 2,
    displayName: 'Lesson 2',
    link: '/lessons/2'
  }
];

let longLessonList = [];
for (let i = 1; i <= 15; i++) {
  longLessonList.push({
    id: i,
    key: `lesson-${i}`,
    position: i,
    displayName: `Lesson ${i}`,
    link: `/lessons/${i}`
  });
}

let lesson = {
  unit: {
    displayName: 'Unit 1',
    link: '/s/unit-1',
    lessons: []
  },
  id: 3,
  key: 'lesson-1',
  position: 1,
  resources: {},
  objectives: [],
  vocabularies: [],
  displayName: 'Lesson 1',
  overview: 'Lesson Overview',
  purpose: 'The purpose of the lesson is for people to learn',
  preparation: '- One',
  assessmentOpportunities: 'Assessment Opportunities'
};

describe('LessonNavigationDropdown', () => {
  it('renders dropdown for short lesson list', () => {
    lesson.unit.lessons = shortLessonList;
    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    expect(wrapper.find('a').length).to.equal(2);

    expect(wrapper.contains('1 - Lesson 1')).to.be.true;
    expect(wrapper.contains('2 - Lesson 2')).to.be.true;
  });

  it('renders dropdown for long lesson list', () => {
    lesson.unit.lessons = longLessonList;
    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    expect(wrapper.find('a').length).to.equal(12);

    expect(wrapper.contains('Lessons 1 to 10')).to.be.true;
    expect(wrapper.contains('1 - Lesson 1')).to.be.true;
    expect(wrapper.contains('2 - Lesson 2')).to.be.true;
    expect(wrapper.contains('3 - Lesson 3')).to.be.true;
    expect(wrapper.contains('4 - Lesson 4')).to.be.true;
    expect(wrapper.contains('5 - Lesson 5')).to.be.true;
    expect(wrapper.contains('6 - Lesson 6')).to.be.true;
    expect(wrapper.contains('7 - Lesson 7')).to.be.true;
    expect(wrapper.contains('8 - Lesson 8')).to.be.true;
    expect(wrapper.contains('9 - Lesson 9')).to.be.true;
    expect(wrapper.contains('10 - Lesson 10')).to.be.true;
    expect(wrapper.contains('Lessons 11 to 15')).to.be.true;
  });

  it('switches open section when click new section', () => {
    lesson.unit.lessons = longLessonList;
    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find('a').length).to.equal(12);

    expect(wrapper.contains('Lessons 1 to 10')).to.be.true;
    expect(wrapper.contains('1 - Lesson 1')).to.be.true;
    expect(wrapper.contains('2 - Lesson 2')).to.be.true;
    expect(wrapper.contains('3 - Lesson 3')).to.be.true;
    expect(wrapper.contains('4 - Lesson 4')).to.be.true;
    expect(wrapper.contains('5 - Lesson 5')).to.be.true;
    expect(wrapper.contains('6 - Lesson 6')).to.be.true;
    expect(wrapper.contains('7 - Lesson 7')).to.be.true;
    expect(wrapper.contains('8 - Lesson 8')).to.be.true;
    expect(wrapper.contains('9 - Lesson 9')).to.be.true;
    expect(wrapper.contains('10 - Lesson 10')).to.be.true;
    expect(wrapper.contains('Lessons 11 to 15')).to.be.true;

    let section2 = wrapper.find('a').at(11);
    section2.simulate('click');

    expect(wrapper.find('a').length).to.equal(7);

    expect(wrapper.contains('Lessons 1 to 10')).to.be.true;
    expect(wrapper.contains('Lessons 11 to 15')).to.be.true;
    expect(wrapper.contains('11 - Lesson 11')).to.be.true;
    expect(wrapper.contains('12 - Lesson 12')).to.be.true;
    expect(wrapper.contains('13 - Lesson 13')).to.be.true;
    expect(wrapper.contains('14 - Lesson 14')).to.be.true;
    expect(wrapper.contains('15 - Lesson 15')).to.be.true;
  });

  it('navigates when click lesson', () => {
    sinon.stub(utils, 'navigateToHref');

    lesson.unit.lessons = longLessonList;
    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find('a').length).to.equal(12);
    let lesson1 = wrapper.find('a').at(1);
    expect(
      wrapper
        .find('a')
        .at(1)
        .contains('1 - Lesson 1')
    ).to.be.true;
    lesson1.simulate('click');

    expect(utils.navigateToHref).to.have.been.calledOnce;
    utils.navigateToHref.restore();
  });
});

import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import LessonNavigationDropdown from '@cdo/apps/templates/lessonOverview/LessonNavigationDropdown';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const singleLessonGroup = [
  {
    key: 'lg-1',
    displayName: 'Lesson Group',
    userFacing: true,
    lessons: [
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
    ]
  }
];

const nonUserFacingLessonGroup = [
  {
    key: 'lg-1',
    displayName: '',
    userFacing: false,
    lessons: [
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
    ]
  }
];

let longLessonList1 = [];
for (let i = 1; i <= 9; i++) {
  longLessonList1.push({
    id: i,
    key: `lesson-${i}`,
    position: i,
    displayName: `Lesson ${i}`,
    link: `/lessons/${i}`
  });
}

let longLessonList2 = [];
for (let i = 10; i <= 16; i++) {
  longLessonList2.push({
    id: i,
    key: `lesson-${i}`,
    position: i,
    displayName: `Lesson ${i}`,
    link: `/lessons/${i}`
  });
}

const twoLessonGroups = [
  {
    key: 'lg-1',
    displayName: 'Lesson Group 1',
    userFacing: true,
    lessons: longLessonList1
  },
  {
    key: 'lg-2',
    displayName: 'Lesson Group 2',
    userFacing: true,
    lessons: longLessonList2
  }
];

let lesson = {
  unit: {
    displayName: 'Unit 1',
    link: '/s/unit-1',
    lessonGroups: []
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
  it('renders dropdown for single lesson group', () => {
    lesson.unit.lessonGroups = singleLessonGroup;
    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    expect(wrapper.find('a').length).to.equal(3);

    expect(wrapper.contains('Lesson Group')).to.be.true;
    expect(wrapper.contains('1 - Lesson 1')).to.be.true;
    expect(wrapper.contains('2 - Lesson 2')).to.be.true;
  });

  it('renders dropdown for non-user facing lesson group', () => {
    lesson.unit.lessonGroups = nonUserFacingLessonGroup;
    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    expect(wrapper.find('a').length).to.equal(2);

    expect(wrapper.contains('1 - Lesson 1')).to.be.true;
    expect(wrapper.contains('2 - Lesson 2')).to.be.true;
  });

  it('renders dropdown for two lesson groups', () => {
    lesson.unit.lessonGroups = twoLessonGroups;

    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find(DropdownButton).length).to.equal(1);
    expect(wrapper.find('a').length).to.equal(11);

    expect(wrapper.contains('Lesson Group 1')).to.be.true;
    expect(wrapper.contains('1 - Lesson 1')).to.be.true;
    expect(wrapper.contains('2 - Lesson 2')).to.be.true;
    expect(wrapper.contains('3 - Lesson 3')).to.be.true;
    expect(wrapper.contains('4 - Lesson 4')).to.be.true;
    expect(wrapper.contains('5 - Lesson 5')).to.be.true;
    expect(wrapper.contains('6 - Lesson 6')).to.be.true;
    expect(wrapper.contains('7 - Lesson 7')).to.be.true;
    expect(wrapper.contains('8 - Lesson 8')).to.be.true;
    expect(wrapper.contains('9 - Lesson 9')).to.be.true;
    expect(wrapper.contains('Lesson Group 2')).to.be.true;
  });

  it('switches open section when click new section', () => {
    lesson.unit.lessonGroups = twoLessonGroups;
    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find('a').length).to.equal(11);

    expect(wrapper.contains('Lesson Group 1')).to.be.true;
    expect(wrapper.contains('1 - Lesson 1')).to.be.true;
    expect(wrapper.contains('2 - Lesson 2')).to.be.true;
    expect(wrapper.contains('3 - Lesson 3')).to.be.true;
    expect(wrapper.contains('4 - Lesson 4')).to.be.true;
    expect(wrapper.contains('5 - Lesson 5')).to.be.true;
    expect(wrapper.contains('6 - Lesson 6')).to.be.true;
    expect(wrapper.contains('7 - Lesson 7')).to.be.true;
    expect(wrapper.contains('8 - Lesson 8')).to.be.true;
    expect(wrapper.contains('9 - Lesson 9')).to.be.true;
    expect(wrapper.contains('Lesson Group 2')).to.be.true;

    let section2 = wrapper.find('a').at(10);
    expect(section2.contains('Lesson Group 2')).to.be.true;
    section2.simulate('click');

    expect(wrapper.find('a').length).to.equal(9);

    expect(wrapper.contains('Lesson Group 1')).to.be.true;
    expect(wrapper.contains('Lesson Group 2')).to.be.true;
    expect(wrapper.contains('10 - Lesson 10')).to.be.true;
    expect(wrapper.contains('11 - Lesson 11')).to.be.true;
    expect(wrapper.contains('12 - Lesson 12')).to.be.true;
    expect(wrapper.contains('13 - Lesson 13')).to.be.true;
    expect(wrapper.contains('14 - Lesson 14')).to.be.true;
    expect(wrapper.contains('15 - Lesson 15')).to.be.true;
    expect(wrapper.contains('16 - Lesson 16')).to.be.true;
  });

  it('navigates when click lesson', () => {
    sinon.stub(firehoseClient, 'putRecord');
    sinon.stub(utils, 'navigateToHref');

    lesson.unit.lessonGroups = twoLessonGroups;
    const wrapper = shallow(<LessonNavigationDropdown lesson={lesson} />);
    expect(wrapper.find('a').length).to.equal(11);
    let lesson1 = wrapper.find('a').at(1);
    expect(
      wrapper
        .find('a')
        .at(1)
        .contains('1 - Lesson 1')
    ).to.be.true;
    lesson1.simulate('click');

    expect(firehoseClient.putRecord).to.have.been.calledOnce;
    firehoseClient.putRecord.yieldTo('callback');
    expect(utils.navigateToHref).to.have.been.calledOnce;
    utils.navigateToHref.restore();
    firehoseClient.putRecord.restore();
  });
});

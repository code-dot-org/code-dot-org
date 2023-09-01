import React from 'react';
import DCDO from '@cdo/apps/dcdo';
import {mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedTextResponsesTable as TextResponsesTable} from '@cdo/apps/templates/textResponses/TextResponsesTable';

const responses = [
  {
    puzzle: 2,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 1,
    studentName: 'Student A',
    studentFamilyName: 'Lastname C',
    url: 'http://fake.url',
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 3,
    studentName: 'Student C',
    studentFamilyName: 'Lastname A',
    url: 'http://fake.url',
  },
  {
    puzzle: 1,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 2,
    studentName: 'Student B',
    studentFamilyName: 'Lastname B',
    url: 'http://fake.url',
  },
];
const sectionId = 1;

describe('TextResponsesTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <TextResponsesTable responses={responses} sectionId={sectionId} />
    );

    expect(wrapper.find('table')).to.exist;
  });

  it('renders responses as table rows', () => {
    const wrapper = mount(
      <TextResponsesTable responses={responses} sectionId={sectionId} />
    );

    const responseRows = wrapper.find('tbody').find('tr');
    expect(responseRows).to.have.length(3);
  });

  it('sorts responses by student name upon clicking student name header cell', () => {
    DCDO.reset();
    DCDO.set('family-name-features-p3', true);

    const wrapper = mount(
      <TextResponsesTable
        responses={responses}
        sectionId={sectionId}
        participantType="student"
      />
    );

    // should default to response order
    let nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells.at(0)).to.have.text('Student A');
    expect(nameCells.at(1)).to.have.text('Student C');
    expect(nameCells.at(2)).to.have.text('Student B');

    // click should sort responses by student name A-Z
    wrapper.find('.uitest-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells.at(0)).to.have.text('Student A');
    expect(nameCells.at(1)).to.have.text('Student B');
    expect(nameCells.at(2)).to.have.text('Student C');

    // first click on family name header should sort students by family name A-Z
    wrapper.find('.uitest-family-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-family-name-cell');
    expect(nameCells.at(0)).to.have.text('Lastname A');
    expect(nameCells.at(1)).to.have.text('Lastname B');
    expect(nameCells.at(2)).to.have.text('Lastname C');

    // second click on family name header should sort students by family name A-Z
    wrapper.find('.uitest-family-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-family-name-cell');
    expect(nameCells.at(0)).to.have.text('Lastname C');
    expect(nameCells.at(1)).to.have.text('Lastname B');
    expect(nameCells.at(2)).to.have.text('Lastname A');

    DCDO.reset();
  });

  it('does not render a family name field in PL sections', async () => {
    DCDO.reset();
    DCDO.set('family-name-features-p3', true);

    const wrapper = mount(
      <TextResponsesTable
        responses={responses}
        sectionId={sectionId}
        participantType="teacher"
      />
    );

    expect(wrapper.find('uitest-family-name-header').exists()).to.be.false;
    expect(wrapper.find('uitest-family-name-cell').exists()).to.be.false;

    DCDO.reset();
  });

  it('renders a loading element if responses are loading', () => {
    const wrapper = mount(
      <TextResponsesTable
        responses={responses}
        sectionId={sectionId}
        isLoading={true}
      />
    );

    expect(wrapper.find('#uitest-spinner')).to.exist;
  });

  it('renders an empty message element if there are no responses', () => {
    const wrapper = mount(
      <TextResponsesTable responses={[]} sectionId={sectionId} />
    );

    expect(wrapper.find('#uitest-empty-responses')).to.exist;
  });
});

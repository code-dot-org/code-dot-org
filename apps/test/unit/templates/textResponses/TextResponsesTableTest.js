import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import TextResponsesTable from '@cdo/apps/templates/textResponses/TextResponsesTable';
import {
  allowConsoleErrors,
  allowConsoleWarnings
} from '../../../util/throwOnConsole';

const responses = [
  {
    puzzle: 2,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 1,
    studentName: 'Student A',
    url: 'http://fake.url'
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 3,
    studentName: 'Student C',
    url: 'http://fake.url'
  },
  {
    puzzle: 1,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 2,
    studentName: 'Student B',
    url: 'http://fake.url'
  }
];
const sectionId = 1;

describe('TextResponsesTable', () => {
  allowConsoleErrors();
  allowConsoleWarnings();

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
    const wrapper = mount(
      <TextResponsesTable responses={responses} sectionId={sectionId} />
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

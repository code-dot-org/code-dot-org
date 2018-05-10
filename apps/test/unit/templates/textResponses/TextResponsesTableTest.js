import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import TextResponsesTable from '@cdo/apps/templates/textResponses/TextResponsesTable';

const responses = [
  {
    puzzle: 2,
    question: "Free Response",
    response: "Lorem ipsum dolor sit amet, postea pericula",
    stage: "Lesson 1",
    studentId: 1,
    studentName: "Student A",
    url: "http://fake.url"
  },
  {
    puzzle: 3,
    question: "Free Response",
    response: "Lorem ipsum dolor sit amet, postea pericula",
    stage: "Lesson 1",
    studentId: 3,
    studentName: "Student C",
    url: "http://fake.url"
  },
  {
    puzzle: 1,
    question: "Free Response",
    response: "Lorem ipsum dolor sit amet, postea pericula",
    stage: "Lesson 1",
    studentId: 2,
    studentName: "Student B",
    url: "http://fake.url"
  },
];
const sectionId = 1;

describe('TextResponsesTable', () => {
  it('renders a table', () => {
    const wrapper = mount(
      <TextResponsesTable
        responses={responses}
        sectionId={sectionId}
      />
    );

    expect(wrapper.find('table').exists()).to.be.true;
  });

  it('renders responses as table rows', () => {
    const wrapper = mount(
      <TextResponsesTable
        responses={responses}
        sectionId={sectionId}
      />
    );

    const responseRows = wrapper.find('tbody').find('tr');
    expect(responseRows).to.have.length(3);
  });

  it('sorts responses by student name upon clicking student name header cell', () => {
    const wrapper = mount(
      <TextResponsesTable
        responses={responses}
        sectionId={sectionId}
      />
    );

    // should default to response order
    let nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells.at(0).text()).to.equal('Student A');
    expect(nameCells.at(1).text()).to.equal('Student C');
    expect(nameCells.at(2).text()).to.equal('Student B');

    // click should sort responses by student name A-Z
    wrapper.find('.uitest-name-header').simulate('click');
    nameCells = wrapper.find('.uitest-name-cell');
    expect(nameCells.at(0).text()).to.equal('Student A');
    expect(nameCells.at(1).text()).to.equal('Student B');
    expect(nameCells.at(2).text()).to.equal('Student C');
  });
});

import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import TextResponsesTable from '@cdo/apps/templates/textResponses/TextResponsesTable';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const responses = [
  {
    puzzle: 2,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 1,
    studentName: 'Student A',
    url: 'http://fake.url',
  },
  {
    puzzle: 3,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 3,
    studentName: 'Student C',
    url: 'http://fake.url',
  },
  {
    puzzle: 1,
    question: 'Free Response',
    response: 'Lorem ipsum dolor sit amet, postea pericula',
    lesson: 'Lesson 1',
    studentId: 2,
    studentName: 'Student B',
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

  it('strips markdown formatting from the question cell', () => {
    const markdownResponses = [
      {
        puzzle: 1,
        question:
          '## Predict and Run\n**What do you think this program does?** Take a look.',
        response: 'a response',
        lesson: 'Lesson 1',
        studentId: 1,
        studentName: 'Student A',
        url: 'http://fake.url',
      },
    ];
    const wrapper = mount(
      <TextResponsesTable responses={markdownResponses} sectionId={sectionId} />
    );

    const questionText = wrapper.find('tbody tr').first().find('td').at(3).text();
    expect(questionText).to.not.contain('#');
    expect(questionText).to.not.contain('*');
    expect(questionText).to.contain('Predict and Run');
    expect(questionText).to.contain('What do you think this program does?');
  });

  it('strips heading markers even when there is no space after #', () => {
    const markdownResponses = [
      {
        puzzle: 1,
        question: '##Predict and Run',
        response: 'a response',
        lesson: 'Lesson 1',
        studentId: 1,
        studentName: 'Student A',
        url: 'http://fake.url',
      },
    ];
    const wrapper = mount(
      <TextResponsesTable responses={markdownResponses} sectionId={sectionId} />
    );

    const questionText = wrapper.find('tbody tr').first().find('td').at(3).text();
    expect(questionText).to.equal('Predict and Run');
  });

  it('strips markdown and HTML images from the question cell', () => {
    const imageResponses = [
      {
        puzzle: 1,
        // Markdown image with a space in the URL (invalid markdown syntax that
        // markdownToTxt leaves as literal text) plus a raw HTML <img> tag.
        question:
          '# The Counter Pattern\n![](https://images.code.org/x-1465506512065.06.56 PM.png)\n<img src="https://cdo-curriculum.s3.amazonaws.com/foil.png" style="float: right" />\nWhat does this program do?',
        response: 'a response',
        lesson: 'Lesson 1',
        studentId: 1,
        studentName: 'Student A',
        url: 'http://fake.url',
      },
    ];
    const wrapper = mount(
      <TextResponsesTable responses={imageResponses} sectionId={sectionId} />
    );

    const questionText = wrapper.find('tbody tr').first().find('td').at(3).text();
    expect(questionText).to.not.contain('![');
    expect(questionText).to.not.contain('<img');
    expect(questionText).to.not.contain('.png');
    expect(questionText).to.contain('The Counter Pattern');
    expect(questionText).to.contain('What does this program do?');
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

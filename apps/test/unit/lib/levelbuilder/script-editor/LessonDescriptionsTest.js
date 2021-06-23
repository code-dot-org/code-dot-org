import React from 'react';
import {shallow, mount} from 'enzyme';
import {assert} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import LessonDescriptions from '@cdo/apps/lib/levelbuilder/unit-editor/LessonDescriptions';

const currentDescriptions = [
  {
    name: 'The Internet',
    descriptionStudent: 'This is what the student will see',
    descriptionTeacher: 'This is what the teacher will see'
  },
  {
    name: 'The Need for Addressing',
    descriptionStudent: 'This is what the student will see',
    descriptionTeacher: 'This is what the teacher will see'
  }
];

describe('LessonDescriptions', () => {
  var xhr, requests;
  let defaultProps, updateLessonDescriptions;

  beforeEach(() => {
    updateLessonDescriptions = sinon.spy();
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function(xhr) {
      requests.push(xhr);
    };
    defaultProps = {
      updateLessonDescriptions
    };
  });

  it('begins collapsed', () => {
    const wrapper = shallow(
      <LessonDescriptions
        {...defaultProps}
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    assert.equal(wrapper.state('collapsed'), true);
    assert.equal(wrapper.childAt(1).children().length, 1);

    const button = wrapper.childAt(1).childAt(0);
    assert.equal(button.type(), 'button');
    assert.include(button.text(), 'Expand');
  });

  it('uncollapses on click', () => {
    const wrapper = shallow(
      <LessonDescriptions
        {...defaultProps}
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    wrapper.find('button').simulate('click');
    assert.equal(wrapper.state('collapsed'), false);

    let button = wrapper.childAt(1).childAt(0);
    assert.equal(button.type(), 'button');
    assert.include(button.text(), 'Collapse');

    // button followed by a div
    assert.equal(wrapper.childAt(1).children().length, 2);
    const descriptions = wrapper.childAt(1).childAt(1);
    assert.equal(descriptions.type(), 'div');

    assert.equal(
      descriptions.find('button').text(),
      'Import from Curriculum Builder'
    );

    // collapses after subsequent button click
    button.simulate('click');
    assert.equal(wrapper.state('collapsed'), true);
    button = wrapper.childAt(1).childAt(0);
    assert.include(button.text(), 'Expand');
    assert.equal(wrapper.childAt(1).children().length, 1);
  });

  it('updates button while importing', () => {
    const wrapper = shallow(
      <LessonDescriptions
        {...defaultProps}
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    wrapper.setState({collapsed: false});
    let descriptions = wrapper.childAt(1).childAt(1);

    assert.equal(
      descriptions.find('button').text(),
      'Import from Curriculum Builder'
    );

    // now click import button
    descriptions.find('button').simulate('click');

    descriptions = wrapper.childAt(1).childAt(1);
    assert.equal(wrapper.state('buttonText'), 'Querying server...');
    assert.equal(descriptions.find('button').text(), 'Querying server...');
  });

  it('extracts importedDescriptions/mismatchedLessons from response', () => {
    const wrapper = mount(
      <LessonDescriptions
        {...defaultProps}
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    wrapper.setState({collapsed: false});
    // now click import button
    const importButton = wrapper.find('button').at(1);
    assert.equal(importButton.text(), 'Import from Curriculum Builder');
    importButton.simulate('click');

    assert.equal(requests.length, 1);
    assert.equal(
      requests[0].url,
      'https://curriculum.code.org/metadata/myscript.json'
    );

    requests[0].respond(
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        lessons: [
          {
            title: currentDescriptions[0].name + '_new',
            student_desc:
              currentDescriptions[0].descriptionStudent + ' plus edits',
            teacher_desc:
              currentDescriptions[0].descriptionTeacher + ' plus edits'
          },
          {
            title: currentDescriptions[1].name,
            student_desc: currentDescriptions[0].descriptionStudent,
            teacher_desc: currentDescriptions[0].descriptionTeacher
          }
        ]
      })
    );
    wrapper.update();

    assert.equal(wrapper.state('buttonText'), 'Imported');
    assert.deepEqual(wrapper.state('mismatchedLessons'), ['The Internet_new']);
    const imported = wrapper.state('importedDescriptions');
    assert.equal(imported.length, 2);
    assert.deepEqual(
      {
        name: 'The Internet_new',
        descriptionStudent:
          currentDescriptions[0].descriptionStudent + ' plus edits',
        descriptionTeacher:
          currentDescriptions[0].descriptionTeacher + ' plus edits'
      },
      imported[0]
    );
    assert.deepEqual(currentDescriptions[1], imported[1]);
  });

  it('recovers when there are too few importedDescriptions', () => {
    const wrapper = mount(
      <LessonDescriptions
        {...defaultProps}
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    wrapper.setState({collapsed: false});
    // now click import button
    const importButton = wrapper.find('button').at(1);
    assert.equal(importButton.text(), 'Import from Curriculum Builder');
    importButton.simulate('click');

    assert.equal(requests.length, 1);
    assert.equal(
      requests[0].url,
      'https://curriculum.code.org/metadata/myscript.json'
    );

    requests[0].respond(
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({
        lessons: [
          {
            title: currentDescriptions[0].name,
            student_desc: currentDescriptions[0].descriptionStudent,
            teacher_desc: currentDescriptions[0].descriptionTeacher
          }
        ]
      })
    );
    wrapper.update();

    // If we get here, the import completed without any JS errors.
    assert.equal(wrapper.state('buttonText'), 'Imported');
    const imported = wrapper.state('importedDescriptions');
    assert.equal(imported.length, 1);
  });
});

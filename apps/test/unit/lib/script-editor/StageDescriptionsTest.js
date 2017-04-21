import React from 'react';
import { shallow, mount } from 'enzyme';
import { assert } from '../../../util/configuredChai';
import sinon from 'sinon';
import StageDescriptions from '@cdo/apps/lib/script-editor/StageDescriptions';

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

describe('StageDescriptions', () => {
  var xhr, requests;

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  it('begins collapsed', () => {
    const wrapper = shallow(
      <StageDescriptions
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    assert.equal(wrapper.state('collapsed'), true);
    assert.equal(wrapper.childAt(1).children().length, 1);
    assert.equal(wrapper.childAt(1).childAt(0).type(), 'button');
  });

  it('uncollapses on click', () => {
    const wrapper = shallow(
      <StageDescriptions
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    wrapper.find('button').simulate('click');
    assert.equal(wrapper.state('collapsed'), false);

    // button replaced by a div
    assert.equal(wrapper.childAt(1).children().length, 1);
    assert.equal(wrapper.childAt(1).childAt(0).type(), 'div');

    assert.equal(wrapper.find('button').text(), 'Import from Curriculum Builder');
  });

  it('updates button while importing', () => {
    const wrapper = shallow(
      <StageDescriptions
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    wrapper.setState({ collapsed: false });
    assert.equal(wrapper.find('button').text(), 'Import from Curriculum Builder');

    // now click import button
    wrapper.find('button').simulate('click');

    assert.equal(wrapper.state('buttonText'), 'Querying server...');
    assert.equal(wrapper.find('button').text(), 'Querying server...');
  });

  it('extracts importedDescriptions/mismatchedStages from response', () => {
    const wrapper = mount(
      <StageDescriptions
        scriptName="myscript"
        currentDescriptions={currentDescriptions}
      />
    );
    wrapper.setState({ collapsed: false });
    // now click import button
    wrapper.find('button').simulate('click');

    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "https://curriculum.code.org/metadata/myscript.json");

    requests[0].respond(200, { "Content-Type": "application/json" }, JSON.stringify({
      lessons: [
        {
          title: currentDescriptions[0].name + "_new",
          student_desc: currentDescriptions[0].descriptionStudent + " plus edits",
          teacher_desc: currentDescriptions[0].descriptionTeacher + " plus edits",
        },
        {
          title: currentDescriptions[1].name,
          student_desc: currentDescriptions[0].descriptionStudent,
          teacher_desc: currentDescriptions[0].descriptionTeacher,
        }
      ]
    }));

    assert.equal(wrapper.state('buttonText'), 'Imported');
    assert.deepEqual(wrapper.state('mismatchedStages'), ['The Internet_new']);
    const imported = wrapper.state('importedDescriptions');
    assert.equal(imported.length, 2);
    assert.deepEqual({
      name: 'The Internet_new',
      descriptionStudent: currentDescriptions[0].descriptionStudent + " plus edits",
      descriptionTeacher: currentDescriptions[0].descriptionTeacher + " plus edits",
    }, imported[0]);
    assert.deepEqual(currentDescriptions[1], imported[1]);

    assert.deepEqual(wrapper.find('input').prop('defaultValue'), JSON.stringify([
      {
        name: currentDescriptions[0].name,
        descriptionStudent: currentDescriptions[0].descriptionStudent + " plus edits",
        descriptionTeacher: currentDescriptions[0].descriptionTeacher + " plus edits",
      },
      currentDescriptions[1]
    ]));
  });
});

import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import ProgrammingMethodEditor from '@cdo/apps/levelbuilder/code-docs-editor/ProgrammingMethodEditor';
import {getStore} from '@cdo/apps/redux';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('ProgrammingMethodEditor', () => {
  let initialProgrammingMethod, fetchSpy;

  beforeEach(() => {
    initialProgrammingMethod = {
      id: 1,
      name: 'getPaint()',
      key: 'getpaint',
      externalLink: 'developer.mozilla.org',
      content: 'This is a longer description of the code.',
      syntax: 'getPaint()()',
      examples: [{name: 'example 1'}],
      parameters: [{name: 'parameter 1'}],
      overloadOf: null,
      canHaveOverload: false,
    };
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('displays initial values in input fields in top section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    expect(wrapper.text().includes('Editing Method')).to.be.true;

    // Display name
    expect(wrapper.find('input').at(0).props().value).to.equal('getPaint()');

    // Key
    expect(wrapper.find('input').at(1).props().value).to.equal('getpaint');
    expect(wrapper.find('input').at(1).props().readOnly).to.be.true;
  });

  it('uses overloadOptions for overload dropdown if canHaveOverload is true', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={{
          ...initialProgrammingMethod,
          canHaveOverload: true,
        }}
        overloadOptions={[
          {key: 'droppaint', name: 'dropPaint()'},
          {key: 'turnleft', name: 'turnLeft'},
        ]}
      />
    );

    const overloadSelector = wrapper.find('select');
    expect(overloadSelector.find('option').length).to.equal(3);
    expect(overloadSelector.find('option').map(o => o.props().value)).to.eql([
      '',
      'droppaint',
      'turnleft',
    ]);
  });

  it('hides overload dropdown if canHaveOverload is false', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={{
          ...initialProgrammingMethod,
          canHaveOverload: false,
        }}
        overloadOptions={[
          {key: 'droppaint', name: 'dropPaint()'},
          {key: 'turnleft', name: 'turnLeft'},
        ]}
      />
    );

    expect(wrapper.find('select').length).to.equal(0);
  });

  it('displays initial values in input fields in documentation section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    expect(wrapper.text().includes('Editing Method')).to.be.true;

    // Documentation section
    const documentationSection = wrapper.find('CollapsibleEditorSection').at(0);
    expect(documentationSection.props().title).to.equal('Documentation');
    expect(documentationSection.find('input').at(0).props().value).to.equal(
      'developer.mozilla.org'
    );
    expect(
      documentationSection.find('TextareaWithMarkdownPreview').at(0).props()
        .markdown
    ).to.equal('This is a longer description of the code.');
  });

  it('displays initial values in details section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    const detailsSection = wrapper.find('CollapsibleEditorSection').at(1);
    expect(
      detailsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).to.equal('getPaint()()');
  });

  it('displays initial values in input fields in parameters section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    expect(wrapper.text().includes('Editing Method')).to.be.true;
    // Parameters section
    const parametersSection = wrapper.find('CollapsibleEditorSection').at(2);
    expect(parametersSection.props().title).to.equal('Parameters');
    const orderableParameterList = parametersSection.find('OrderableList');
    expect(orderableParameterList.props().addButtonText).to.equal(
      'Add Another Parameter'
    );
    expect(orderableParameterList.props().list.length).to.equal(1);
  });

  it('displays initial values in input fields in examples section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    expect(wrapper.text().includes('Editing Method')).to.be.true;
    // Examples section
    const examplesSection = wrapper.find('CollapsibleEditorSection').at(3);
    expect(examplesSection.props().title).to.equal('Examples');
    const orderableExampleList = examplesSection.find('OrderableList');
    expect(orderableExampleList.props().addButtonText).to.equal(
      'Add Another Example'
    );
    expect(orderableExampleList.props().list.length).to.equal(1);
  });

  it('attempts to save when save is pressed', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingMethodEditor
          initialProgrammingMethod={initialProgrammingMethod}
          overloadOptions={[]}
        />
      </Provider>
    );

    // Change name
    wrapper
      .find('input')
      .at(0)
      .simulate('change', {target: {value: 'PainterClass'}});

    // Change external documentation
    wrapper
      .find('input')
      .at(2)
      .simulate('change', {target: {value: 'fakedocumentation.url'}});

    fetchSpy.returns(Promise.resolve({ok: true}));
    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).to.be.called.once;
    const fetchCall = fetchSpy.getCall(0);
    expect(fetchCall.args[0]).to.equal('/programming_methods/1');
    const fetchCallBody = JSON.parse(fetchCall.args[1].body);
    expect(Object.keys(fetchCallBody).sort()).to.eql(
      [
        'name',
        'overloadOf',
        'canHaveOverload',
        'content',
        'externalLink',
        'syntax',
        'examples',
        'parameters',
      ].sort()
    );
    expect(fetchCallBody.name).to.equal('PainterClass');
    expect(fetchCallBody.content).to.equal(
      'This is a longer description of the code.'
    );
    expect(fetchCallBody.externalLink).to.equal('fakedocumentation.url');
    expect(fetchCallBody.syntax).to.equal('getPaint()()');
    expect(fetchCallBody.examples[0].name).to.equal('example 1');
    expect(fetchCallBody.parameters[0].name).to.equal('parameter 1');
  });
});

import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import ProgrammingExpressionEditor from '@cdo/apps/levelbuilder/code-docs-editor/ProgrammingExpressionEditor';
import {getStore} from '@cdo/apps/redux';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('ProgrammingExpressionEditor', () => {
  let defaultProps, initialProgrammingExpression, fetchSpy;

  beforeEach(() => {
    initialProgrammingExpression = {
      id: 1,
      name: 'Block',
      key: 'block',
      shortDescription: 'This is a short description.',
      externalDocumentation: 'developer.mozilla.org',
      content: 'This is a longer description of the code.',
      syntax: 'block()',
      returnValue: 'none',
      tips: 'some tips on how to use this block',
      parameters: [{name: 'id', type: 'string'}],
      examples: [{name: 'example 1'}],
    };
    defaultProps = {
      initialProgrammingExpression,
      environmentCategories: [
        {key: 'circuit', name: 'Circuit'},
        {key: 'variables', name: 'Variables'},
        {key: 'canvas', name: 'Canvas'},
      ],
      videoOptions: [
        {
          key: 'video1',
          name: 'Video 1',
        },
        {
          key: 'video2',
          name: 'Video 2',
        },
      ],
    };
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('displays initial values in input fields', () => {
    const wrapper = shallow(<ProgrammingExpressionEditor {...defaultProps} />);
    expect(wrapper.contains('Editing block')).to.be.true;

    // Display name
    expect(wrapper.find('input').at(0).props().value).to.equal('Block');

    // Key
    expect(wrapper.find('input').at(1).props().value).to.equal('block');
    expect(wrapper.find('input').at(1).props().readOnly).to.be.true;

    // Category select
    const categorySelect = wrapper.find('select').at(0);
    expect(categorySelect.find('option').length).to.equal(4);
    expect(
      categorySelect.find('option').map(option => option.props().value)
    ).to.eql(['', 'circuit', 'variables', 'canvas']);

    // Video select
    const videoSelect = wrapper.find('select').at(1);
    expect(videoSelect.find('option').length).to.equal(3);
    expect(
      videoSelect.find('option').map(option => option.props().value)
    ).to.eql(['', 'video1', 'video2']);

    // Image upload
    expect(wrapper.find('ImageInput').length).to.equal(1);

    // short description
    expect(wrapper.find('textarea').at(0).props().value).to.equal(
      'This is a short description.'
    );

    // Documentation section
    const documentationSection = wrapper.find('CollapsibleEditorSection').at(0);
    expect(documentationSection.find('input').at(0).props().value).to.equal(
      'developer.mozilla.org'
    );
    expect(
      documentationSection.find('TextareaWithMarkdownPreview').at(0).props()
        .markdown
    ).to.equal('This is a longer description of the code.');

    const detailsSection = wrapper.find('CollapsibleEditorSection').at(1);
    expect(
      detailsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).to.equal('block()');
    expect(detailsSection.find('textarea').at(0).props().value).to.equal(
      'none'
    );

    // Tips section
    const tipsSection = wrapper.find('CollapsibleEditorSection').at(2);
    expect(
      tipsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).to.equal('some tips on how to use this block');

    // Parameters section
    const parametersSection = wrapper.find('CollapsibleEditorSection').at(3);
    const orderableParameterList = parametersSection.find('OrderableList');
    expect(orderableParameterList.props().addButtonText).to.equal(
      'Add Another Parameter'
    );
    expect(orderableParameterList.props().list.length).to.equal(1);

    // Examples section
    const examplesSection = wrapper.find('CollapsibleEditorSection').at(4);
    const orderableExampleList = examplesSection.find('OrderableList');
    expect(orderableExampleList.props().addButtonText).to.equal(
      'Add Another Example'
    );
    expect(orderableExampleList.props().list.length).to.equal(1);
  });

  it('shows blockName input if programming environment is blockly based', () => {
    const wrapper = shallow(
      <ProgrammingExpressionEditor
        {...defaultProps}
        initialProgrammingExpression={{
          ...initialProgrammingExpression,
          environmentLanguageType: 'blockly',
          blockName: 'gamelab_location_picker',
        }}
      />
    );
    const blockNameInput = wrapper.find('input').at(2);
    expect(blockNameInput.props().value).to.equal('gamelab_location_picker');
  });

  it('attempts to save when save is pressed', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionEditor {...defaultProps} />
      </Provider>
    );

    fetchSpy.returns(Promise.resolve({ok: true}));
    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).to.be.called.once;
    const fetchCall = fetchSpy.getCall(0);
    expect(fetchCall.args[0]).to.equal('/programming_expressions/1');
    const fetchCallBody = JSON.parse(fetchCall.args[1].body);
    expect(Object.keys(fetchCallBody).sort()).to.eql(
      [
        'name',
        'shortDescription',
        'content',
        'externalDocumentation',
        'parameters',
        'returnValue',
        'syntax',
        'tips',
        'examples',
      ].sort()
    );
    expect(fetchCallBody.name).to.equal('Block');
    expect(fetchCallBody.shortDescription).to.equal(
      'This is a short description.'
    );
    expect(fetchCallBody.content).to.equal(
      'This is a longer description of the code.'
    );
    expect(fetchCallBody.externalDocumentation).to.equal(
      'developer.mozilla.org'
    );
    expect(fetchCallBody.parameters[0].name).to.equal('id');
    expect(fetchCallBody.parameters[0].type).to.equal('string');
    expect(fetchCallBody.returnValue).to.equal('none');
    expect(fetchCallBody.syntax).to.equal('block()');
    expect(fetchCallBody.tips).to.equal('some tips on how to use this block');
    expect(fetchCallBody.examples[0].name).to.equal('example 1');
  });
});

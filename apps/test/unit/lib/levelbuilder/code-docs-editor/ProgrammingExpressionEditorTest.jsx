import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import ProgrammingExpressionEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingExpressionEditor';
import {getStore} from '@cdo/apps/redux';



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
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('displays initial values in input fields', () => {
    const wrapper = shallow(<ProgrammingExpressionEditor {...defaultProps} />);
    expect(wrapper.contains('Editing block')).toBe(true);

    // Display name
    expect(wrapper.find('input').at(0).props().value).toBe('Block');

    // Key
    expect(wrapper.find('input').at(1).props().value).toBe('block');
    expect(wrapper.find('input').at(1).props().readOnly).toBe(true);

    // Category select
    const categorySelect = wrapper.find('select').at(0);
    expect(categorySelect.find('option').length).toBe(4);
    expect(
      categorySelect.find('option').map(option => option.props().value)
    ).toEqual(['', 'circuit', 'variables', 'canvas']);

    // Video select
    const videoSelect = wrapper.find('select').at(1);
    expect(videoSelect.find('option').length).toBe(3);
    expect(
      videoSelect.find('option').map(option => option.props().value)
    ).toEqual(['', 'video1', 'video2']);

    // Image upload
    expect(wrapper.find('ImageInput').length).toBe(1);

    // short description
    expect(wrapper.find('textarea').at(0).props().value).toBe('This is a short description.');

    // Documentation section
    const documentationSection = wrapper.find('CollapsibleEditorSection').at(0);
    expect(documentationSection.find('input').at(0).props().value).toBe('developer.mozilla.org');
    expect(
      documentationSection.find('TextareaWithMarkdownPreview').at(0).props()
        .markdown
    ).toBe('This is a longer description of the code.');

    const detailsSection = wrapper.find('CollapsibleEditorSection').at(1);
    expect(
      detailsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).toBe('block()');
    expect(detailsSection.find('textarea').at(0).props().value).toBe('none');

    // Tips section
    const tipsSection = wrapper.find('CollapsibleEditorSection').at(2);
    expect(
      tipsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).toBe('some tips on how to use this block');

    // Parameters section
    const parametersSection = wrapper.find('CollapsibleEditorSection').at(3);
    const orderableParameterList = parametersSection.find('OrderableList');
    expect(orderableParameterList.props().addButtonText).toBe('Add Another Parameter');
    expect(orderableParameterList.props().list.length).toBe(1);

    // Examples section
    const examplesSection = wrapper.find('CollapsibleEditorSection').at(4);
    const orderableExampleList = examplesSection.find('OrderableList');
    expect(orderableExampleList.props().addButtonText).toBe('Add Another Example');
    expect(orderableExampleList.props().list.length).toBe(1);
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
    expect(blockNameInput.props().value).toBe('gamelab_location_picker');
  });

  it('attempts to save when save is pressed', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingExpressionEditor {...defaultProps} />
      </Provider>
    );

    fetchSpy.mockReturnValue(Promise.resolve({ok: true}));
    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).toHaveBeenCalled().once;
    const fetchCall = fetchSpy.mock.calls[0];
    expect(fetchCall.mock.calls[0]).toBe('/programming_expressions/1');
    const fetchCallBody = JSON.parse(fetchCall.mock.calls[1].body);
    expect(Object.keys(fetchCallBody).sort()).toEqual([
      'name',
      'shortDescription',
      'content',
      'externalDocumentation',
      'parameters',
      'returnValue',
      'syntax',
      'tips',
      'examples',
    ].sort());
    expect(fetchCallBody.name).toBe('Block');
    expect(fetchCallBody.shortDescription).toBe('This is a short description.');
    expect(fetchCallBody.content).toBe('This is a longer description of the code.');
    expect(fetchCallBody.externalDocumentation).toBe('developer.mozilla.org');
    expect(fetchCallBody.parameters[0].name).toBe('id');
    expect(fetchCallBody.parameters[0].type).toBe('string');
    expect(fetchCallBody.returnValue).toBe('none');
    expect(fetchCallBody.syntax).toBe('block()');
    expect(fetchCallBody.tips).toBe('some tips on how to use this block');
    expect(fetchCallBody.examples[0].name).toBe('example 1');
  });
});

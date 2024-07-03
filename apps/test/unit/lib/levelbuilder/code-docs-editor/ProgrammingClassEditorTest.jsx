import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import ProgrammingClassEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingClassEditor';
import {getStore} from '@cdo/apps/redux';



describe('ProgrammingClassEditor', () => {
  let defaultProps, initialProgrammingClass, fetchSpy;

  beforeEach(() => {
    initialProgrammingClass = {
      id: 1,
      name: 'Painter',
      key: 'painter',
      shortDescription: 'This is a short description.',
      externalDocumentation: 'developer.mozilla.org',
      content: 'This is a longer description of the code.',
      syntax: 'Painter()',
      returnValue: 'none',
      tips: 'some tips on how to use this class',
      examples: [{name: 'example 1'}],
      fields: [{name: 'fields 1'}],
      methods: [{key: 'method1', name: 'method 1'}],
    };
    defaultProps = {
      initialProgrammingClass,
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

  it('displays initial values in input fields in top section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    expect(wrapper.text().includes('Editing Class')).toBe(true);

    // Display name
    expect(wrapper.find('input').at(0).props().value).toBe('Painter');

    // Key
    expect(wrapper.find('input').at(1).props().value).toBe('painter');
    expect(wrapper.find('input').at(1).props().readOnly).toBe(true);

    // Category select
    const categorySelect = wrapper.find('select').at(0);
    expect(categorySelect.find('option').length).toBe(4);
    expect(
      categorySelect.find('option').map(option => option.props().value)
    ).toEqual(['', 'circuit', 'variables', 'canvas']);
  });

  it('displays initial values in input fields in documentation section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    expect(wrapper.text().includes('Editing Class')).toBe(true);

    // Documentation section
    const documentationSection = wrapper.find('CollapsibleEditorSection').at(0);
    expect(documentationSection.props().title).toBe('Documentation');
    expect(documentationSection.find('input').at(0).props().value).toBe('developer.mozilla.org');
    expect(
      documentationSection.find('TextareaWithMarkdownPreview').at(0).props()
        .markdown
    ).toBe('This is a longer description of the code.');

    const detailsSection = wrapper.find('CollapsibleEditorSection').at(1);
    expect(
      detailsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).toBe('Painter()');
  });

  it('displays initial values in input fields in tips section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    expect(wrapper.text().includes('Editing Class')).toBe(true);

    // Tips section
    const tipsSection = wrapper.find('CollapsibleEditorSection').at(2);
    expect(tipsSection.props().title).toBe('Tips');
    expect(
      tipsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).toBe('some tips on how to use this class');
  });

  it('displays initial values in input fields in examples section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    expect(wrapper.text().includes('Editing Class')).toBe(true);
    // Examples section
    const examplesSection = wrapper.find('CollapsibleEditorSection').at(3);
    expect(examplesSection.props().title).toBe('Examples');
    const orderableExampleList = examplesSection.find('OrderableList');
    expect(orderableExampleList.props().addButtonText).toBe('Add Another Example');
    expect(orderableExampleList.props().list.length).toBe(1);
  });

  it('displays initial values in input fields in fields section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    // Fields section
    const fieldsSection = wrapper.find('CollapsibleEditorSection').at(4);
    expect(fieldsSection.props().title).toBe('Fields');
    const orderableFieldList = fieldsSection.find('OrderableList');
    expect(orderableFieldList.props().addButtonText).toBe('Add Another Field');
    expect(orderableFieldList.props().list.length).toBe(1);
  });

  it('displays initial values in input methods in methods section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    // Methods section
    const methodsSection = wrapper.find('CollapsibleEditorSection').at(5);
    expect(methodsSection.props().title).toBe('Methods');
    const orderableMethodList = methodsSection.find('OrderableList');
    expect(orderableMethodList.props().addButtonText).toBe('Add Another Method');
    expect(orderableMethodList.props().list.length).toBe(1);
  });

  it('attempts to save when save is pressed', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingClassEditor {...defaultProps} />
      </Provider>
    );

    fetchSpy.mockReturnValue(Promise.resolve({ok: true}));
    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).toHaveBeenCalled().once;
    const fetchCall = fetchSpy.mock.calls[0];
    expect(fetchCall.mock.calls[0]).toBe('/programming_classes/1');
    const fetchCallBody = JSON.parse(fetchCall.mock.calls[1].body);
    expect(Object.keys(fetchCallBody).sort()).toEqual([
      'name',
      'shortDescription',
      'content',
      'externalDocumentation',
      'returnValue',
      'syntax',
      'tips',
      'examples',
      'fields',
      'methods',
    ].sort());
    expect(fetchCallBody.name).toBe('Painter');
    expect(fetchCallBody.shortDescription).toBe('This is a short description.');
    expect(fetchCallBody.content).toBe('This is a longer description of the code.');
    expect(fetchCallBody.externalDocumentation).toBe('developer.mozilla.org');
    expect(fetchCallBody.returnValue).toBe('none');
    expect(fetchCallBody.syntax).toBe('Painter()');
    expect(fetchCallBody.tips).toBe('some tips on how to use this class');
    expect(fetchCallBody.examples[0].name).toBe('example 1');
  });
});

import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import ProgrammingMethodEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingMethodEditor';
import {getStore} from '@cdo/apps/redux';



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
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('displays initial values in input fields in top section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    expect(wrapper.text().includes('Editing Method')).toBe(true);

    // Display name
    expect(wrapper.find('input').at(0).props().value).toBe('getPaint()');

    // Key
    expect(wrapper.find('input').at(1).props().value).toBe('getpaint');
    expect(wrapper.find('input').at(1).props().readOnly).toBe(true);
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
    expect(overloadSelector.find('option').length).toBe(3);
    expect(overloadSelector.find('option').map(o => o.props().value)).toEqual([
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

    expect(wrapper.find('select').length).toBe(0);
  });

  it('displays initial values in input fields in documentation section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    expect(wrapper.text().includes('Editing Method')).toBe(true);

    // Documentation section
    const documentationSection = wrapper.find('CollapsibleEditorSection').at(0);
    expect(documentationSection.props().title).toBe('Documentation');
    expect(documentationSection.find('input').at(0).props().value).toBe('developer.mozilla.org');
    expect(
      documentationSection.find('TextareaWithMarkdownPreview').at(0).props()
        .markdown
    ).toBe('This is a longer description of the code.');
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
    ).toBe('getPaint()()');
  });

  it('displays initial values in input fields in parameters section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    expect(wrapper.text().includes('Editing Method')).toBe(true);
    // Parameters section
    const parametersSection = wrapper.find('CollapsibleEditorSection').at(2);
    expect(parametersSection.props().title).toBe('Parameters');
    const orderableParameterList = parametersSection.find('OrderableList');
    expect(orderableParameterList.props().addButtonText).toBe('Add Another Parameter');
    expect(orderableParameterList.props().list.length).toBe(1);
  });

  it('displays initial values in input fields in examples section', () => {
    const wrapper = shallow(
      <ProgrammingMethodEditor
        initialProgrammingMethod={initialProgrammingMethod}
        overloadOptions={[]}
      />
    );
    expect(wrapper.text().includes('Editing Method')).toBe(true);
    // Examples section
    const examplesSection = wrapper.find('CollapsibleEditorSection').at(3);
    expect(examplesSection.props().title).toBe('Examples');
    const orderableExampleList = examplesSection.find('OrderableList');
    expect(orderableExampleList.props().addButtonText).toBe('Add Another Example');
    expect(orderableExampleList.props().list.length).toBe(1);
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

    fetchSpy.mockReturnValue(Promise.resolve({ok: true}));
    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).toHaveBeenCalled().once;
    const fetchCall = fetchSpy.mock.calls[0];
    expect(fetchCall.mock.calls[0]).toBe('/programming_methods/1');
    const fetchCallBody = JSON.parse(fetchCall.mock.calls[1].body);
    expect(Object.keys(fetchCallBody).sort()).toEqual([
      'name',
      'overloadOf',
      'canHaveOverload',
      'content',
      'externalLink',
      'syntax',
      'examples',
      'parameters',
    ].sort());
    expect(fetchCallBody.name).toBe('PainterClass');
    expect(fetchCallBody.content).toBe('This is a longer description of the code.');
    expect(fetchCallBody.externalLink).toBe('fakedocumentation.url');
    expect(fetchCallBody.syntax).toBe('getPaint()()');
    expect(fetchCallBody.examples[0].name).toBe('example 1');
    expect(fetchCallBody.parameters[0].name).toBe('parameter 1');
  });
});

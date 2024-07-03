import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon';

import ProgrammingEnvironmentEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingEnvironmentEditor';
import {getStore} from '@cdo/apps/redux';



describe('ProgrammingEnvironmentEditor', () => {
  let defaultProps, fetchSpy;

  beforeEach(() => {
    defaultProps = {
      initialProgrammingEnvironment: {
        name: 'spritelab',
        title: 'Spritelab',
        published: true,
        imageUrl: 'images.code.org/spritelab',
        projectUrl: '/p/spritelab',
        description: 'A description of spritelab',
        editorLanguage: 'blockly',
        blockPoolName: 'GamelabJr',
        categories: [
          {id: 1, key: 'sprites', name: 'Sprites', color: '#00FF00'},
        ],
      },
    };
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('uses initial values in fields', () => {
    const wrapper = shallow(<ProgrammingEnvironmentEditor {...defaultProps} />);

    const titleInput = wrapper.find('input').at(0);
    expect(titleInput.props().value).toBe('Spritelab');

    const nameInput = wrapper.find('input').at(1);
    expect(nameInput.props().value).toBe('spritelab');
    expect(nameInput.props().readOnly).toBe(true);

    const publishedCheckbox = wrapper.find('input').at(2);
    expect(publishedCheckbox.props().checked).toBe(true);

    const editorLanguageSelect = wrapper.find('select').at(0);
    expect(editorLanguageSelect.props().value).toBe('blockly');
    expect(editorLanguageSelect.find('option').length).toBe(4);

    const blockPoolInput = wrapper.find('input').at(3);
    expect(blockPoolInput.props().value).toBe('GamelabJr');

    const projectUrlInput = wrapper.find('input').at(4);
    expect(projectUrlInput.props().value).toBe('/p/spritelab');

    const descriptionMarkdownInput = wrapper
      .find('TextareaWithMarkdownPreview')
      .at(0);
    expect(descriptionMarkdownInput.props().markdown).toBe('A description of spritelab');

    const categoriesSection = wrapper.find('CollapsibleEditorSection');
    expect(
      categoriesSection.find('OrderableList').props().list.length
    ).toBe(1);
  });

  it('shows ImageInput', () => {
    const wrapper = shallow(<ProgrammingEnvironmentEditor {...defaultProps} />);
    expect(wrapper.find('ImageInput').length).toBe(1);
  });

  it('attempts to save when save is pressed', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingEnvironmentEditor {...defaultProps} />
      </Provider>
    );

    fetchSpy.returns(
      Promise.resolve({
        ok: true,
        json: () => {
          return {};
        },
      })
    );
    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).toHaveBeenCalled().once;
    const fetchCall = fetchSpy.getCall(0);
    expect(fetchCall.args[0]).toBe('/programming_environments/spritelab');
    const fetchCallBody = JSON.parse(fetchCall.args[1].body);
    expect(Object.keys(fetchCallBody).sort()).toEqual([
      'title',
      'published',
      'description',
      'editorLanguage',
      'blockPoolName',
      'projectUrl',
      'imageUrl',
      'categories',
    ].sort());
    expect(fetchCallBody.title).toBe('Spritelab');
    expect(fetchCallBody.published).toBe(true);
    expect(fetchCallBody.description).toBe('A description of spritelab');
    expect(fetchCallBody.editorLanguage).toBe('blockly');
    expect(fetchCallBody.projectUrl).toBe('/p/spritelab');
    expect(fetchCallBody.imageUrl).toBe('images.code.org/spritelab');
  });
});

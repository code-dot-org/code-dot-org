import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import ProgrammingEnvironmentEditor from '@cdo/apps/levelbuilder/code-docs-editor/ProgrammingEnvironmentEditor';
import {getStore} from '@cdo/apps/redux';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    expect(titleInput.props().value).to.equal('Spritelab');

    const nameInput = wrapper.find('input').at(1);
    expect(nameInput.props().value).to.equal('spritelab');
    expect(nameInput.props().readOnly).to.be.true;

    const publishedCheckbox = wrapper.find('input').at(2);
    expect(publishedCheckbox.props().checked).to.be.true;

    const editorLanguageSelect = wrapper.find('select').at(0);
    expect(editorLanguageSelect.props().value).to.equal('blockly');
    expect(editorLanguageSelect.find('option').length).to.equal(4);

    const blockPoolInput = wrapper.find('input').at(3);
    expect(blockPoolInput.props().value).to.equal('GamelabJr');

    const projectUrlInput = wrapper.find('input').at(4);
    expect(projectUrlInput.props().value).to.equal('/p/spritelab');

    const descriptionMarkdownInput = wrapper
      .find('TextareaWithMarkdownPreview')
      .at(0);
    expect(descriptionMarkdownInput.props().markdown).to.equal(
      'A description of spritelab'
    );

    const categoriesSection = wrapper.find('CollapsibleEditorSection');
    expect(
      categoriesSection.find('OrderableList').props().list.length
    ).to.equal(1);
  });

  it('shows ImageInput', () => {
    const wrapper = shallow(<ProgrammingEnvironmentEditor {...defaultProps} />);
    expect(wrapper.find('ImageInput').length).to.equal(1);
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
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).to.be.called.once;
    const fetchCall = fetchSpy.getCall(0);
    expect(fetchCall.args[0]).to.equal('/programming_environments/spritelab');
    const fetchCallBody = JSON.parse(fetchCall.args[1].body);
    expect(Object.keys(fetchCallBody).sort()).to.eql(
      [
        'title',
        'published',
        'description',
        'editorLanguage',
        'blockPoolName',
        'projectUrl',
        'imageUrl',
        'categories',
      ].sort()
    );
    expect(fetchCallBody.title).to.equal('Spritelab');
    expect(fetchCallBody.published).to.be.true;
    expect(fetchCallBody.description).to.equal('A description of spritelab');
    expect(fetchCallBody.editorLanguage).to.equal('blockly');
    expect(fetchCallBody.projectUrl).to.equal('/p/spritelab');
    expect(fetchCallBody.imageUrl).to.equal('images.code.org/spritelab');
  });
});

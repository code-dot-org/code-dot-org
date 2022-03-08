import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ProgrammingEnvironmentEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingEnvironmentEditor';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import sinon from 'sinon';

describe('ProgrammingEnvironmentEditor', () => {
  let defaultProps, fetchSpy;

  beforeEach(() => {
    defaultProps = {
      initialProgrammingEnvironment: {
        name: 'spritelab',
        title: 'Spritelab',
        imageUrl: 'images.code.org/spritelab',
        projectUrl: '/p/spritelab',
        description: 'A description of spritelab',
        editorType: 'blockly',
        categories: [{id: 1, key: 'sprites', name: 'Sprites', color: '#00FF00'}]
      }
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

    const projectUrlInput = wrapper.find('input').at(2);
    expect(projectUrlInput.props().value).to.equal('/p/spritelab');

    const descriptionMarkdownInput = wrapper
      .find('TextareaWithMarkdownPreview')
      .at(0);
    expect(descriptionMarkdownInput.props().markdown).to.equal(
      'A description of spritelab'
    );

    const editorTypeSelect = wrapper.find('select').at(0);
    expect(editorTypeSelect.props().value).to.equal('blockly');
    expect(editorTypeSelect.find('option').length).to.equal(3);

    const categoriesSection = wrapper.find('CollapsibleEditorSection');
    expect(
      categoriesSection.find('OrderableList').props().list.length
    ).to.equal(1);
  });

  it('shows upload image dialog when choose image button is pressed', () => {
    const wrapper = shallow(<ProgrammingEnvironmentEditor {...defaultProps} />);
    const uploadButton = wrapper.find('Button').first();
    expect(uploadButton).to.not.be.null;
    uploadButton.simulate('click');
    expect(wrapper.find('UploadImageDialog').length).to.equal(1);
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
        }
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
        'description',
        'editorType',
        'projectUrl',
        'imageUrl',
        'categories'
      ].sort()
    );
    expect(fetchCallBody.title).to.equal('Spritelab');
    expect(fetchCallBody.description).to.equal('A description of spritelab');
    expect(fetchCallBody.editorType).to.equal('blockly');
    expect(fetchCallBody.projectUrl).to.equal('/p/spritelab');
    expect(fetchCallBody.imageUrl).to.equal('images.code.org/spritelab');
  });
});

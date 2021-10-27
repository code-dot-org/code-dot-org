import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import ProgrammingExpressionEditor from '@cdo/apps/lib/levelbuilder/code-docs-editor/ProgrammingExpressionEditor';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import sinon from 'sinon';

describe('ProgrammingExpressionEditor', () => {
  let defaultProps, fetchSpy;

  beforeEach(() => {
    defaultProps = {
      initialProgrammingExpression: {
        id: 1,
        name: 'Block',
        key: 'block',
        shortDescription: 'This is a short description.',
        externalDocumentation: 'developer.mozilla.org',
        content: 'This is a longer description of the code.',
        syntax: 'block()',
        returnValue: 'none',
        tips: 'some tips on how to use this block',
        parameters: []
      },
      environmentCategories: ['Circuit', 'Variables', 'Canvas']
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
    expect(
      wrapper
        .find('input')
        .at(0)
        .props().value
    ).to.equal('Block');

    // Key
    expect(
      wrapper
        .find('input')
        .at(1)
        .props().value
    ).to.equal('block');
    expect(
      wrapper
        .find('input')
        .at(1)
        .props().readOnly
    ).to.be.true;

    // short description
    expect(
      wrapper
        .find('textarea')
        .at(0)
        .props().value
    ).to.equal('This is a short description.');

    // Documentation section
    const documentationSection = wrapper.find('CollapsibleEditorSection').at(0);
    expect(
      documentationSection
        .find('input')
        .at(0)
        .props().value
    ).to.equal('developer.mozilla.org');
    expect(
      documentationSection
        .find('select')
        .at(0)
        .find('option').length
    ).to.equal(4);
    expect(
      documentationSection
        .find('TextareaWithMarkdownPreview')
        .at(0)
        .props().markdown
    ).to.equal('This is a longer description of the code.');

    const detailsSection = wrapper.find('CollapsibleEditorSection').at(1);
    expect(
      detailsSection
        .find('TextareaWithMarkdownPreview')
        .at(0)
        .props().markdown
    ).to.equal('block()');
    expect(
      detailsSection
        .find('textarea')
        .at(0)
        .props().value
    ).to.equal('none');

    // Tips section
    const tipsSection = wrapper.find('CollapsibleEditorSection').at(2);
    expect(
      tipsSection
        .find('TextareaWithMarkdownPreview')
        .at(0)
        .props().markdown
    ).to.equal('some tips on how to use this block');
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
    expect(JSON.parse(fetchCall.args[1].body)).to.eql({
      name: 'Block',
      shortDescription: 'This is a short description.',
      content: 'This is a longer description of the code.',
      externalDocumentation: 'developer.mozilla.org',
      parameters: [],
      returnValue: 'none',
      syntax: 'block()',
      tips: 'some tips on how to use this block'
    });
  });
});

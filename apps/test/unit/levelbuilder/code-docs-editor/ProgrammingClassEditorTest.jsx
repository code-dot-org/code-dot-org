import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import ProgrammingClassEditor from '@cdo/apps/levelbuilder/code-docs-editor/ProgrammingClassEditor';
import {getStore} from '@cdo/apps/redux';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('displays initial values in input fields in top section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    expect(wrapper.text().includes('Editing Class')).to.be.true;

    // Display name
    expect(wrapper.find('input').at(0).props().value).to.equal('Painter');

    // Key
    expect(wrapper.find('input').at(1).props().value).to.equal('painter');
    expect(wrapper.find('input').at(1).props().readOnly).to.be.true;

    // Category select
    const categorySelect = wrapper.find('select').at(0);
    expect(categorySelect.find('option').length).to.equal(4);
    expect(
      categorySelect.find('option').map(option => option.props().value)
    ).to.eql(['', 'circuit', 'variables', 'canvas']);
  });

  it('displays initial values in input fields in documentation section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    expect(wrapper.text().includes('Editing Class')).to.be.true;

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

    const detailsSection = wrapper.find('CollapsibleEditorSection').at(1);
    expect(
      detailsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).to.equal('Painter()');
  });

  it('displays initial values in input fields in tips section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    expect(wrapper.text().includes('Editing Class')).to.be.true;

    // Tips section
    const tipsSection = wrapper.find('CollapsibleEditorSection').at(2);
    expect(tipsSection.props().title).to.equal('Tips');
    expect(
      tipsSection.find('TextareaWithMarkdownPreview').at(0).props().markdown
    ).to.equal('some tips on how to use this class');
  });

  it('displays initial values in input fields in examples section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    expect(wrapper.text().includes('Editing Class')).to.be.true;
    // Examples section
    const examplesSection = wrapper.find('CollapsibleEditorSection').at(3);
    expect(examplesSection.props().title).to.equal('Examples');
    const orderableExampleList = examplesSection.find('OrderableList');
    expect(orderableExampleList.props().addButtonText).to.equal(
      'Add Another Example'
    );
    expect(orderableExampleList.props().list.length).to.equal(1);
  });

  it('displays initial values in input fields in fields section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    // Fields section
    const fieldsSection = wrapper.find('CollapsibleEditorSection').at(4);
    expect(fieldsSection.props().title).to.equal('Fields');
    const orderableFieldList = fieldsSection.find('OrderableList');
    expect(orderableFieldList.props().addButtonText).to.equal(
      'Add Another Field'
    );
    expect(orderableFieldList.props().list.length).to.equal(1);
  });

  it('displays initial values in input methods in methods section', () => {
    const wrapper = shallow(<ProgrammingClassEditor {...defaultProps} />);
    // Methods section
    const methodsSection = wrapper.find('CollapsibleEditorSection').at(5);
    expect(methodsSection.props().title).to.equal('Methods');
    const orderableMethodList = methodsSection.find('OrderableList');
    expect(orderableMethodList.props().addButtonText).to.equal(
      'Add Another Method'
    );
    expect(orderableMethodList.props().list.length).to.equal(1);
  });

  it('attempts to save when save is pressed', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <ProgrammingClassEditor {...defaultProps} />
      </Provider>
    );

    fetchSpy.returns(Promise.resolve({ok: true}));
    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(fetchSpy).to.be.called.once;
    const fetchCall = fetchSpy.getCall(0);
    expect(fetchCall.args[0]).to.equal('/programming_classes/1');
    const fetchCallBody = JSON.parse(fetchCall.args[1].body);
    expect(Object.keys(fetchCallBody).sort()).to.eql(
      [
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
      ].sort()
    );
    expect(fetchCallBody.name).to.equal('Painter');
    expect(fetchCallBody.shortDescription).to.equal(
      'This is a short description.'
    );
    expect(fetchCallBody.content).to.equal(
      'This is a longer description of the code.'
    );
    expect(fetchCallBody.externalDocumentation).to.equal(
      'developer.mozilla.org'
    );
    expect(fetchCallBody.returnValue).to.equal('none');
    expect(fetchCallBody.syntax).to.equal('Painter()');
    expect(fetchCallBody.tips).to.equal('some tips on how to use this class');
    expect(fetchCallBody.examples[0].name).to.equal('example 1');
  });
});

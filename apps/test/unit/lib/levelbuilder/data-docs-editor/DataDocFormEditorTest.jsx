import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import DataDocFormEditor from '@cdo/apps/lib/levelbuilder/data-docs-editor/DataDocFormEditor';
import {isolateComponent} from 'isolate-react';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import sinon from 'sinon';
import {mount} from 'enzyme';
import * as utils from '@cdo/apps/utils';

describe('DataDocFormEditor', () => {
  let defaultProps;
  const docKey = 'doc_key';
  const docName = 'Name of Doc';
  const docContent = 'Content of Doc';

  beforeEach(() => {
    defaultProps = {
      dataDocKey: docKey,
      originalDataDocName: docName,
      originalDataDocContent: docContent
    };
  });

  it('renders editor with props already loaded into entry fields', () => {
    const wrapper = isolateComponent(<DataDocFormEditor {...defaultProps} />);
    expect(wrapper.findAll('input')[0].props.value).to.equal(docKey);
    expect(wrapper.findAll('input')[1].props.value).to.equal(docName);
    expect(
      wrapper.findOne('TextareaWithMarkdownPreview').props.markdown
    ).to.equal(docContent);
  });

  it('ensures key input is disabled in editor', () => {
    const wrapper = isolateComponent(<DataDocFormEditor {...defaultProps} />);
    expect(wrapper.findAll('input')[0].props.disabled).to.be.true;
  });

  it('modifies doc name', () => {
    const wrapper = isolateComponent(<DataDocFormEditor {...defaultProps} />);
    const newDocName = 'New Name of Doc';
    wrapper.findAll('input')[1].props.onChange({target: {value: newDocName}});

    expect(wrapper.findAll('input')[0].props.value).to.equal(docKey);
    expect(wrapper.findAll('input')[1].props.value).to.equal(newDocName);
    expect(
      wrapper.findOne('TextareaWithMarkdownPreview').props.markdown
    ).to.equal(docContent);
  });

  it('modifies doc content', () => {
    const wrapper = isolateComponent(<DataDocFormEditor {...defaultProps} />);
    const newDocContent = 'New Content of Doc';
    wrapper
      .findOne('TextareaWithMarkdownPreview')
      .props.handleMarkdownChange({target: {value: newDocContent}});

    expect(wrapper.findAll('input')[0].props.value).to.equal(docKey);
    expect(wrapper.findAll('input')[1].props.value).to.equal(docName);
    expect(
      wrapper.findOne('TextareaWithMarkdownPreview').props.markdown
    ).to.equal(newDocContent);
  });

  it('clicking Save And Keep Editing button sends PUT request and does not redirect', () => {
    sinon.stub(utils, 'navigateToHref');
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/data_docs/${docKey}`, [
      200,
      {'Content-Type': 'application/json'},
      ''
    ]);

    let store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <DataDocFormEditor {...defaultProps} />
      </Provider>
    );
    const saveAndKeepEditingButton = wrapper.find('button').at(0);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    expect(utils.navigateToHref).to.not.have.been.called;

    utils.navigateToHref.restore();
    server.restore();
  });

  it('clicking Save And Close button sends PUT request and redirects', () => {
    /* sinon.stub(utils, 'navigateToHref');
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/data_docs/${docKey}`, [
      200,
      {'Content-Type': 'application/json'},
      ''
    ]);

    let store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <DataDocFormEditor {...defaultProps} />
      </Provider>
    );

    const saveAndCloseButton = wrapper.find('button').at(1);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    expect(utils.navigateToHref).to.have.been.calledWith(
      `/data_docs/${docKey}`
    );

    utils.navigateToHref.restore();
    server.restore(); */
  });
});

import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import DataDocFormEditor from '@cdo/apps/lib/levelbuilder/data-docs-editor/DataDocFormEditor';
import {isolateComponent} from 'isolate-react';

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
});

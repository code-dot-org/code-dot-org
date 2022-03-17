import React from 'react';
import {isolateComponent} from 'isolate-react';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import ReferenceGuideEditor from '@cdo/apps/lib/levelbuilder/reference-guide-editor/ReferenceGuideEditor';

const makeReferenceGuide = (key, parent = null, pos = 0) => ({
  display_name: key,
  key: key,
  parent_reference_guide_key: parent,
  course_version_name: 'csa-2021',
  content: '##some markdown'
});

describe('ReferenceGuideEditorTest', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    fetchSpy.restore();
  });

  it('displays the reference guide', () => {
    const referenceGuide = makeReferenceGuide('hello_world', 'parent_key');
    const wrapper = isolateComponent(
      <ReferenceGuideEditor referenceGuide={referenceGuide} />
    );
    expect(wrapper.exists('input[value=hello_world]'));
    expect(wrapper.exists('input[value=csa-2021]'));
    expect(wrapper.exists('input[value=parent_key]'));
    expect(
      wrapper.findOne('TextareaWithMarkdownPreview').props.markdown
    ).to.equal('##some markdown');
  });

  it('saves the new data with save is pressed', () => {
    fetchSpy.returns(Promise.resolve({ok: true}));
    const referenceGuide = makeReferenceGuide('hello_world', 'parent_key');
    const wrapper = isolateComponent(
      <ReferenceGuideEditor referenceGuide={referenceGuide} />
    );

    wrapper
      .findOne('input[value=parent_key]')
      .props.onChange({target: {value: 'new_parent_key'}});

    // click save
    wrapper.findOne('SaveBar').props.handleSave();

    expect(fetchSpy).to.have.been.calledOnce;
    expect(fetchSpy.getCall(0).args[1].body).to.equal(
      JSON.stringify({
        ...referenceGuide,
        parent_reference_guide_key: 'new_parent_key'
      })
    );
  });
});

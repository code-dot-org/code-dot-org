import {isolateComponent} from 'isolate-react';
import React from 'react';

import ReferenceGuideEditor from '@cdo/apps/lib/levelbuilder/reference-guide-editor/ReferenceGuideEditor';

const makeReferenceGuide = (key, parent = null, pos = 0) => ({
  display_name: key,
  key: key,
  parent_reference_guide_key: parent,
  course_version_name: 'csa-2021',
  content: '##some markdown',
});

describe('ReferenceGuideEditorTest', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(window, 'fetch').mockClear().mockImplementation();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('displays the reference guide', () => {
    const referenceGuide = makeReferenceGuide('hello_world', 'parent_key');
    const referenceGuides = [
      makeReferenceGuide('hello_world', 'parent_key'),
      makeReferenceGuide('hello_world2', 'parent_key'),
      makeReferenceGuide('hello_world3', 'parent_key'),
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideEditor
        referenceGuide={referenceGuide}
        referenceGuides={referenceGuides}
        updateUrl={'/courses/etc/guides/'}
        editAllUrl={'/courses/etc/guides/edit'}
      />
    );
    expect(wrapper.exists('input[value=hello_world]'));
    expect(wrapper.exists('input[value=csa-2021]'));
    expect(wrapper.exists('input[value=parent_key]'));
    expect(wrapper.findOne('TextareaWithMarkdownPreview').props.markdown).toBe(
      '##some markdown'
    );
  });

  it('saves the new data with save is pressed', () => {
    fetchSpy.mockReturnValue(Promise.resolve({ok: true}));
    const referenceGuide = makeReferenceGuide('hello_world', 'parent_key');
    const referenceGuides = [
      makeReferenceGuide('hello_world', 'parent_key'),
      makeReferenceGuide('hello_world2', 'parent_key'),
      makeReferenceGuide('hello_world3', 'parent_key'),
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideEditor
        referenceGuide={referenceGuide}
        referenceGuides={referenceGuides}
        updateUrl={'/courses/etc/guides/'}
        editAllUrl={'/courses/etc/guides/edit'}
      />
    );

    const options = wrapper.findAll('option').map(c => c.toString());
    expect(options).toContain('<option value="null">No parent</option>');
    expect(options).not.toContain('<option>hello_world</option>');
    expect(options).toContain('<option>hello_world2</option>');
    expect(options).toContain('<option>hello_world3</option>');

    // change the display name
    wrapper
      .findAll('input[value=hello_world]')[1]
      .props.onChange({target: {value: 'new_display_name'}});

    // click save
    wrapper.findOne('SaveBar').props.handleSave();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][1].body).toBe(
      JSON.stringify({
        ...referenceGuide,
        display_name: 'new_display_name',
      })
    );
  });

  it('submitting with no parent selected sends null', () => {
    fetchSpy.mockReturnValue(Promise.resolve({ok: true}));
    const referenceGuide = makeReferenceGuide('hello_world', 'parent_key');
    const referenceGuides = [
      makeReferenceGuide('hello_world', 'parent_key'),
      makeReferenceGuide('hello_world2', 'parent_key'),
      makeReferenceGuide('hello_world3', 'parent_key'),
    ];
    const wrapper = isolateComponent(
      <ReferenceGuideEditor
        referenceGuide={referenceGuide}
        referenceGuides={referenceGuides}
        updateUrl={'/courses/etc/guides/'}
        editAllUrl={'/courses/etc/guides/edit'}
      />
    );

    // change the display name
    wrapper.findOne('select').props.onChange({target: {value: 'null'}});

    // click save
    wrapper.findOne('SaveBar').props.handleSave();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][1].body).toBe(
      JSON.stringify({
        ...referenceGuide,
        parent_reference_guide_key: null,
      })
    );
  });
});

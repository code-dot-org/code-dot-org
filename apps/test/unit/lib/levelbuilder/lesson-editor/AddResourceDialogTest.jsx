import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AddResourceDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddResourceDialog';

describe('AddResourceDialog', () => {
  let defaultProps, onSaveSpy, handleCloseSpy;
  beforeEach(() => {
    onSaveSpy = jest.fn();
    handleCloseSpy = jest.fn();
    defaultProps = {
      isOpen: true,
      onSave: onSaveSpy,
      handleClose: handleCloseSpy,
      typeOptions: ['Activity Guide', 'Handout'],
      audienceOptions: ['Teacher', 'Student'],
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddResourceDialog {...defaultProps} />);
    expect(wrapper.contains('Add Resource')).toBe(true);
    expect(wrapper.find('input').length).toBe(6);
    expect(wrapper.find('select').length).toBe(2);
  });

  it('has an extra input with course version id if one is provided', () => {
    const wrapper = shallow(
      <AddResourceDialog {...defaultProps} courseVersionId={1} />
    );
    expect(wrapper.contains('Add Resource')).toBe(true);
    expect(wrapper.find('input').length).toBe(7);
    expect(wrapper.find('select').length).toBe(2);
  });

  it('validates key, name, and url on submit', () => {
    const wrapper = mount(<AddResourceDialog {...defaultProps} />);
    wrapper.find('#submit-button').simulate('submit');
    expect(wrapper.contains('Name is required. URL is required.')).toBe(true);
    expect(onSaveSpy).not.toHaveBeenCalled();
    expect(handleCloseSpy).not.toHaveBeenCalled();
  });

  it('saves if input is valid', async () => {
    const wrapper = mount(<AddResourceDialog {...defaultProps} />);
    const instance = wrapper.instance();

    const saveResourceSpy = jest
      .spyOn(instance, 'saveResource')
      .mockClear()
      .mockImplementation();

    await React.act(() => {
      instance.setState({
        name: 'my resource name',
        url: 'code.org',
      });
    });

    instance.forceUpdate();
    wrapper.update();
    wrapper.find('#submit-button').simulate('submit');
    expect(saveResourceSpy).toHaveBeenCalledTimes(1);
  });

  it('renders an existing resource for edit', () => {
    const existingResource = {
      key: 'existing_resource',
      name: 'existing resource',
      url: 'fake.url',
      assessment: false,
      includeInPdf: true,
      downloadUrl: '',
      type: 'Handout',
      audience: 'Teacher',
    };
    const wrapper = mount(
      <AddResourceDialog
        {...defaultProps}
        existingResource={existingResource}
      />
    );
    expect(wrapper.find('[name="name"]').props().value).toBe(
      'existing resource'
    );
    expect(wrapper.find('[name="url"]').props().value).toBe('fake.url');
    expect(wrapper.find('[name="includeInPdf"]').props().checked).toBe(true);
    expect(wrapper.find('[name="type"]').props().value).toBe('Handout');
    expect(wrapper.find('[name="audience"]').props().value).toBe('Teacher');
  });
});

import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import AddResourceDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddResourceDialog';
import sinon from 'sinon';

describe('AddResourceDialog', () => {
  let defaultProps, onSaveSpy, handleCloseSpy;
  beforeEach(() => {
    onSaveSpy = sinon.spy();
    handleCloseSpy = sinon.spy();
    defaultProps = {
      isOpen: true,
      onSave: onSaveSpy,
      handleClose: handleCloseSpy,
      typeOptions: ['Activity Guide', 'Handout'],
      audienceOptions: ['Teacher', 'Student']
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddResourceDialog {...defaultProps} />);
    expect(wrapper.contains('Add Resource')).to.be.true;
    expect(wrapper.find('input').length).to.equal(6);
    expect(wrapper.find('select').length).to.equal(2);
  });

  it('has an extra input with course version id if one is provided', () => {
    const wrapper = shallow(
      <AddResourceDialog {...defaultProps} courseVersionId={1} />
    );
    expect(wrapper.contains('Add Resource')).to.be.true;
    expect(wrapper.find('input').length).to.equal(7);
    expect(wrapper.find('select').length).to.equal(2);
  });

  it('validates key, name, and url on submit', () => {
    const wrapper = mount(<AddResourceDialog {...defaultProps} />);
    wrapper.find('#submit-button').simulate('submit');
    expect(wrapper.contains('Name is required. URL is required.')).to.be.true;
    expect(onSaveSpy.notCalled).to.be.true;
    expect(handleCloseSpy.notCalled).to.be.true;
  });

  it('saves if input is valid', () => {
    const wrapper = mount(<AddResourceDialog {...defaultProps} />);
    const instance = wrapper.instance();
    instance.setState({
      name: 'my resource name',
      url: 'code.org'
    });
    const saveResourceSpy = sinon.stub(instance, 'saveResource');
    instance.forceUpdate();
    wrapper.update();
    wrapper.find('#submit-button').simulate('submit');
    expect(saveResourceSpy.calledOnce).to.be.true;
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
      audience: 'Teacher'
    };
    const wrapper = mount(
      <AddResourceDialog
        {...defaultProps}
        existingResource={existingResource}
      />
    );
    expect(wrapper.find('[name="name"]').props().value).to.equal(
      'existing resource'
    );
    expect(wrapper.find('[name="url"]').props().value).to.equal('fake.url');
    expect(wrapper.find('[name="includeInPdf"]').props().checked).to.be.true;
    expect(wrapper.find('[name="type"]').props().value).to.equal('Handout');
    expect(wrapper.find('[name="audience"]').props().value).to.equal('Teacher');
  });
});

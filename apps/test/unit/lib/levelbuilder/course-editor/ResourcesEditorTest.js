import {expect, assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow, mount} from 'enzyme';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/course-editor/ResourcesEditor';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import sinon from 'sinon';

describe('ResourcesEditor', () => {
  let defaultProps, updateTeacherResources;

  beforeEach(() => {
    updateTeacherResources = sinon.spy();
    defaultProps = {
      inputStyle: {},
      resources: [
        {link: '', type: ''},
        {link: '', type: ''},
        {link: '', type: ''},
        {link: '', type: ''},
        {link: '', type: ''},
        {link: '', type: ''},
        {link: '', type: ''},
        {link: '', type: ''},
        {link: '', type: ''},
        {link: '', type: ''}
      ],
      updateTeacherResources
    };
  });

  it('renders one more Resource than it has defined', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[
          {type: ResourceType.curriculum, link: '/foo'},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''}
        ]}
      />
    );
    assert.strictEqual(wrapper.find('Resource').length, 2);
  });

  it('adds an additional Resource when providing one with a value', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[
          {type: ResourceType.curriculum, link: '/foo'},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''}
        ]}
      />
    );
    const fakeEvent = {
      target: {
        value: ResourceType.vocabulary
      }
    };
    wrapper.instance().handleChangeType(fakeEvent, 1);
    expect(updateTeacherResources).to.have.been.calledWith([
      {link: '/foo', type: 'curriculum'},
      {link: '/link/to/vocab', type: 'vocabulary'},
      {link: '', type: ''},
      {link: '', type: ''},
      {link: '', type: ''},
      {link: '', type: ''},
      {link: '', type: ''},
      {link: '', type: ''},
      {link: '', type: ''},
      {link: '', type: ''}
    ]);
  });

  it('shows an error if you duplicate resource types', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[
          {type: ResourceType.curriculum, link: '/foo'},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''},
          {link: '', type: ''}
        ]}
      />
    );
    const fakeEvent = {
      target: {
        value: ResourceType.curriculum
      }
    };
    wrapper.instance().handleChangeType(fakeEvent, 1);
    assert.strictEqual(
      wrapper.state('errorString'),
      'Your resource types contains a duplicate'
    );
  });

  describe('Resource', () => {
    it('has a type selector and a link input', () => {
      const wrapper = mount(<ResourcesEditor {...defaultProps} />);
      const resource = wrapper.find('Resource').at(0);
      assert.equal(resource.find('select').length, 1);
      assert.equal(resource.find('option').length, 11);
      assert.equal(resource.find('input').length, 1);
    });
  });
});

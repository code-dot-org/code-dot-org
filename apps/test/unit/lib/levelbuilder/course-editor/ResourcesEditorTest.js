import {expect, assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow, mount} from 'enzyme';
import ResourcesEditor from '@cdo/apps/lib/levelbuilder/course-editor/ResourcesEditor';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';
import sinon from 'sinon';

describe('ResourcesEditor', () => {
  let defaultProps, updateResources;

  beforeEach(() => {
    updateResources = sinon.spy();
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
      updateResources,
      useMigratedResources: false
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
    expect(updateResources).to.have.been.calledWith([
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

  it('uses the new resource editor for migrated resources', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={undefined}
        migratedTeacherResources={[
          {
            id: 1,
            key: 'curriculum',
            name: 'Curriculum',
            url: 'https://example.com/a'
          },
          {
            id: 2,
            key: 'vocabulary',
            name: 'Vocabulary',
            url: 'https://example.com/b'
          }
        ]}
        useMigratedResources={true}
        courseVersionId={1}
      />
    );
    expect(wrapper.find('Connect(ResourcesEditor)').length).to.equal(1);
  });

  it('uses no editor for migrated resources without courseVersionId', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={undefined}
        migratedTeacherResources={[
          {
            id: 1,
            key: 'curriculum',
            name: 'Curriculum',
            url: 'https://example.com/a'
          },
          {
            id: 2,
            key: 'vocabulary',
            name: 'Vocabulary',
            url: 'https://example.com/b'
          }
        ]}
        useMigratedResources={true}
        courseVersionId={null}
      />
    );
    expect(wrapper.find('Connect(ResourcesEditor)').length).to.equal(0);
    expect(
      wrapper.contains(
        'Cannot add resources to migrated script without course version.'
      )
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

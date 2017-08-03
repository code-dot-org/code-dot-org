import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow, mount } from 'enzyme';
import ResourcesEditor from '@cdo/apps/templates/courseOverview/ResourcesEditor';
import ResourceType from '@cdo/apps/templates/courseOverview/resourceType';

describe('ResourcesEditor', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  it('adds empty resources if passed none', () => {
    const wrapper = shallow(
      <ResourcesEditor
        inputStyle={{}}
        resources={[]}
      />
    );
    assert.deepEqual(wrapper.state('resources'), [
      {type: '', link: ''},
      {type: '', link: ''},
      {type: '', link: ''}
    ]);
  });

  it('adds empty resources if passed fewer than three', () => {
    const wrapper = shallow(
      <ResourcesEditor
        inputStyle={{}}
        resources={[
          { type: ResourceType.curriculum, link: '/foo' }
        ]}
      />
    );
    assert.deepEqual(wrapper.state('resources'), [
      {type: ResourceType.curriculum, link: '/foo'},
      {type: '', link: ''},
      {type: '', link: ''}
    ]);
  });

  it('renders three Resources', () => {
    const wrapper = shallow(
      <ResourcesEditor
        inputStyle={{}}
        resources={[]}
      />
    );
    assert.strictEqual(wrapper.find('Resource').length, 3);
  });

  describe('Resource', () => {
    it('has a type selector and a link input', () => {
      const wrapper = mount(
        <ResourcesEditor
          inputStyle={{}}
          resources={[]}
        />
      );
      const resource = wrapper.find('Resource').at(0);
      assert.equal(resource.find('select').length, 1);
      assert.equal(resource.find('option').length, 4);
      assert.equal(resource.find('input').length, 1);
    });
  });
});

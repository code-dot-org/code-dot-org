import {assert} from '../../../util/deprecatedChai';
import React from 'react';
import {shallow, mount} from 'enzyme';
import ResourcesEditor from '@cdo/apps/templates/courseOverview/ResourcesEditor';

const defaultProps = {
  inputStyle: {},
  resources: []
};

describe('ResourcesEditor', () => {
  it('adds empty resources if passed none', () => {
    const wrapper = shallow(<ResourcesEditor {...defaultProps} />);
    assert.deepEqual(wrapper.state('resources'), [
      {type: '', link: '/link/to/resource'}
    ]);
  });

  it('adds empty resources if passed fewer than max', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[{type: 'Curriculum', link: '/foo'}]}
      />
    );
    assert.deepEqual(wrapper.state('resources'), [
      {type: 'Curriculum', link: '/foo'},
      {type: '', link: '/link/to/resource'}
    ]);
  });

  it('renders one more Resource than it has defined', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[{type: 'Curriculum', link: '/foo'}]}
      />
    );
    assert.strictEqual(wrapper.find('ResourceEditorInput').length, 2);
  });

  it('adds an additional Resource when providing one with a value', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[{type: 'Curriculum', link: '/foo'}]}
      />
    );
    const fakeEvent = {
      target: {
        value: 'Vocabulary'
      }
    };
    wrapper.instance().handleChangeType(fakeEvent, 1);
    assert.strictEqual(wrapper.find('ResourceEditorInput').length, 3);
  });

  it('shows an error if you duplicate resource types', () => {
    const wrapper = shallow(
      <ResourcesEditor
        {...defaultProps}
        resources={[{type: 'Curriculum', link: '/foo'}]}
      />
    );
    const fakeEvent = {
      target: {
        value: 'Curriculum'
      }
    };
    wrapper.instance().handleChangeType(fakeEvent, 1);
    assert.strictEqual(
      wrapper.state('errorString'),
      'Your resource types contains a duplicate'
    );
  });

  describe('Resource', () => {
    it('has a type input and a link input', () => {
      const wrapper = mount(<ResourcesEditor {...defaultProps} />);
      const resource = wrapper.find('ResourceEditorInput').at(0);
      assert.equal(resource.find('input').length, 2);
    });
  });
});

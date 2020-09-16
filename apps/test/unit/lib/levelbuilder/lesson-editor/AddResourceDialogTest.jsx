import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import AddResourceDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/AddResourceDialog';
import sinon from 'sinon';

describe('AddResourceDialog', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      isOpen: true,
      handleConfirm: sinon.spy()
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<AddResourceDialog {...defaultProps} />);
    expect(wrapper.contains('Add Resource'));
    expect(wrapper.find('BaseDialog').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
  });
});

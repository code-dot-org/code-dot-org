import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import EditTipDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/EditTipDialog';
import sinon from 'sinon';

describe('EditTipDialog', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      isOpen: true,
      handleConfirm: sinon.spy(),
      tip: {
        key: 'tip-1',
        type: 'teachingTip',
        markdown: ''
      }
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<EditTipDialog {...defaultProps} />);
    expect(wrapper.contains('Add Tip'));
    expect(wrapper.find('LessonTip').length).to.equal(1);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('textarea').length).to.equal(1);
    expect(wrapper.find('BaseDialog').length).to.equal(1);
  });
});

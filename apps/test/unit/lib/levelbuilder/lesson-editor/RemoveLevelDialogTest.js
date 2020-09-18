import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {UnconnectedRemoveLevelDialog as RemoveLevelDialog} from '@cdo/apps/lib/levelbuilder/lesson-editor/RemoveLevelDialog';

const levelKeyList = {
  22: 'Level Twenty Two'
};

describe('RemoveLevelDialog', () => {
  let handleClose, removeLevel, props;
  beforeEach(() => {
    handleClose = sinon.spy();
    removeLevel = sinon.spy();
    props = {
      activityPosition: 1,
      activitySection: {
        position: 3,
        levels: [
          {
            position: 1,
            activeId: 22,
            ids: [22]
          }
        ]
      },
      levelPosToRemove: 1,
      handleClose,
      removeLevel,
      levelKeyList
    };
  });

  it('is initially closed', () => {
    props.levelPosToRemove = null;
    const wrapper = mount(<RemoveLevelDialog {...props} />);
    expect(wrapper.find('.modal-body')).to.have.lengthOf(0);
  });
  it('is open when level is specified', () => {
    const wrapper = mount(<RemoveLevelDialog {...props} />);
    expect(wrapper.find('.modal-body')).to.have.lengthOf(1);
  });
  it('removes level on confirm', () => {
    const wrapper = mount(<RemoveLevelDialog {...props} />);
    expect(wrapper.find('.modal-body')).to.have.lengthOf(1);

    const body = wrapper.find('.modal-body');
    const deleteButton = body.find('button').at(1);
    expect(deleteButton.text()).to.include('Delete');
    deleteButton.simulate('click');
    expect(removeLevel).to.have.been.calledWith(1, 3, 1);
    expect(handleClose).to.have.been.calledOnce;
  });
  it('does not remove level on cancel', () => {
    const wrapper = mount(<RemoveLevelDialog {...props} />);
    expect(wrapper.find('.modal-body')).to.have.lengthOf(1);

    const body = wrapper.find('.modal-body');
    const cancelButton = body.find('button').at(0);
    expect(cancelButton.text()).to.include('Cancel');
    cancelButton.simulate('click');
    expect(removeLevel).not.to.have.been.called;
    expect(handleClose).to.have.been.calledOnce;
  });
});

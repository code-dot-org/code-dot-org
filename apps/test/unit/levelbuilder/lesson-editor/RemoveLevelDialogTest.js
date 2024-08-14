import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedRemoveLevelDialog as RemoveLevelDialog} from '@cdo/apps/levelbuilder/lesson-editor/RemoveLevelDialog';

import {sampleActivities} from './activitiesTestData';

describe('RemoveLevelDialog', () => {
  let handleClose, removeLevel, props;
  beforeEach(() => {
    handleClose = jest.fn();
    removeLevel = jest.fn();
    props = {
      activityPosition: 1,
      activitySection: sampleActivities[0].activitySections[2],
      levelPosToRemove: 1,
      handleClose,
      removeLevel,
    };
  });

  it('is initially closed', () => {
    props.levelPosToRemove = null;
    const wrapper = mount(<RemoveLevelDialog {...props} />);
    expect(wrapper.find('.modal-body')).toHaveLength(0);
  });
  it('is open when level is specified', () => {
    const wrapper = mount(<RemoveLevelDialog {...props} />);
    expect(wrapper.find('.modal-body')).toHaveLength(1);
  });
  it('removes level on confirm', () => {
    const wrapper = mount(<RemoveLevelDialog {...props} />);
    expect(wrapper.find('.modal-body')).toHaveLength(1);

    const body = wrapper.find('.modal-body');
    const deleteButton = body.find('button').at(2);
    expect(deleteButton.text()).toContain('Delete');
    deleteButton.simulate('click');
    expect(removeLevel).toHaveBeenCalledWith(1, 3, 1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  it('does not remove level on cancel', () => {
    const wrapper = mount(<RemoveLevelDialog {...props} />);
    expect(wrapper.find('.modal-body')).toHaveLength(1);

    const body = wrapper.find('.modal-body');
    const cancelButton = body.find('button').at(1);
    expect(cancelButton.text()).toContain('Cancel');
    cancelButton.simulate('click');
    expect(removeLevel).not.toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import sinon from 'sinon';
import LevelDetailsDialog from '@cdo/apps/templates/lessonOverview/activities/LevelDetailsDialog';

describe('LevelDetailsDialogTest', () => {
  let handleCloseSpy, defaultProps;

  beforeEach(() => {
    handleCloseSpy = sinon.spy();
    defaultProps = {
      handleClose: handleCloseSpy,
      scriptLevel: {
        url: 'level.url',
        level: {
          type: 'External',
          markdown: 'Some markdown'
        }
      }
    };
  });

  it('calls handleClose when dismiss is clicked', () => {
    const wrapper = shallow(<LevelDetailsDialog {...defaultProps} />);
    const dismissButton = wrapper.find('Button').at(0);
    dismissButton.simulate('click');
    expect(handleCloseSpy.calledOnce).to.be.true;
  });

  it('links to level url', () => {
    const wrapper = shallow(<LevelDetailsDialog {...defaultProps} />);
    const levelLink = wrapper.find('Button').at(1);
    expect(levelLink.props().href).to.equal('level.url');
  });

  it('can display an external markdown level', () => {
    const wrapper = mount(
      <LevelDetailsDialog
        handleClose={handleCloseSpy}
        scriptLevel={{
          url: 'level.url',
          level: {type: 'External', markdown: 'This is some text.'}
        }}
      />
    );
    expect(wrapper.contains('This is some text.')).to.be.true;
  });
});

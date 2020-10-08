import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedUnitCard as UnitCard} from '@cdo/apps/lib/levelbuilder/script-editor/UnitCard';
import sinon from 'sinon';
import {nonUserFacingGroup} from './LessonGroupCardTest';

describe('UnitCard', () => {
  let defaultProps,
    addGroup,
    convertGroupToUserFacing,
    convertGroupToNonUserFacing;

  beforeEach(() => {
    addGroup = sinon.spy();
    convertGroupToUserFacing = sinon.spy();
    convertGroupToNonUserFacing = sinon.spy();
    defaultProps = {
      addGroup,
      convertGroupToUserFacing,
      convertGroupToNonUserFacing,
      lessonGroups: [
        {
          key: 'lg-key',
          displayName: 'Display Name',
          position: 1,
          userFacing: true,
          lessons: [
            {
              id: 100,
              name: 'A',
              key: 'lesson-1',
              position: 1
            },
            {
              name: 'B',
              key: 'lesson-2',
              id: 101,
              position: 2
            }
          ]
        },
        {
          key: 'lg-key-2',
          displayName: 'Display Name 2',
          position: 2,
          userFacing: true,
          lessons: [
            {
              id: 100,
              key: 'lesson-3',
              name: 'A',
              position: 1
            },
            {
              name: 'B',
              key: 'lesson-4',
              id: 101,
              position: 2
            }
          ]
        }
      ]
    };
  });

  it('displays UnitCard correctly when user facing lesson groups', () => {
    let wrapper = shallow(<UnitCard {...defaultProps} />);
    expect(wrapper.find('Connect(LessonGroupCard)')).to.have.lengthOf(2);
    expect(wrapper.find('button')).to.have.lengthOf(1);
    expect(wrapper.find('button').text()).to.include('Add Lesson Group');
  });

  it('displays UnitCard correctly when single user facing lesson groups', () => {
    let wrapper = shallow(
      <UnitCard
        {...defaultProps}
        lessonGroups={[defaultProps.lessonGroups[0]]}
      />
    );
    expect(wrapper.find('Connect(LessonGroupCard)')).to.have.lengthOf(1);
    expect(wrapper.find('button')).to.have.lengthOf(2);
    expect(
      wrapper
        .find('button')
        .at(0)
        .text()
    ).to.include('Add Lesson Group');
    expect(
      wrapper
        .find('button')
        .at(1)
        .text()
    ).to.include('Disable Lesson Groups');
  });

  it('displays UnitCard correctly when non user facing lesson group', () => {
    let wrapper = shallow(
      <UnitCard {...defaultProps} lessonGroups={[nonUserFacingGroup]} />
    );
    expect(wrapper.find('Connect(LessonGroupCard)')).to.have.lengthOf(1);
    expect(wrapper.find('button')).to.have.lengthOf(1);
    expect(wrapper.find('button').text()).to.include('Enable Lesson Groups');
  });

  it('add new lesson group', () => {
    const prompt = sinon.stub(window, 'prompt');
    prompt.returns('Lesson Group Name');

    let wrapper = shallow(<UnitCard {...defaultProps} />);

    const button = wrapper.find('button');
    expect(button.text()).to.include('Add Lesson Group');
    button.simulate('mouseDown');

    expect(addGroup).to.have.been.calledOnce;
    window.prompt.restore();
  });

  it('enable lesson groups', () => {
    const prompt = sinon.stub(window, 'prompt');
    prompt.returns('Lesson Group Name');

    let wrapper = shallow(
      <UnitCard {...defaultProps} lessonGroups={[nonUserFacingGroup]} />
    );
    const button = wrapper.find('button');
    expect(button.text()).to.include('Enable Lesson Groups');
    button.simulate('mouseDown');

    expect(convertGroupToUserFacing).to.have.been.calledOnce;
    window.prompt.restore();
  });

  it('disable lesson groups', () => {
    let wrapper = shallow(
      <UnitCard
        {...defaultProps}
        lessonGroups={[defaultProps.lessonGroups[0]]}
      />
    );
    const button = wrapper.find('button').at(1);
    expect(button.text()).to.include('Disable Lesson Groups');
    button.simulate('mouseDown');

    expect(convertGroupToNonUserFacing).to.have.been.calledOnce;
  });
});

import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedUnitCard as UnitCard} from '@cdo/apps/lib/levelbuilder/unit-editor/UnitCard';
import sinon from 'sinon';
import {nonUserFacingGroup} from './LessonGroupCardTest';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/unit-editor/unitEditorRedux';
import {Provider} from 'react-redux';

describe('UnitCard', () => {
  let defaultProps,
    addGroup,
    convertGroupToUserFacing,
    convertGroupToNonUserFacing,
    store;

  let lessonGroups = [
    {
      key: 'lg-key',
      displayName: 'Display Name',
      position: 1,
      description: 'Lesson groups are great!',
      bigQuestions: 'Who?',
      userFacing: true,
      lessons: [
        {
          id: 100,
          name: 'Lesson A',
          key: 'lesson-1',
          position: 1,
          levels: []
        },
        {
          name: 'Lesson B',
          key: 'lesson-2',
          id: 101,
          position: 2,
          levels: []
        }
      ]
    },
    {
      key: 'lg-key-2',
      displayName: 'Display Name 2',
      position: 2,
      description: 'This is not a chapter',
      bigQuestions: 'What?',
      userFacing: true,
      lessons: [
        {
          id: 100,
          key: 'lesson-3',
          name: 'Lesson C',
          position: 1,
          levels: []
        },
        {
          name: 'Lesson D',
          key: 'lesson-4',
          id: 101,
          position: 2,
          levels: []
        }
      ]
    }
  ];

  beforeEach(() => {
    stubRedux();
    registerReducers({...reducers});
    store = getStore();
    store.dispatch(init(lessonGroups, {}));

    addGroup = sinon.spy();
    convertGroupToUserFacing = sinon.spy();
    convertGroupToNonUserFacing = sinon.spy();
    defaultProps = {
      addGroup,
      convertGroupToUserFacing,
      convertGroupToNonUserFacing,
      lessonGroups
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <UnitCard {...combinedProps} />
      </Provider>
    );
  };

  it('displays UnitCard correctly when user facing lesson groups', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('Connect(LessonGroupCard)')).to.have.lengthOf(2);
    expect(wrapper.find('LessonToken')).to.have.lengthOf(4);
    expect(wrapper.find('textarea')).to.have.lengthOf(4);

    expect(wrapper.find('button').map(b => b.text())).to.eql([
      'Lesson',
      'Lesson',
      'Add Lesson Group'
    ]);
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

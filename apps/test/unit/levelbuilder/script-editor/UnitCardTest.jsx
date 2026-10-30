import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';

import {UnconnectedUnitCard as UnitCard} from '@cdo/apps/levelbuilder/unit-editor/UnitCard';
import reducers, {
  init,
} from '@cdo/apps/levelbuilder/unit-editor/unitEditorRedux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers,
} from '@cdo/apps/redux';

import {nonUserFacingGroup} from './LessonGroupCardTest';

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
          levels: [],
        },
        {
          name: 'Lesson B',
          key: 'lesson-2',
          id: 101,
          position: 2,
          levels: [],
        },
      ],
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
          levels: [],
        },
        {
          name: 'Lesson D',
          key: 'lesson-4',
          id: 101,
          position: 2,
          levels: [],
        },
      ],
    },
  ];

  beforeEach(() => {
    stubRedux();
    registerReducers({...reducers});
    store = getStore();
    store.dispatch(init(lessonGroups, {}));

    addGroup = jest.fn();
    convertGroupToUserFacing = jest.fn();
    convertGroupToNonUserFacing = jest.fn();
    defaultProps = {
      addGroup,
      convertGroupToUserFacing,
      convertGroupToNonUserFacing,
      lessonGroups,
      allowMajorCurriculumChanges: true,
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
    // There are 2 lesson groups, but they have forwardRefs which causes each component
    // to be counted twice.
    expect(wrapper.find('Connect(LessonGroupCard)')).toHaveLength(4);
    expect(wrapper.find('LessonToken')).toHaveLength(4);
    expect(wrapper.find('textarea')).toHaveLength(4);

    expect(wrapper.find('button').map(b => b.text())).toEqual([
      'Lesson',
      'Lesson',
      'Add Lesson Group',
    ]);
  });

  it('displays UnitCard correctly when single user facing lesson groups', () => {
    let wrapper = shallow(
      <UnitCard
        {...defaultProps}
        lessonGroups={[defaultProps.lessonGroups[0]]}
      />
    );
    expect(wrapper.find('Connect(LessonGroupCard)')).toHaveLength(1);
    expect(wrapper.find('button')).toHaveLength(2);
    expect(wrapper.find('button').at(0).text()).toContain('Add Lesson Group');
    expect(wrapper.find('button').at(1).text()).toContain(
      'Disable Lesson Groups'
    );
  });

  it('displays UnitCard correctly when non user facing lesson group', () => {
    let wrapper = shallow(
      <UnitCard {...defaultProps} lessonGroups={[nonUserFacingGroup]} />
    );
    expect(wrapper.find('Connect(LessonGroupCard)')).toHaveLength(1);
    expect(wrapper.find('button')).toHaveLength(1);
    expect(wrapper.find('button').text()).toContain('Enable Lesson Groups');
  });

  it('add new lesson group', () => {
    const prompt = jest
      .spyOn(window, 'prompt')
      .mockClear()
      .mockImplementation();
    prompt.mockReturnValue('Lesson Group Name');

    let wrapper = shallow(<UnitCard {...defaultProps} />);

    const button = wrapper.find('button');
    expect(button.text()).toContain('Add Lesson Group');
    button.simulate('mouseDown');

    expect(addGroup).toHaveBeenCalledTimes(1);
    window.prompt.mockRestore();
  });

  it('enable lesson groups', () => {
    const prompt = jest
      .spyOn(window, 'prompt')
      .mockClear()
      .mockImplementation();
    prompt.mockReturnValue('Lesson Group Name');

    let wrapper = shallow(
      <UnitCard {...defaultProps} lessonGroups={[nonUserFacingGroup]} />
    );
    const button = wrapper.find('button');
    expect(button.text()).toContain('Enable Lesson Groups');
    button.simulate('mouseDown');

    expect(convertGroupToUserFacing).toHaveBeenCalledTimes(1);
    window.prompt.mockRestore();
  });

  it('disable lesson groups', () => {
    let wrapper = shallow(
      <UnitCard
        {...defaultProps}
        lessonGroups={[defaultProps.lessonGroups[0]]}
      />
    );
    const button = wrapper.find('button').at(1);
    expect(button.text()).toContain('Disable Lesson Groups');
    button.simulate('mouseDown');

    expect(convertGroupToNonUserFacing).toHaveBeenCalledTimes(1);
  });
});

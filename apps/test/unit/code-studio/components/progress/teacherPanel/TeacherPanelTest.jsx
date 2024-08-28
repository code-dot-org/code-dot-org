import {shallow, mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import SelectedStudentInfo from '@cdo/apps/code-studio/components/progress/teacherPanel/SelectedStudentInfo';
import StudentTable from '@cdo/apps/code-studio/components/progress/teacherPanel/StudentTable';
import {UnconnectedTeacherPanel as TeacherPanel} from '@cdo/apps/code-studio/components/progress/teacherPanel/TeacherPanel';
import * as teacherPanelData from '@cdo/apps/code-studio/components/progress/teacherPanel/teacherPanelData';
import ViewAsToggle from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import * as utils from '@cdo/apps/code-studio/utils';
import viewAs, {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import {pageTypes} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

const students = [
  {id: 1, name: 'Student 1'},
  {id: 2, name: 'Student 2'},
];

const DEFAULT_PROPS = {
  unitName: 'A unit',
  pageType: pageTypes.level,
  viewAs: ViewType.Participant,
  hasSections: false,
  sectionsAreLoaded: false,
  selectedSection: null,
  unitHasLockableLessons: false,
  unlockedLessonNames: [],
  students: null,
  levelsWithProgress: [],
  loadLevelsWithProgress: () => {},
  teacherId: 5,
  exampleSolutions: [],
  selectUser: () => {},
  setViewAsUserId: () => {},
  setStudentsForCurrentSection: () => {},
  setSections: () => {},
  setSectionLockStatus: () => {},
  selectSection: () => {},
  setViewType: () => {},
  isCurrentLevelLab2: false,
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<TeacherPanel {...props} />);
};

const setUpWithMount = async overrideProps => {
  const store = createStore(combineReducers({viewAs, currentUser}), {
    viewAs: ViewType.Instructor,
  });

  const props = {...DEFAULT_PROPS, ...overrideProps};
  return await mount(
    <Provider store={store}>
      <TeacherPanel {...props} />
    </Provider>
  );
};

fetch.mockResponse(JSON.stringify({}));

describe('TeacherPanel', () => {
  const teacherSections = [{id: 1, name: 'CSF section'}];
  const sectionLockStatus = {
    1: {
      section_id: 1,
      section_name: 'CSF section',
      lessons: [],
    },
  };

  let teacherPanelDataStub;

  beforeEach(() => {
    teacherPanelDataStub = jest
      .spyOn(teacherPanelData, 'queryLockStatus')
      .mockClear()
      .mockReturnValue(
        Promise.resolve({
          teacherSections,
          sectionLockStatus,
        })
      );
  });

  afterEach(() => {
    teacherPanelDataStub.mockRestore();
  });

  describe('on unit page', () => {
    it('initial view as participant has teacher panel header and view toggle', () => {
      const wrapper = setUp({viewAs: ViewType.Participant});
      expect(wrapper.contains(i18n.teacherPanel())).toBe(true);
      expect(wrapper.find(ViewAsToggle)).toHaveLength(1);
    });

    it('initial view as instructor has teacher panel header and view toggle', () => {
      const wrapper = setUp({viewAs: ViewType.Instructor});
      expect(wrapper.contains(i18n.teacherPanel())).toBe(true);
      expect(wrapper.find(ViewAsToggle)).toHaveLength(1);
    });
  });

  it('shows loading message when sections are not loaded', () => {
    const wrapper = setUp({sectionsAreLoaded: false});
    expect(wrapper.contains(i18n.loading())).toBe(true);
  });

  it('hides loading message when sections are loaded', () => {
    const wrapper = setUp({sectionsAreLoaded: true});
    expect(wrapper.contains(i18n.loading())).toBe(false);
  });

  it('shows SectionSelector if hasSections and sectionsAreLoaded', () => {
    const wrapper = setUp({sectionsAreLoaded: true, hasSections: true});
    expect(wrapper.find(SectionSelector)).toHaveLength(1);
  });

  it('hides SectionSelector if hasSections is false', () => {
    const wrapper = setUp({hasSections: false});
    expect(wrapper.find(SectionSelector)).toHaveLength(0);
  });

  it('hides SectionSelector if sectionsAreLoaded is false', () => {
    const wrapper = setUp({sectionsAreLoaded: false});
    expect(wrapper.find(SectionSelector)).toHaveLength(0);
  });

  it('shows link to teacher dashboard for section if sections are loaded and there is a selected section', () => {
    const wrapper = setUp({
      selectedSection: {id: 1, name: 'CSD'},
      sectionsAreLoaded: true,
      hasSections: true,
    });

    expect(wrapper.contains(i18n.teacherDashboard())).toBe(true);
  });

  it('shows section selection instructions if viewing as a instructor, and has sections and lockable lessons', () => {
    const wrapper = setUp({
      viewAs: ViewType.Instructor,
      unitHasLockableLessons: true,
      hasSections: true,
    });
    expect(wrapper.contains(i18n.selectSectionInstructions())).toBe(true);
  });

  it('adds a warning if there are also unlocked lessons', () => {
    const wrapper = setUp({
      viewAs: ViewType.Instructor,
      unitHasLockableLessons: true,
      hasSections: true,
      unlockedLessonNames: ['lesson1', 'lesson2'],
    });

    expect(wrapper.contains(i18n.selectSectionInstructions())).toBe(true);
    expect(wrapper.contains(i18n.dontForget())).toBe(true);
    expect(wrapper.contains(i18n.lockFollowing())).toBe(true);
    expect(wrapper.contains('lesson1')).toBe(true);
  });

  it('loads initial data and calls get/set students for section', async () => {
    jest
      .spyOn(teacherPanelData, 'getStudentsForSection')
      .mockClear()
      .mockReturnValue(
        Promise.resolve({
          id: 55,
          students: [],
        })
      );

    const setStudentsForCurrentSectionStub = jest.fn();
    const overrideProps = {
      viewAs: ViewType.Instructor,
      pageType: pageTypes.scriptOverview,
      setStudentsForCurrentSection: setStudentsForCurrentSectionStub,
    };

    await setUpWithMount(overrideProps);

    expect(setStudentsForCurrentSectionStub).toHaveBeenCalledWith(55, []);

    teacherPanelData.getStudentsForSection.mockRestore();
  });

  it('calls setViewType default to Instructor', async () => {
    const setViewTypeStub = jest.fn();
    const overrideProps = {
      pageType: pageTypes.scriptOverview,
      setViewType: setViewTypeStub,
    };

    await setUpWithMount(overrideProps);

    expect(setViewTypeStub).toHaveBeenCalledWith(ViewType.Instructor);
  });

  it('loads initial data and calls get/set lock status', async () => {
    const setSectionsStub = jest.fn();
    const setSectionLockStatusStub = jest.fn();
    const overrideProps = {
      viewAs: ViewType.Instructor,
      pageType: pageTypes.level,
      setSections: setSectionsStub,
      setSectionLockStatus: setSectionLockStatusStub,
    };
    await setUpWithMount(overrideProps);

    expect(setSectionsStub).toHaveBeenCalledWith(teacherSections);
    expect(setSectionLockStatusStub).toHaveBeenCalledWith(sectionLockStatus);

    teacherPanelData.queryLockStatus.mockRestore();
  });

  describe('StudentTable', () => {
    it('displays StudentTable for instructor with students', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
      });
      expect(wrapper.find(StudentTable)).toHaveLength(1);
    });

    it('does not display StudentTable for instructor with no students', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: [],
      });
      expect(wrapper.find(StudentTable)).toHaveLength(0);
    });

    it('does not display StudentTable for view page as participant', () => {
      const wrapper = setUp({
        viewAs: ViewType.Participant,
        students: students,
      });
      expect(wrapper.find(StudentTable)).toHaveLength(0);
    });

    it('calls selectUser when user is clicked with isAsync true when on overview page', () => {
      const store = createStore(combineReducers({viewAs, currentUser}), {
        viewAs: ViewType.Instructor,
      });

      const selectUserStub = jest.fn();
      const overrideProps = {
        selectUser: selectUserStub,
        viewAs: ViewType.Instructor,
        students: students,
        pageType: pageTypes.scriptOverview,
      };
      const props = {...DEFAULT_PROPS, ...overrideProps};

      const wrapper = mount(
        <Provider store={store}>
          <TeacherPanel {...props} />
        </Provider>
      );

      const secondStudentInTable = wrapper.find('tr').at(1);
      secondStudentInTable.simulate('click');

      expect(selectUserStub).toHaveBeenCalledWith(1, true);
    });

    it('calls selectUser when user is clicked with isAsync false when on level page', () => {
      const store = createStore(combineReducers({viewAs, currentUser}), {
        viewAs: ViewType.Instructor,
      });

      const selectUserStub = jest.fn();
      const overrideProps = {
        selectUser: selectUserStub,
        viewAs: ViewType.Instructor,
        students: students,
        pageType: pageTypes.level,
      };
      const props = {...DEFAULT_PROPS, ...overrideProps};
      const wrapper = mount(
        <Provider store={store}>
          <TeacherPanel {...props} />
        </Provider>
      );

      const secondStudentInTable = wrapper.find('tr').at(1);
      secondStudentInTable.simulate('click');

      expect(selectUserStub).toHaveBeenCalledWith(1, false);
    });
  });

  describe('SelectedStudentInfo', () => {
    it('on unit does not display SelectedStudentInfo', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
        pageType: pageTypes.scriptOverview,
      });

      expect(wrapper.find(SelectedStudentInfo)).toHaveLength(0);
    });

    it('on level displays SelectedStudentInfo when students have loaded, passes expected props', () => {
      jest
        .spyOn(utils, 'queryParams')
        .mockClear()
        .mockImplementation((...args) => {
          if (args[0] === 'user_id') {
            return '1';
          }
        });

      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
        teacherId: 5,
      });

      const selectedStudentComponent = wrapper.find(SelectedStudentInfo);
      expect(selectedStudentComponent).toHaveLength(1);
      expect(selectedStudentComponent.props().teacherId).toBe(5);
      expect(selectedStudentComponent.props().selectedUserId).toBe(1);

      utils.queryParams.mockRestore();
    });
  });

  describe('Example Solutions', () => {
    it('does not display example solutions if the viewType is participant', () => {
      const wrapper = setUp({
        viewAs: ViewType.Participant,
        exampleSolutions: [
          'https://studio.code.org/projects/applab/8cik_q8RCK57-Zv4Xeot_Q/view',
        ],
      });
      expect(wrapper.find('Button')).toHaveLength(0);
    });

    it('displays example solution for level with one example solution', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
        exampleSolutions: [
          'https://studio.code.org/projects/applab/8cik_q8RCK57-Zv4Xeot_Q/view',
        ],
      });

      expect(wrapper.find('Button')).toHaveLength(1);
    });

    it('does not display example solution for level with no example solution', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
        exampleSolutions: null,
      });

      expect(wrapper.find('Button')).toHaveLength(0);
    });
  });
});

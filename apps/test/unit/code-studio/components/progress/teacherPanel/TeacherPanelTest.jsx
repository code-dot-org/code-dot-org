import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../../../util/reconfiguredChai';
import {UnconnectedTeacherPanel as TeacherPanel} from '@cdo/apps/code-studio/components/progress/teacherPanel/TeacherPanel';
import viewAs, {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import ViewAsToggle from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import i18n from '@cdo/locale';
import StudentTable from '@cdo/apps/code-studio/components/progress/teacherPanel/StudentTable';
import SelectedStudentInfo from '@cdo/apps/code-studio/components/progress/teacherPanel/SelectedStudentInfo';
import {pageTypes} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import sinon from 'sinon';
import * as utils from '@cdo/apps/code-studio/utils';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import * as teacherPanelData from '@cdo/apps/code-studio/components/progress/teacherPanel/teacherPanelData';

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
  setStudentsForCurrentSection: () => {},
  setSections: () => {},
  setSectionLockStatus: () => {},
  selectSection: () => {},
  setViewType: () => {},
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<TeacherPanel {...props} />);
};

const setUpWithMount = async overrideProps => {
  const store = createStore(combineReducers({viewAs, currentUser}), {
    viewAs: ViewType.Instructor,
    currentUser: {},
  });

  const props = {...DEFAULT_PROPS, ...overrideProps};
  return await mount(
    <Provider store={store}>
      <TeacherPanel {...props} />
    </Provider>
  );
};

describe('TeacherPanel', () => {
  describe('on unit page', () => {
    it('initial view as participant has teacher panel header and view toggle', () => {
      const wrapper = setUp({viewAs: ViewType.Participant});
      expect(wrapper.contains(i18n.teacherPanel())).to.be.true;
      expect(wrapper.find(ViewAsToggle)).to.have.length(1);
    });

    it('initial view as instructor has teacher panel header and view toggle', () => {
      const wrapper = setUp({viewAs: ViewType.Instructor});
      expect(wrapper.contains(i18n.teacherPanel())).to.be.true;
      expect(wrapper.find(ViewAsToggle)).to.have.length(1);
    });
  });

  it('shows loading message when sections are not loaded', () => {
    const wrapper = setUp({sectionsAreLoaded: false});
    expect(wrapper.contains(i18n.loading())).to.be.true;
  });

  it('hides loading message when sections are loaded', () => {
    const wrapper = setUp({sectionsAreLoaded: true});
    expect(wrapper.contains(i18n.loading())).to.be.false;
  });

  it('shows SectionSelector if hasSections and sectionsAreLoaded', () => {
    const wrapper = setUp({sectionsAreLoaded: true, hasSections: true});
    expect(wrapper.find(SectionSelector)).to.have.length(1);
  });

  it('hides SectionSelector if hasSections is false', () => {
    const wrapper = setUp({hasSections: false});
    expect(wrapper.find(SectionSelector)).to.have.length(0);
  });

  it('hides SectionSelector if sectionsAreLoaded is false', () => {
    const wrapper = setUp({sectionsAreLoaded: false});
    expect(wrapper.find(SectionSelector)).to.have.length(0);
  });

  it('shows link to teacher dashboard for section if sections are loaded and there is a selected section', () => {
    const wrapper = setUp({
      selectedSection: {id: 1, name: 'CSD'},
      sectionsAreLoaded: true,
      hasSections: true,
    });

    expect(wrapper.contains(i18n.teacherDashboard())).to.be.true;
  });

  it('shows section selection instructions if viewing as a instructor, and has sections and lockable lessons', () => {
    const wrapper = setUp({
      viewAs: ViewType.Instructor,
      unitHasLockableLessons: true,
      hasSections: true,
    });
    expect(wrapper.contains(i18n.selectSectionInstructions())).to.be.true;
  });

  it('adds a warning if there are also unlocked lessons', () => {
    const wrapper = setUp({
      viewAs: ViewType.Instructor,
      unitHasLockableLessons: true,
      hasSections: true,
      unlockedLessonNames: ['lesson1', 'lesson2'],
    });

    expect(wrapper.contains(i18n.selectSectionInstructions())).to.be.true;
    expect(wrapper.contains(i18n.dontForget())).to.be.true;
    expect(wrapper.contains(i18n.lockFollowing())).to.be.true;
    expect(wrapper.contains('lesson1')).to.be.true;
  });

  it('loads initial data and calls get/set students for section', async () => {
    sinon.stub(teacherPanelData, 'getStudentsForSection').returns(
      Promise.resolve({
        id: 55,
        students: [],
      })
    );

    const setStudentsForCurrentSectionStub = sinon.stub();
    const overrideProps = {
      viewAs: ViewType.Instructor,
      pageType: pageTypes.scriptOverview,
      setStudentsForCurrentSection: setStudentsForCurrentSectionStub,
    };

    await setUpWithMount(overrideProps);

    expect(setStudentsForCurrentSectionStub).to.have.been.calledWith(55, []);

    teacherPanelData.getStudentsForSection.restore();
  });

  it('calls setViewType default to Instructor', async () => {
    const setViewTypeStub = sinon.stub();
    const overrideProps = {
      pageType: pageTypes.scriptOverview,
      setViewType: setViewTypeStub,
    };

    await setUpWithMount(overrideProps);

    expect(setViewTypeStub).to.have.been.calledWith(ViewType.Instructor);
  });

  it('loads initial data and calls get/set lock status', async () => {
    const teacherSections = [{id: 1, name: 'CSF section'}];
    const sectionLockStatus = {
      1: {
        section_id: 1,
        section_name: 'CSF section',
        lessons: [],
      },
    };

    sinon.stub(teacherPanelData, 'queryLockStatus').returns(
      Promise.resolve({
        teacherSections,
        sectionLockStatus,
      })
    );

    const setSectionsStub = sinon.stub();
    const setSectionLockStatusStub = sinon.stub();
    const overrideProps = {
      viewAs: ViewType.Instructor,
      pageType: pageTypes.level,
      setSections: setSectionsStub,
      setSectionLockStatus: setSectionLockStatusStub,
    };
    await setUpWithMount(overrideProps);

    expect(setSectionsStub).to.have.been.calledWith(teacherSections);
    expect(setSectionLockStatusStub).to.have.been.calledWith(sectionLockStatus);

    teacherPanelData.queryLockStatus.restore();
  });

  describe('StudentTable', () => {
    it('displays StudentTable for instructor with students', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
      });
      expect(wrapper.find(StudentTable)).to.have.length(1);
    });

    it('does not display StudentTable for instructor with no students', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: [],
      });
      expect(wrapper.find(StudentTable)).to.have.length(0);
    });

    it('does not display StudentTable for view page as participant', () => {
      const wrapper = setUp({
        viewAs: ViewType.Participant,
        students: students,
      });
      expect(wrapper.find(StudentTable)).to.have.length(0);
    });

    it('calls selectUser when user is clicked with isAsync true when on overview page', () => {
      const store = createStore(combineReducers({viewAs}), {
        viewAs: ViewType.Instructor,
      });

      const selectUserStub = sinon.stub();
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

      expect(selectUserStub).to.have.been.calledWith(1, true);
    });

    it('calls selectUser when user is clicked with isAsync false when on level page', () => {
      const store = createStore(combineReducers({viewAs}), {
        viewAs: ViewType.Instructor,
      });

      const selectUserStub = sinon.stub();
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

      expect(selectUserStub).to.have.been.calledWith(1, false);
    });
  });

  describe('SelectedStudentInfo', () => {
    it('on unit does not display SelectedStudentInfo', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
        pageType: pageTypes.scriptOverview,
      });

      expect(wrapper.find(SelectedStudentInfo)).to.have.length(0);
    });

    it('on level displays SelectedStudentInfo when students have loaded, passes expected props', () => {
      sinon.stub(utils, 'queryParams').withArgs('user_id').returns('1');

      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
        teacherId: 5,
      });

      const selectedStudentComponent = wrapper.find(SelectedStudentInfo);
      expect(selectedStudentComponent).to.have.length(1);
      expect(selectedStudentComponent.props().teacherId).to.equal(5);
      expect(selectedStudentComponent.props().selectedUserId).to.equal(1);

      utils.queryParams.restore();
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
      expect(wrapper.find('Button')).to.have.length(0);
    });

    it('displays example solution for level with one example solution', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
        exampleSolutions: [
          'https://studio.code.org/projects/applab/8cik_q8RCK57-Zv4Xeot_Q/view',
        ],
      });

      expect(wrapper.find('Button')).to.have.length(1);
    });

    it('does not display example solution for level with no example solution', () => {
      const wrapper = setUp({
        viewAs: ViewType.Instructor,
        students: students,
        exampleSolutions: null,
      });

      expect(wrapper.find('Button')).to.have.length(0);
    });
  });
});

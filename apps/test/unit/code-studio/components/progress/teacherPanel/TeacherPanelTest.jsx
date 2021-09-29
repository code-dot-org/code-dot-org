import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../../util/reconfiguredChai';
import {UnconnectedTeacherPanel as TeacherPanel} from '@cdo/apps/code-studio/components/progress/teacherPanel/TeacherPanel';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import ViewAsToggle from '@cdo/apps/code-studio/components/progress/ViewAsToggle';
import i18n from '@cdo/locale';
import StudentTable from '@cdo/apps/code-studio/components/progress/teacherPanel/StudentTable';
import SelectedStudentInfo from '@cdo/apps/code-studio/components/progress/teacherPanel/SelectedStudentInfo';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {pageTypes} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import $ from 'jquery';
import sinon from 'sinon';

const students = [{id: 1, name: 'Student 1'}, {id: 2, name: 'Student 2'}];

const DEFAULT_PROPS = {
  onSelectUser: () => {},
  getSelectedUserId: () => {},
  sectionData: null,
  unitName: 'A unit',
  pageType: pageTypes.level,
  viewAs: ViewType.Student,
  hasSections: false,
  sectionsAreLoaded: false,
  selectedSection: null,
  unitHasLockableLessons: false,
  unlockedLessonNames: [],
  students: null,
  levelsWithProgress: [],
  loadLevelsWithProgress: () => {}
};

const sectionScriptLevelData = [
  {
    id: '11',
    userId: 1,
    status: LevelStatus.not_tried,
    passed: false,
    levelNumber: 1,
    kind: 'puzzle'
  }
];

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<TeacherPanel {...props} />);
};

describe('TeacherPanel', () => {
  beforeEach(() => {
    sinon.stub($, 'ajax').returns({
      done: successCallback => {
        successCallback(sectionScriptLevelData);
        return {fail: () => {}};
      }
    });
  });

  afterEach(() => {
    $.ajax.restore();
  });

  describe('on unit page', () => {
    it('initial view as student has teacher panel header and view toggle', () => {
      const wrapper = setUp({viewAs: ViewType.Student});
      expect(wrapper.contains(i18n.teacherPanel())).to.be.true;
      expect(wrapper.find(ViewAsToggle)).to.have.length(1);
    });

    it('initial view as teacher has teacher panel header and view toggle', () => {
      const wrapper = setUp({viewAs: ViewType.Teacher});
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
      hasSections: true
    });

    expect(wrapper.contains(i18n.teacherDashboard())).to.be.true;
  });

  it('shows section selection instructions if viewing as a teacher, and has sections and lockable lessons', () => {
    const wrapper = setUp({
      viewAs: ViewType.Teacher,
      unitHasLockableLessons: true,
      hasSections: true
    });
    expect(wrapper.contains(i18n.selectSectionInstructions())).to.be.true;
  });

  it('adds a warning if there are also unlocked lessons', () => {
    const wrapper = setUp({
      viewAs: ViewType.Teacher,
      unitHasLockableLessons: true,
      hasSections: true,
      unlockedLessonNames: ['lesson1', 'lesson2']
    });

    expect(wrapper.contains(i18n.selectSectionInstructions())).to.be.true;
    expect(wrapper.contains(i18n.dontForget())).to.be.true;
    expect(wrapper.contains(i18n.lockFollowing())).to.be.true;
    expect(wrapper.contains('lesson1')).to.be.true;
  });

  describe('StudentTable', () => {
    it('displays StudentTable for teacher with students', () => {
      const wrapper = setUp({
        viewAs: ViewType.Teacher,
        students: students
      });
      expect(wrapper.find(StudentTable)).to.have.length(1);
    });

    it('does not display StudentTable for teacher with no students', () => {
      const wrapper = setUp({
        viewAs: ViewType.Teacher,
        students: []
      });
      expect(wrapper.find(StudentTable)).to.have.length(0);
    });

    it('does not display StudentTable for view page as student', () => {
      const wrapper = setUp({
        viewAs: ViewType.Student,
        students: students
      });
      expect(wrapper.find(StudentTable)).to.have.length(0);
    });
  });

  describe('SelectedStudentInfo', () => {
    it('on unit does not display SelectedStudentInfo', () => {
      const wrapper = setUp({
        viewAs: ViewType.Teacher,
        students: students,
        getSelectedUserId: () => 0
      });

      expect(wrapper.find(SelectedStudentInfo)).to.have.length(0);
    });

    it('on level displays SelectedStudentInfo when student selected', () => {
      const wrapper = setUp({
        viewAs: ViewType.Teacher,
        students: students,
        getSelectedUserId: () => 1,
        sectionData: {
          section: {
            students: students
          }
        }
      });

      expect(wrapper.find(SelectedStudentInfo)).to.have.length(1);
    });
  });

  describe('Example Solutions', () => {
    describe('on unit', () => {
      it('does not display example solutions', () => {
        const wrapper = setUp({
          viewAs: ViewType.Teacher
        });
        expect(wrapper.find('Button')).to.have.length(0);
      });
    });

    describe('on level', () => {
      it('displays example solution for level with one example solution', () => {
        const wrapper = setUp({
          viewAs: ViewType.Teacher,
          students: students,
          sectionData: {
            level_examples: [
              'https://studio.code.org/projects/applab/8cik_q8RCK57-Zv4Xeot_Q/view'
            ],
            section: {
              students: students
            }
          }
        });

        expect(wrapper.find('Button')).to.have.length(1);
      });

      it('does not display example solution for level with no example solution', () => {
        const wrapper = setUp({
          viewAs: ViewType.Teacher,
          students: students,
          sectionData: {
            level_examples: null,
            section: {
              students: students
            }
          }
        });

        expect(wrapper.find('Button')).to.have.length(0);
      });
    });
  });
});

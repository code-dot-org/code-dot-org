import { assert } from '../../../util/configuredChai';
import manageStudents, {
  setLoginType,
  setSectionId,
  setStudents,
  convertStudentDataToArray,
  startEditingStudent,
  cancelEditingStudent,
  removeStudent,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

const studentEmailData = {
  1: {
      id: 1,
      name: 'StudentNameA',
      username: 'student1',
      userType: 'student',
      age: 17,
      gender: 'f',
      loginType: 'email',
      secretWords: 'wizard',
      secretPictureName: 'wizard',
      secretPicturePath: '/wizard.jpg',
      sectionId: 53,
    },
  2: {
      id: 2,
      name: 'StudentNameC',
      username: 'student2',
      userType: 'student',
      age: 14,
      gender: 'm',
      loginType: 'email',
      secretWords: 'wizard',
      secretPictureName: 'wizard',
      secretPicturePath: '/wizard.jpg',
      sectionId: 53,
    },
  3: {
      id: 3,
      name: 'StudentNameD',
      username: 'student3',
      userType: 'student',
      age: 9,
      gender: 'm',
      loginType: 'email',
      secretWords: 'wizard',
      secretPictureName: 'wizard',
      secretPicturePath: '/wizard.jpg',
      sectionId: 53,
    },
};

describe('manageStudentsRedux', () => {
  const initialState = manageStudents(undefined, {});

  describe('setLoginType', () => {
    it('sets login type for the section in view', () => {
      const action = setLoginType('picture');
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.loginType, 'picture');
    });
  });

  describe('setSectionId', () => {
    it('sets section id for the section in view', () => {
      const action = setSectionId('123abc');
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.sectionId, '123abc');
    });
  });

  describe('setStudents', () => {
    it('sets student data for the section in view', () => {
      const action = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.studentData, studentEmailData);
    });
  });

  describe('convertStudentDataToArray', () => {
    it('converts studentData to an array of student objects', () => {
      const studentDataArray = convertStudentDataToArray(studentEmailData);
      assert.equal(studentDataArray.length, 3);
      assert.equal(studentDataArray[0], studentEmailData[1]);
      assert.equal(studentDataArray[1], studentEmailData[2]);
      assert.equal(studentDataArray[2], studentEmailData[3]);
    });
  });

  describe('startEditingStudent', () => {
    it('sets student isEditing to true', () => {
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = startEditingStudent(1);
      const finalState = manageStudents(nextState, startEditingStudentAction);
      assert.deepEqual(finalState.studentData[1].isEditing, true);
    });
  });

  describe('cancelEditingStudent', () => {
    it('sets student isEditing to false', () => {
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = startEditingStudent(1);
      const stateAfterEditing = manageStudents(nextState, startEditingStudentAction);
      const cancelEditingStudentAction = cancelEditingStudent(1);
      const finalState = manageStudents(stateAfterEditing, cancelEditingStudentAction);
      assert.deepEqual(finalState.studentData[1].isEditing, false);
    });
  });

  describe('removeStudent', () => {
    it('deletes a student with a given id', () => {
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const removeStudentAction = removeStudent(1);
      const stateAfterDeleting = manageStudents(nextState, removeStudentAction);
      assert.equal(stateAfterDeleting.studentData[1], undefined);
      assert.deepEqual(stateAfterDeleting.studentData[2], studentEmailData[2]);
      assert.deepEqual(stateAfterDeleting.studentData[3], studentEmailData[3]);
    });
  });
});

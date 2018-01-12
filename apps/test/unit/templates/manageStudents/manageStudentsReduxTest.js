import { assert } from '../../../util/configuredChai';
import manageStudents, {
  setLoginType,
  setSectionId,
  setStudents,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

const studentEmailData = [
  {
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
  {
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
  {
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
  }
];

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
});

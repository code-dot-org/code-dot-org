import { assert } from '../../../util/configuredChai';
import manageStudents, {
  setLoginType,
  setSectionId,
  setStudents,
  convertStudentDataToArray,
  startEditingStudent,
  cancelEditingStudent,
  removeStudent,
  setSecretImage,
  setSecretWords,
  editStudent,
  editAll,
  startSavingStudent,
  saveStudentSuccess,
  addStudentsSuccess,
  addStudentsFailure,
  AddStatus,
  addMultipleRows,
  RowType,
  toggleSharingColumn,
  updateAllShareSetting,
  setSharingDefault,
  TransferStatus,
  TransferType,
  updateStudentTransfer,
  blankStudentTransfer,
  blankStudentTransferStatus,
  cancelStudentTransfer,
  transferStudentsSuccess,
  transferStudentsFailure
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
      sharingDisabled: true,
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
      sharingDisabled: true,
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
      sharingDisabled: true,
    },
};

const studentPictureData = {
  1: {
      id: 1,
      name: 'StudentNameA',
      username: 'student1',
      userType: 'student',
      age: 17,
      gender: 'f',
      loginType: 'picture',
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
      loginType: 'picture',
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
      loginType: 'picture',
      secretWords: 'wizard',
      secretPictureName: 'wizard',
      secretPicturePath: '/wizard.jpg',
      sectionId: 53,
    },
};

const expectedBlankRow = {
  id: 0,
  name: '',
  age: '',
  gender: '',
  username: '',
  loginType: '',
  sharingDisabled: true,
  isEditing: true,
  rowType: RowType.ADD,
};

describe('manageStudentsRedux', () => {
  const initialState = manageStudents(undefined, {});

  describe('setSharingDefault', () => {
    it('sets sharingDisabled to false if the student age is set to 13 or older', () => {
      // Initial state with blank row
      const initialState = {
        loginType: 'picture',
        studentData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        editingData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        sectionId: 10,
      };
      const startEditingStudentAction = startEditingStudent(0);
      const editingState = manageStudents(initialState, startEditingStudentAction);
      assert.deepEqual(editingState.editingData[0].age, '');
      assert.deepEqual(editingState.editingData[0].sharingDisabled, true);
      const editStudentAgeAction = editStudent(0, {age: 13});
      const stateWithAge = manageStudents(editingState, editStudentAgeAction);
      assert.deepEqual(stateWithAge.editingData[0].age, 13);
      const setSharingDefaultAction = setSharingDefault(0);
      const stateWithDefaultShareSetting = manageStudents(stateWithAge, setSharingDefaultAction);
      assert.deepEqual(stateWithDefaultShareSetting.editingData[0].sharingDisabled, false);
    });

    it('sharingDisabled remains true if the student age is set to under 13', () => {
      // Initial state with blank row
      const initialState = {
        loginType: 'picture',
        studentData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        editingData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        sectionId: 10,
      };
      const startEditingStudentAction = startEditingStudent(0);
      const editingState = manageStudents(initialState, startEditingStudentAction);
      assert.deepEqual(editingState.editingData[0].age, '');
      assert.deepEqual(editingState.editingData[0].sharingDisabled, true);
      const editStudentAgeAction = editStudent(0, {age: 12});
      const stateWithAge = manageStudents(editingState, editStudentAgeAction);
      assert.deepEqual(stateWithAge.editingData[0].age, 12);
      const setSharingDefaultAction = setSharingDefault(0);
      const stateWithDefaultShareSetting = manageStudents(stateWithAge, setSharingDefaultAction);
      assert.deepEqual(stateWithDefaultShareSetting.editingData[0].sharingDisabled, true);
    });
  });

  describe('updateAllShareSetting', () => {
    it('enable all sets sharingDisabled to false', () => {
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = editAll();
      const nextNextState = manageStudents(nextState, startEditingStudentAction);
      const enableAllShareSettingsStudentAction = updateAllShareSetting(false);
      const finalState = manageStudents(nextNextState, enableAllShareSettingsStudentAction);
      assert.deepEqual(finalState.editingData[1].sharingDisabled, false);
      assert.deepEqual(finalState.editingData[2].sharingDisabled, false);
      assert.deepEqual(finalState.editingData[3].sharingDisabled, false);
    });

    it('disable all sets sharingDisabled to true', () => {
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = editAll();
      const nextNextState = manageStudents(nextState, startEditingStudentAction);
      const disableAllShareSettingsStudentAction = updateAllShareSetting(true);
      const finalState = manageStudents(nextNextState, disableAllShareSettingsStudentAction);
      assert.deepEqual(finalState.editingData[1].sharingDisabled, true);
      assert.deepEqual(finalState.editingData[2].sharingDisabled, true);
      assert.deepEqual(finalState.editingData[3].sharingDisabled, true);
    });
  });

  describe('toggleSharingColumn', () => {
    it('toggle showSharingColumn state', () => {
      const action = toggleSharingColumn();
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.showSharingColumn,
        !initialState.showSharingColumn);
    });
  });

  describe('updateStudentTransfer', () => {
    it('sets transferData from action', () => {
      const transferData = {
        studentIds: [0,1,3],
        sectionId: 2,
        otherTeacher: false,
        otherTeacherSection: '',
        copyStudents: false
      };
      const action = updateStudentTransfer(transferData);
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.transferData, transferData);
    });
  });

  describe('cancelStudentTransfer', () => {
    it('sets transferData to blank state', () => {
      const transferData = {
        studentIds: [0,1,3],
        sectionId: 2,
        otherTeacher: false,
        otherTeacherSection: '',
        copyStudents: false
      };
      const updateAction = updateStudentTransfer(transferData);
      const stateAfterUpdating = manageStudents(initialState, updateAction);
      assert.deepEqual(stateAfterUpdating.transferData, transferData);
      const cancelAction = cancelStudentTransfer();
      const stateAfterCancelling = manageStudents(stateAfterUpdating, cancelAction);
      assert.deepEqual(stateAfterCancelling.transferData, blankStudentTransfer);
    });

    it('sets transferStatus error to null', () => {
      const error = 'section does not exist';
      const failureAction = transferStudentsFailure(error);
      const stateAfterFailure = manageStudents(initialState, failureAction);
      assert.deepEqual(stateAfterFailure.transferStatus.error, error);
      const cancelAction = cancelStudentTransfer();
      const stateAfterCancelling = manageStudents(stateAfterFailure, cancelAction);
      assert.deepEqual(stateAfterCancelling.transferStatus.error, null);
    });
  });

  describe('transferStudentsSuccess', () => {
    it('sets transferStatus from action', () => {
      const transferStatus = {
        status: TransferStatus.SUCCESS,
        type: TransferType.MOVE_STUDENTS,
        error: null,
        numStudents: 3,
        sectionDisplay: 'ABCDEF'
      };

      const {type, numStudents, sectionDisplay} = transferStatus;
      const action = transferStudentsSuccess(type, numStudents, sectionDisplay);
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.transferStatus, transferStatus);
    });
  });

  describe('transferStudentsFailure', () => {
    it('sets transferStatus status and error from action', () => {
      const transferStatus = {
        ...blankStudentTransferStatus,
        status: TransferStatus.FAIL,
        error: 'student already exists in new section'
      };

      const action = transferStudentsFailure(transferStatus.error);
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.transferStatus, transferStatus);
    });
  });

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
      assert.deepEqual(nextState.studentData, {
        ...studentEmailData,
      });
    });

    it('sets student data and an empty row for picture section', () => {
      const startingState = {
        ...initialState,
        loginType: 'picture'
      };
      const action = setStudents(studentPictureData);
      const nextState = manageStudents(startingState, action);
      assert.deepEqual(nextState.studentData, {
        ...studentPictureData,
        [0]: {
          ...expectedBlankRow,
          loginType: 'picture',
        }
      });
    });

    it('overrides old section data', () => {
      const setStudents1 = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudents1);

      const newSectionData = {
        5: {
          id: 1,
          name: 'StudentName5',
          username: 'student5',
          userType: 'student',
          age: 14,
          gender: 'f',
          loginType: 'email',
          secretWords: 'wizard',
          secretPictureName: 'wizard',
          secretPicturePath: '/wizard.jpg',
          sectionId: 53,
        }
      };
      const setStudents2 = setStudents(newSectionData);
      const finalState = manageStudents(nextState, setStudents2);
      assert.deepEqual(finalState.studentData, {
        ...newSectionData,
      });
    });
  });

  describe('convertStudentDataToArray', () => {
    it('converts studentData to an array of student objects in reverse order', () => {
      const studentDataArray = convertStudentDataToArray(studentEmailData);
      assert.equal(studentDataArray.length, 3);
      assert.equal(studentDataArray[0], studentEmailData[3]);
      assert.equal(studentDataArray[1], studentEmailData[2]);
      assert.equal(studentDataArray[2], studentEmailData[1]);
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

    it('sets editingData to be studentData', () => {
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = startEditingStudent(1);
      const finalState = manageStudents(nextState, startEditingStudentAction);
      assert.deepEqual(finalState.editingData[1], studentEmailData[1]);
    });
  });

  describe('editAll', () => {
    it('sets students isEditing to true', () => {
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = editAll();
      const finalState = manageStudents(nextState, startEditingStudentAction);
      assert.deepEqual(finalState.studentData[1].isEditing, true);
      assert.deepEqual(finalState.studentData[2].isEditing, true);
      assert.deepEqual(finalState.studentData[3].isEditing, true);

      assert.deepEqual(finalState.editingData[1], studentEmailData[1]);
      assert.deepEqual(finalState.editingData[2], studentEmailData[2]);
      assert.deepEqual(finalState.editingData[3], studentEmailData[3]);
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
      assert.equal(stateAfterDeleting.editingData[1], undefined);
      assert.deepEqual(stateAfterDeleting.studentData[2], studentEmailData[2]);
      assert.deepEqual(stateAfterDeleting.studentData[3], studentEmailData[3]);
    });
  });

  describe('setSecretImage', () => {
    it('sets an image for a student given id', () => {
      const setStudentsAction = setStudents(studentPictureData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const setSecretImageAction = setSecretImage(1, '/cat.jpg');
      const stateAfterUpdating = manageStudents(nextState, setSecretImageAction);
      assert.equal(stateAfterUpdating.studentData[1].secretPicturePath, '/cat.jpg');
      assert.deepEqual(stateAfterUpdating.studentData[2].secretPicturePath, studentEmailData[2].secretPicturePath);
      assert.deepEqual(stateAfterUpdating.studentData[3].secretPicturePath, studentEmailData[3].secretPicturePath);
    });
  });

  describe('setSecretWords', () => {
    it('sets words for a student given id', () => {
      const setStudentsAction = setStudents(studentPictureData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const setSecretWordsAction = setSecretWords(1, 'cats');
      const stateAfterUpdating = manageStudents(nextState, setSecretWordsAction);
      assert.equal(stateAfterUpdating.studentData[1].secretWords, 'cats');
      assert.deepEqual(stateAfterUpdating.studentData[2].secretWords, studentEmailData[2].secretWords);
      assert.deepEqual(stateAfterUpdating.studentData[3].secretWords, studentEmailData[3].secretWords);
    });
  });

  describe('editStudent', () => {
    it('sets editingData to new updated values', () => {
      // Set up a student that is in the editing state.
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = startEditingStudent(1);
      const editingState = manageStudents(nextState, startEditingStudentAction);

      // Edit name, age, and gender and verify data is updated.
      const editStudentNameAction = editStudent(1, {name: "New name"});
      const stateWithName = manageStudents(editingState, editStudentNameAction);
      assert.deepEqual(stateWithName.editingData[1], {
        ...studentEmailData[1],
        name: "New name",
      });

      const editStudentAgeAction = editStudent(1, {age: 13});
      const stateWithAge = manageStudents(stateWithName, editStudentAgeAction);
      assert.deepEqual(stateWithAge.editingData[1], {
        ...studentEmailData[1],
        name: "New name",
        age: 13,
      });

      const editStudentGenderAction = editStudent(1, {gender: 'm'});
      const stateWithGender = manageStudents(stateWithAge, editStudentGenderAction);
      assert.deepEqual(stateWithGender.editingData[1], {
        ...studentEmailData[1],
        name: "New name",
        age: 13,
        gender: 'm',
      });

      const editStudentShareSettingAction = editStudent(1, {sharingDisabled: true});
      const stateWithShareSetting = manageStudents(stateWithGender, editStudentShareSettingAction);
      assert.deepEqual(stateWithShareSetting.editingData[1], {
        ...studentEmailData[1],
        name: "New name",
        age: 13,
        gender: 'm',
        sharingDisabled: true,
      });
    });
  });

  describe('saving edited data of a student', () => {
    it('startSavingStudent sets student to disabled saving mode', () => {
      // Start editing student
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = startEditingStudent(1);
      const editingState = manageStudents(nextState, startEditingStudentAction);

      // Start saving student
      const startSavingAction = startSavingStudent(1);
      const startedSavingState = manageStudents(editingState, startSavingAction);
      assert.equal(startedSavingState.studentData[1].isEditing, true);
      assert.equal(startedSavingState.studentData[1].isSaving, true);
      assert.equal(startedSavingState.editingData[1].isSaving, true);
    });

    it('saveStudentSuccess updates studentData and removes editingData', () => {
      // Edit and start saving a student
      const setStudentsAction = setStudents(studentEmailData);
      const nextState = manageStudents(initialState, setStudentsAction);
      const startEditingStudentAction = startEditingStudent(1);
      const editingState = manageStudents(nextState, startEditingStudentAction);
      const editStudentNameAction = editStudent(1, {name: "New name"});
      const editedState = manageStudents(editingState, editStudentNameAction);
      const startSavingAction = startSavingStudent(1);
      const startedSavingState = manageStudents(editedState, startSavingAction);

      // Save student success
      const saveStudentSuccessAction = saveStudentSuccess(1);
      const afterSaveState = manageStudents(startedSavingState, saveStudentSuccessAction);

      assert.equal(afterSaveState.editingData[1], null);
      assert.equal(afterSaveState.studentData[1].isEditing, false);
      assert.equal(afterSaveState.studentData[1].isSaving, false);
      assert.equal(afterSaveState.studentData[1].name, "New name");
    });
  });

  describe('addMultipleRows', () => {
    it('updates studentData and editingData', () => {
      const startingState = {
        ...initialState,
        studentData: {
          4: {
            id: 4,
            name: 'original student',
            isEditing: true,
          }
        },
        editingData: {
          4: {
            id: 4,
            name: 'original student',
            isEditing: true
          }
        },
      };
      const action = addMultipleRows({
        '-1': {id: -1, name: 'student -1', isEditing: true},
        '-2': {id: -2, name: 'student -2', isEditing: true}
      });
      const nextState = manageStudents(startingState, action);

      const expectedData = {
        '-1': {id: -1, name: 'student -1', isEditing: true},
        '-2': {id: -2, name: 'student -2', isEditing: true},
        '4': {id: 4, name: 'original student', isEditing: true}
      };
      assert.deepEqual(nextState.studentData, expectedData);
      assert.deepEqual(nextState.editingData, expectedData);
    });
  });

  describe('add student', () => {
    it('setLoginType creates an add row for word login types', () => {
      const action = setLoginType('word');
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.studentData[0], {...expectedBlankRow, loginType: 'word'});
      assert.deepEqual(nextState.editingData[0], {...expectedBlankRow, loginType: 'word'});
    });

    it('setLoginType creates an add row for picture login types', () => {
      const action = setLoginType('picture');
      const nextState = manageStudents(initialState, action);
      assert.deepEqual(nextState.studentData[0], {...expectedBlankRow, loginType: 'picture'});
      assert.deepEqual(nextState.editingData[0], {...expectedBlankRow, loginType: 'picture'});
    });

    it('addStudentsSuccess updates studentData, removes editingData, and adds new blank row', () => {
      // Initial state with blank row
      const initialState = {
        loginType: 'picture',
        studentData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        editingData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        sectionId: 10,
      };

      const studentDataToAdd = {
        id: 111,
        name: 'new student',
        age: 17,
        gender: 'f',
        secretPicturePath: '/wizard.jpg',
        loginType: 'picture',
        isEditing: false,
      };

      // Add student
      const addStudentSuccessAction = addStudentsSuccess(1, -10, {111: studentDataToAdd});
      const addedStudentState = manageStudents(initialState, addStudentSuccessAction);

      assert.deepEqual(addedStudentState.editingData[0], {
        ...expectedBlankRow,
        loginType: 'picture',
      });
      assert.deepEqual(addedStudentState.studentData[0], {
        ...expectedBlankRow,
        loginType: 'picture',
      });
      assert.deepEqual(addedStudentState.studentData[111], {
        ...studentDataToAdd,
      });
      assert.deepEqual(addedStudentState.addStatus, {status: AddStatus.SUCCESS, numStudents: 1});
    });

    it('addStudentsSuccess adds multiple students', () => {
      // Initial state with blank row
      const initialState = {
        loginType: 'picture',
        studentData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        editingData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        sectionId: 10,
      };

      const studentsDataToAdd = {
        111: {
          id: 111,
          name: 'new student a',
          age: 17,
          gender: 'f',
          secretPicturePath: '/wizard.jpg',
          loginType: 'picture',
          isEditing: false,
        },
        112: {
          id: 112,
          name: 'new student b',
          age: 11,
          gender: 'm',
          secretPicturePath: '/wizard.jpg',
          loginType: 'picture',
          isEditing: false,
        }};

      // Add student
      const addStudentSuccessAction = addStudentsSuccess(2, [-2, -3], studentsDataToAdd);
      const addedStudentState = manageStudents(initialState, addStudentSuccessAction);

      assert.deepEqual(addedStudentState.editingData[0], {
        ...expectedBlankRow,
        loginType: 'picture',
      });
      assert.deepEqual(addedStudentState.studentData[0], {
        ...expectedBlankRow,
        loginType: 'picture',
      });
      assert.deepEqual(addedStudentState.studentData[111], {
        ...studentsDataToAdd[111],
      });
      assert.deepEqual(addedStudentState.studentData[112], {
        ...studentsDataToAdd[112],
      });
      assert.deepEqual(addedStudentState.addStatus, {status: AddStatus.SUCCESS, numStudents: 2});
    });

    it('addStudentsFailure updates the addStatus, and sets saving to false for the student', () => {
      const initialState = {
        loginType: 'picture',
        studentData: {
          0: {
            ...expectedBlankRow,
            loginType: 'picture',
          }
        },
        editingData: {
          0: {
            ...expectedBlankRow,
            name: 'editing name',
            loginType: 'picture',
          }
        },
        sectionId: 10,
      };

      // Add student fails
      const addStudentFailureAction = addStudentsFailure(1, 'error info', [0]);
      const addedStudentState = manageStudents(initialState, addStudentFailureAction);

      assert.deepEqual(addedStudentState.editingData[0], {
        ...initialState.editingData[0],
        isSaving: false,
      });
      assert.deepEqual(addedStudentState.studentData[0], {
        ...initialState.studentData[0],
        isSaving: false,
      });
      assert.deepEqual(addedStudentState.addStatus, {status: AddStatus.FAIL, numStudents: 1});
    });

    it('addStudentsFailure handles multiple students', () => {
      const studentInfo = {
        0: {
          ...expectedBlankRow,
          loginType: 'picture',
        },
        1: {
          ...expectedBlankRow,
          id: 1,
          loginType: 'picture',
          name: 'new name'
        },
        2: {
          ...expectedBlankRow,
          id: 2,
          loginType: 'picture',
          name: 'new name',
        }
      };
      const initialState = {
        loginType: 'picture',
        studentData: {
          ...studentInfo
        },
        editingData: {
          ...studentInfo
        },
        sectionId: 10,
      };

      // Add student fails
      const addStudentFailureAction = addStudentsFailure(2, 'error info', [1, 2]);
      const addedStudentState = manageStudents(initialState, addStudentFailureAction);

      assert.deepEqual(addedStudentState.editingData[1], {
        ...initialState.editingData[1],
        isSaving: false,
      });
      assert.deepEqual(addedStudentState.editingData[2], {
        ...initialState.editingData[2],
        isSaving: false,
      });
      assert.deepEqual(addedStudentState.studentData[1], {
        ...initialState.studentData[1],
        isSaving: false,
      });
      assert.deepEqual(addedStudentState.studentData[2], {
        ...initialState.studentData[2],
        isSaving: false,
      });
      assert.deepEqual(addedStudentState.addStatus, {status: AddStatus.FAIL, numStudents: 2});
    });

  });
});

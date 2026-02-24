import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {Provider} from 'react-redux';

import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import manageStudents, {
  RowType,
  setLoginType,
  setStudents,
  startEditingStudent,
  addStudentsFull,
  transferStudentsFull,
  addStudentsSuccess,
  addStudentsFailure,
  transferStudentsSuccess,
  transferStudentsFailure,
  TransferStatus,
  TransferType,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import ManageStudentsTable, {
  sortRows,
} from '@cdo/apps/templates/manageStudents/Table';
import teacherSections, {
  setSections,
  selectSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import experiments from '@cdo/apps/util/experiments';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {allowConsoleWarnings} from '../../../util/throwOnConsole';

describe('ManageStudentsTable', () => {
  allowConsoleWarnings();

  it('sortRows orders table in the following order: add, newStudent, student', () => {
    const rowData = [
      {id: 1, name: 'studentb', rowType: RowType.STUDENT},
      {id: 5, name: 'studenta', rowType: RowType.STUDENT},
      {id: 0, name: '', rowType: RowType.ADD},
      {id: 2, name: 'studentf', rowType: RowType.NEW_STUDENT},
      {id: 4, name: 'studenta', rowType: RowType.STUDENT},
      {id: 3, name: 'studenta', rowType: RowType.STUDENT},
      {id: 6, name: 'studentf', rowType: RowType.STUDENT},
    ];
    const columnIndexList = [];
    const orderList = ['asc'];
    const sortedList = sortRows(rowData, columnIndexList, orderList);
    expect(sortedList[0].id).toBe(0);
    expect(sortedList[1].id).toBe(2);
    expect(sortedList[2].id).toBe(3);
    expect(sortedList[3].id).toBe(4);
    expect(sortedList[4].id).toBe(5);
    expect(sortedList[5].id).toBe(1);
    expect(sortedList[6].id).toBe(6);
  });

  describe('appropriate buttons render', () => {
    beforeEach(() => {
      stubRedux();
      registerReducers({
        teacherSections,
        manageStudents,
        isRtl,
        unitSelection,
      });
    });

    afterEach(() => {
      restoreRedux();
    });

    it('does not render MoveStudents if loginType is google_classroom', () => {
      const store = getStore();
      const googleSection = {
        id: 101,
        loginType: SectionLoginType.google_classroom,
      };
      store.dispatch(setLoginType(SectionLoginType.google_classroom));
      store.dispatch(setSections([googleSection]));
      store.dispatch(selectSection(101));
      render(
        <Provider store={store}>
          <ManageStudentsTable />
        </Provider>
      );
      expect(screen.queryByText('Move students')).not.toBeInTheDocument();
    });

    it('does not render MoveStudents if loginType is clever', () => {
      const store = getStore();
      const cleverSection = {
        id: 101,
        loginType: SectionLoginType.clever,
      };
      store.dispatch(setLoginType(SectionLoginType.clever));
      store.dispatch(setSections([cleverSection]));
      store.dispatch(selectSection(101));
      render(
        <Provider store={store}>
          <ManageStudentsTable />
        </Provider>
      );
      expect(screen.queryByText('Move students')).not.toBeInTheDocument();
    });

    it('does not render Code Review Groups Dialog (and button) if section is not assigned CSA', () => {
      const store = getStore();
      store.dispatch(
        setSections([{id: 101, is_assigned_csa: false, name: 'Test Section'}])
      );
      store.dispatch(selectSection(101));
      render(
        <Provider store={store}>
          <ManageStudentsTable />
        </Provider>
      );
      expect(
        screen.queryByText('Manage code review groups')
      ).not.toBeInTheDocument();
    });

    it('does renders Code Review Groups Dialog (and button) if section is assigned CSA', () => {
      const store = getStore();
      const testStudents = {1: {id: 1, name: 'Test Student'}};
      store.dispatch(setStudents(testStudents));
      store.dispatch(
        setSections([{id: 101, is_assigned_csa: true, name: 'Test Section'}])
      );
      store.dispatch(selectSection(101));

      render(
        <Provider store={store}>
          <ManageStudentsTable />
        </Provider>
      );

      expect(screen.getByText('Manage Code Review Groups')).toBeInTheDocument();
    });
  });

  describe('full render tests', () => {
    const fakeStudent = {
      id: 1,
      name: 'Clark Kent',
      username: 'clark_kent',
      sectionId: 101,
      hasEverSignedIn: true,
      dependsOnThisSectionForLogin: true,
      loginType: 'picture',
      rowType: RowType.STUDENT,
    };
    const fakeStudents = {
      [fakeStudent.id]: fakeStudent,
    };
    const fakeSection = {
      id: 101,
      location: '/v2/sections/101',
      name: 'My Section',
      login_type: SectionLoginType.picture,
      participant_type: 'student',
      grade: '2',
      code: 'PMTKVH',
      lesson_extras: false,
      pairing_allowed: true,
      sharing_disabled: false,
      script: null,
      course_id: 29,
      studentCount: 10,
      students: Object.values(fakeStudents),
      hidden: false,
    };

    beforeEach(() => {
      stubRedux();
      registerReducers({
        teacherSections,
        manageStudents,
        isRtl,
        unitSelection,
      });
      const store = getStore();
      store.dispatch(setLoginType(fakeSection.login_type));
      store.dispatch(setSections([fakeSection]));
      store.dispatch(selectSection(fakeSection.id));
      store.dispatch(setStudents(fakeStudents));
    });

    afterEach(() => {
      restoreRedux();
    });

    it('renders an action cell for each student', () => {
      render(
        <Provider store={getStore()}>
          <ManageStudentsTable />
        </Provider>
      );
      expect(
        screen.getByRole('columnheader', {name: 'Actions'})
      ).toBeInTheDocument();
    });

    describe('Gender field feature flag', () => {
      beforeAll(() => {
        experiments.setEnabled(experiments.GENDER_FEATURE_ENABLED, true);
      });

      afterAll(() => {
        experiments.setEnabled(experiments.GENDER_FEATURE_ENABLED, false);
      });

      it('does render the gender column if loginType is secret picture', () => {
        render(
          <Provider store={getStore()}>
            <ManageStudentsTable />
          </Provider>
        );
        expect(screen.getByText('Gender')).toBeInTheDocument();
      });

      it('does render the gender column if loginType is secret word', () => {
        const store = getStore();
        store.dispatch(setLoginType(SectionLoginType.word));
        render(
          <Provider store={store}>
            <ManageStudentsTable />
          </Provider>
        );
        expect(screen.getByText('Gender')).toBeInTheDocument();
      });

      it('does not render the gender column if loginType is email', () => {
        const store = getStore();
        store.dispatch(setLoginType(SectionLoginType.email));
        render(
          <Provider store={store}>
            <ManageStudentsTable />
          </Provider>
        );
        expect(screen.queryByText('Gender')).not.toBeInTheDocument();
      });

      it('does not render the gender column if loginType is Google', () => {
        const store = getStore();
        store.dispatch(setLoginType(SectionLoginType.google_classroom));
        render(
          <Provider store={store}>
            <ManageStudentsTable />
          </Provider>
        );
        expect(screen.queryByText('Gender')).not.toBeInTheDocument();
      });

      it('does not render the gender column if loginType is Clever', () => {
        const store = getStore();
        store.dispatch(setLoginType(SectionLoginType.clever));
        render(
          <Provider store={store}>
            <ManageStudentsTable />
          </Provider>
        );
        expect(screen.queryByText('Gender')).not.toBeInTheDocument();
      });
    });

    it('renders an editable name field', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={getStore()}>
          <ManageStudentsTable />
        </Provider>
      );
      // Begin editing the student
      getStore().dispatch(startEditingStudent(fakeStudent.id));

      // Find the name input
      const nameInput = screen.getByDisplayValue(fakeStudent.name);
      expect(nameInput).toBeInTheDocument();

      // Simulate a name change
      await user.clear(nameInput);
      await user.type(nameInput, fakeStudent.name + 'z');

      // Expect the input box value to have changed
      expect(nameInput).toHaveValue(fakeStudent.name + 'z');
    });

    it('renders an editable family name field in student sections', async () => {
      const user = userEvent.setup();

      render(
        <Provider store={getStore()}>
          <ManageStudentsTable />
        </Provider>
      );
      // Begin editing the student
      getStore().dispatch(startEditingStudent(fakeStudent.id));

      const familyNameInputs = screen.getAllByRole('textbox', {
        name: /family name/i,
      });
      const familyNameInput = familyNameInputs[0];
      expect(familyNameInput).toBeInTheDocument();
      expect(familyNameInput).toHaveValue('');

      // Simulate a family name change
      await user.type(familyNameInput, 'z');

      // Expect the input box value to have changed
      expect(familyNameInput).toHaveValue('z');
    });

    it('does not render a family name field in PL sections', async () => {
      const plSection = {...fakeSection, participant_type: 'teacher'};
      getStore().dispatch(setSections([plSection]));

      render(
        <Provider store={getStore()}>
          <ManageStudentsTable />
        </Provider>
      );
      // Begin editing the student
      getStore().dispatch(startEditingStudent(fakeStudent.id));

      expect(
        screen.queryByRole('textbox', {name: /family name/i})
      ).not.toBeInTheDocument();
    });

    it('renders correctly if loginType is picture', () => {
      const store = getStore();
      store.dispatch(setLoginType(SectionLoginType.picture));
      render(
        <Provider store={store}>
          <ManageStudentsTable />
        </Provider>
      );

      const passwordColumnHeader = screen.getByText(i18n.picturePassword());
      expect(passwordColumnHeader).toBeInTheDocument();

      const showPictureButton = screen.getByRole('button', {
        name: i18n.showPicture(),
      });
      expect(showPictureButton).toBeInTheDocument();

      expect(screen.queryByText(/no section code/i)).not.toBeInTheDocument();

      // Should show sign-in instructions for picture login type
      expect(
        screen.getByText('Signing in with Picture passwords')
      ).toBeInTheDocument();
    });

    it('renders correctly if loginType is word', () => {
      const wordSection = {...fakeSection, loginType: SectionLoginType.word};
      const wordStudent = {...fakeStudent, loginType: SectionLoginType.word};
      const wordStudents = {
        [wordStudent.id]: wordStudent,
      };
      getStore().dispatch(setLoginType(SectionLoginType.word));
      getStore().dispatch(setSections([wordSection]));
      getStore().dispatch(setStudents(wordStudents));

      render(
        <Provider store={getStore()}>
          <ManageStudentsTable />
        </Provider>
      );

      const passwordColumnHeader = screen.getByText(i18n.secretWords());
      expect(passwordColumnHeader).toBeInTheDocument();

      const showWordsButton = screen.getByRole('button', {
        name: i18n.showWords(),
      });
      expect(showWordsButton).toBeInTheDocument();

      expect(screen.queryByText(/no section code/i)).not.toBeInTheDocument();

      expect(
        screen.getByText('Signing in with Secret Word passwords')
      ).toBeInTheDocument();
    });

    it('renders correctly if loginType is personal email', () => {
      const emailSection = {...fakeSection, loginType: SectionLoginType.email};
      const emailStudent = {...fakeStudent, loginType: SectionLoginType.email};
      const emailStudents = {
        [emailStudent.id]: emailStudent,
      };
      getStore().dispatch(setLoginType(SectionLoginType.email));
      getStore().dispatch(setSections([emailSection]));
      getStore().dispatch(setStudents(emailStudents));

      render(
        <Provider store={getStore()}>
          <ManageStudentsTable />
        </Provider>
      );

      const passwordColumnHeader = screen.getByText(i18n.password());
      expect(passwordColumnHeader).toBeInTheDocument();

      expect(
        screen.getByRole('button', {name: /reset password/i})
      ).toBeInTheDocument();

      expect(screen.queryByText(/no section code/i)).not.toBeInTheDocument();

      expect(
        screen.getByText('Signing in with Personal Logins')
      ).toBeInTheDocument();
    });

    it('displays notification for password reset length if state.showPasswordLengthFailure is true', () => {
      const emailSection = {
        ...fakeSection,
        loginType: SectionLoginType.email,
      };
      const emailStudent = {...fakeStudent, loginType: SectionLoginType.email};
      const emailStudents = {
        [emailStudent.id]: emailStudent,
      };
      getStore().dispatch(setLoginType(SectionLoginType.email));
      getStore().dispatch(setSections([emailSection]));
      getStore().dispatch(setStudents(emailStudents));

      render(
        <Provider store={getStore()}>
          <ManageStudentsTable />
        </Provider>
      );

      expect(
        screen.queryByText(/Passwords must be six \(6\) characters or longer/i)
      ).not.toBeInTheDocument();

      const resetPasswordButton = screen.getByRole('button', {
        name: /reset password/i,
      });
      fireEvent.click(resetPasswordButton);

      const passwordInput = screen.getByPlaceholderText(/new password/i);
      fireEvent.change(passwordInput, {target: {value: 'short'}});

      const saveButton = screen.getByRole('button', {name: /save/i});
      fireEvent.click(saveButton);

      expect(
        screen.getByText(/Passwords must be six \(6\) characters or longer/i)
      ).toBeInTheDocument();
    });

    it('renders correctly if loginType is clever', () => {
      const cleverSection = {
        ...fakeSection,
        loginType: SectionLoginType.clever,
      };
      getStore().dispatch(setLoginType(SectionLoginType.clever));
      getStore().dispatch(setSections([cleverSection]));

      render(
        <Provider store={getStore()}>
          <ManageStudentsTable section={cleverSection} />
        </Provider>
      );

      expect(screen.queryByText(i18n.password())).not.toBeInTheDocument();

      expect(screen.getByText(/Signing in with Clever/i)).toBeInTheDocument();
    });

    it('renders correctly if loginType is google_classroom', () => {
      const googleSection = {
        ...fakeSection,
        loginType: SectionLoginType.google_classroom,
      };
      getStore().dispatch(setLoginType(SectionLoginType.google_classroom));
      getStore().dispatch(setSections([googleSection]));

      render(
        <Provider store={getStore()}>
          <ManageStudentsTable section={googleSection} />
        </Provider>
      );

      expect(screen.queryByText(i18n.password())).not.toBeInTheDocument();
      expect(screen.getByText(/Signing in with Google/i)).toBeInTheDocument();
    });

    describe('The full section notification', () => {
      const wordSection = {...fakeSection, loginType: SectionLoginType.word};
      const wordStudent = {...fakeStudent, loginType: SectionLoginType.word};
      const wordStudents = {
        [wordStudent.id]: wordStudent,
      };
      getStore().dispatch(setLoginType(SectionLoginType.word));
      getStore().dispatch(setSections([wordSection]));
      getStore().dispatch(setStudents(wordStudents));

      const defaultAddTransferStatus = {
        sectionCapacity: 500,
        sectionCode: 'ABCDEF',
        sectionStudentCount: 500,
        numStudents: 1,
      };

      describe('does not render on success, or non-capacity related fail', () => {
        describe('Successful', () => {
          const studentDataToAdd = {
            id: 111,
            name: 'new student',
            age: 17,
            gender: 'f',
            secretPictureUrl: '/wizard.jpg',
            loginType: 'picture',
            isEditing: false,
          };
          describe('add', () => {
            it('does not fire full notification', () => {
              getStore().dispatch(
                addStudentsSuccess(1, -10, {
                  111: studentDataToAdd,
                })
              );

              render(
                <Provider store={getStore()}>
                  <ManageStudentsTable section={wordSection} />
                </Provider>
              );

              expect(
                screen.queryByText(/students couldn't be/i)
              ).not.toBeInTheDocument();
            });
          });

          describe('transfer', () => {
            it('does not fire full notification', () => {
              const transferStatus = {
                status: TransferStatus.SUCCESS,
                type: TransferType.MOVE_STUDENTS,
                error: null,
                numStudents: 3,
                sectionDisplay: 'ABCDEF',
              };
              const {type, numStudents, sectionDisplay} = transferStatus;

              getStore().dispatch(
                transferStudentsSuccess(type, numStudents, sectionDisplay)
              );

              render(
                <Provider store={getStore()}>
                  <ManageStudentsTable section={wordSection} />
                </Provider>
              );

              expect(
                screen.queryByText(/students couldn't be/i)
              ).not.toBeInTheDocument();
            });
          });
        });

        describe('Failed', () => {
          describe('add', () => {
            it('does not fire full notification', () => {
              getStore().dispatch(addStudentsFailure(1, 'error info', [0]));

              render(
                <Provider store={getStore()}>
                  <ManageStudentsTable section={wordSection} />
                </Provider>
              );

              expect(
                screen.queryByText(/students couldn't be/i)
              ).not.toBeInTheDocument();
            });
          });

          describe('transfer', () => {
            it('does not fire full notification', () => {
              getStore().dispatch(transferStudentsFailure('error info'));

              render(
                <Provider store={getStore()}>
                  <ManageStudentsTable section={wordSection} />
                </Provider>
              );

              expect(
                screen.queryByText(/students couldn't be/i)
              ).not.toBeInTheDocument();
            });
          });
        });
      });

      describe('renders if a student is added to a full section', () => {
        describe('Single students', () => {
          it('added', () => {
            getStore().dispatch(addStudentsFull(defaultAddTransferStatus, [0]));

            render(
              <Provider store={getStore()}>
                <ManageStudentsTable section={wordSection} />
              </Provider>
            );

            expect(
              screen.getByText(/students couldn't be added/i)
            ).toBeInTheDocument();
          });
          it('moved', () => {
            getStore().dispatch(
              transferStudentsFull(defaultAddTransferStatus, false)
            );

            render(
              <Provider store={getStore()}>
                <ManageStudentsTable section={wordSection} />
              </Provider>
            );

            expect(
              screen.getByText(/students couldn't be moved/i)
            ).toBeInTheDocument();
          });
          it('copied', () => {
            getStore().dispatch(
              transferStudentsFull(defaultAddTransferStatus, true)
            );

            render(
              <Provider store={getStore()}>
                <ManageStudentsTable section={wordSection} />
              </Provider>
            );

            expect(
              screen.getByText(/students couldn't be copied/i)
            ).toBeInTheDocument();
          });
        });
        describe('Multiple students', () => {
          defaultAddTransferStatus.sectionStudentCount = 499;
          defaultAddTransferStatus.numStudents = 2;

          it('added', () => {
            getStore().dispatch(
              addStudentsFull(defaultAddTransferStatus, [0, 1])
            );

            render(
              <Provider store={getStore()}>
                <ManageStudentsTable section={wordSection} />
              </Provider>
            );

            expect(
              screen.getByText(/students couldn't be added/i)
            ).toBeInTheDocument();
          });
          it('moved', () => {
            getStore().dispatch(
              transferStudentsFull(defaultAddTransferStatus, false)
            );

            render(
              <Provider store={getStore()}>
                <ManageStudentsTable section={wordSection} />
              </Provider>
            );

            expect(
              screen.getByText(/students couldn't be moved/i)
            ).toBeInTheDocument();
          });
          it('copied', () => {
            getStore().dispatch(
              transferStudentsFull(defaultAddTransferStatus, true)
            );

            render(
              <Provider store={getStore()}>
                <ManageStudentsTable section={wordSection} />
              </Provider>
            );

            expect(
              screen.getByText(/students couldn't be copied/i)
            ).toBeInTheDocument();
          });
          it('copied', () => {
            getStore().dispatch(
              transferStudentsFull(defaultAddTransferStatus, true)
            );

            render(
              <Provider store={getStore()}>
                <ManageStudentsTable section={wordSection} />
              </Provider>
            );

            expect(
              screen.getByText(/students couldn't be copied/i)
            ).toBeInTheDocument();
          });
        });
      });
    });
  });
});

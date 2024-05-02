// export const convertStudentServerData = (studentData, loginType, sectionId) => {
//   console.log('Student Data: ' + studentData);
//   let studentLookup = {};
//   for (let i = 0; i < studentData.length; i++) {
//     let student = studentData[i];
//     studentLookup[student.id] = {
//       id: student.id,
//       name: student.name,
//       familyName: student.family_name,
//       username: student.username,
//       email: student.email,
//       age: student.age || '',
//       gender: student.gender || '',
//       genderTeacherInput: student.gender_teacher_input || '',
//       secretWords: student.secret_words,
//       secretPicturePath: student.secret_picture_path,
//       loginType: loginType,
//       sectionId: sectionId,
//       sharingDisabled: student.sharing_disabled,
//       hasEverSignedIn: student.has_ever_signed_in,
//       dependsOnThisSectionForLogin: student.depends_on_this_section_for_login,
//       isEditing: false,
//       isSaving: false,
//       rowType: RowType.STUDENT,
//       userType: student.user_type,
//       childAccountComplianceState: student.child_account_compliance_state,
//     };
//   }
//   return studentLookup;
// };

// export const loadMultipleSectionsStudentData = sectionIds => {
//   return (dispatch, getState) => {
//     const state = getState().manageStudents;

//     sectionIds.forEach(sectionId => {
//       // Don't load data if it's already stored in redux.
//       const alreadyHaveStudentData = state.sectionId === sectionId;

//       if (!alreadyHaveStudentData) {
//         dispatch(startLoadingStudents());
//         $.ajax({
//           method: 'GET',
//           url: `/dashboardapi/sections/${sectionId}/students`,
//           dataType: 'json',
//         }).done(studentData => {
//           const convertedStudentData = convertStudentServerData(
//             studentData,
//             state.loginType,
//             sectionId
//           );
//           dispatch(setStudents(convertedStudentData, sectionId));
//         });
//       } else {
//         dispatch(finishLoadingStudents());
//       }
//     });
//   };
// };

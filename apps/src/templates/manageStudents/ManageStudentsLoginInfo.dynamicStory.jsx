import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';

const loginTypes = Object.values(SectionLoginType);

const stories = {};

loginTypes.forEach(loginType => {
  stories[`${loginType}`] = {args: {loginType}};
});

export default {
  baseCsf: `
    import MangeStudentsLoginInfo from "./ManageStudentsLoginInfo";

    const studentData = [
      {
        id: 1,
        name: 'studenta',
        username: 'studenta',
        userType: 'student',
        secretWords: 'secret words',
        secretPicturePath: 'wizard.jpg',
      },
    ];

    export default {
      component: MangeStudentsLoginInfo,
      title: 'ManageStudents/ManageStudentsLoginInfo',
      args: {
        sectionId: 7,
        sectionCode: 'ABCDEF',
        sectionName: 'Name',
        studioUrlPrefix: 'http://localhost:3000',
        studentData: studentData,
      },
    };
  `,
  stories: () => stories,
};

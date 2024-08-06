import {VisibilityType} from '@cdo/apps/code-studio/announcementsRedux';
import {NotificationType} from '@cdo/apps/sharedComponents/Notification';

export const fakeTeacherAnnouncement = {
  key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information,
  visibility: VisibilityType.teacher,
};

export const fakeTeacherAnnouncementWithDismissibleAndButtonText = {
  key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information,
  visibility: VisibilityType.teacher,
  dismissible: false,
  buttonText: 'Push the button',
};

export const fakeStudentAnnouncement = {
  key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notice: 'Notice - Student',
  details: 'Students are the best',
  link: '/foo/bar/student',
  type: NotificationType.information,
  visibility: VisibilityType.student,
};

export const fakeTeacherAndStudentAnnouncement = {
  key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notice: 'Notice - Teacher And Student',
  details: 'More detail here',
  link: '/foo/bar/teacherAndStudent',
  type: NotificationType.information,
  visibility: VisibilityType.teacherAndStudent,
};

export const fakeOldTeacherAnnouncement = {
  key: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information,
};

import {NotificationType} from '@cdo/apps/templates/Notification';
import {VisibilityType} from '@cdo/apps/code-studio/announcementsRedux';

export const fakeTeacherAnnouncement = {
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information,
  visibility: VisibilityType.teacher
};

export const fakeStudentAnnouncement = {
  notice: 'Notice - Student',
  details: 'Students are the best',
  link: '/foo/bar/student',
  type: NotificationType.information,
  visibility: VisibilityType.student
};

export const fakeTeacherAndStudentAnnouncement = {
  notice: 'Notice - Teacher And Student',
  details: 'More detail here',
  link: '/foo/bar/teacherAndStudent',
  type: NotificationType.information,
  visibility: VisibilityType.teacherAndStudent
};

export const fakeOldTeacherAnnouncement = {
  notice: 'Notice - Teacher',
  details: 'Teachers are the best',
  link: '/foo/bar/teacher',
  type: NotificationType.information
};

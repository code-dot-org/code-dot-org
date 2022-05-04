import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

const Course2 = {
  title: i18n.course2Title(),
  description: i18n.course2Desc(),
  link: '/s/course2',
  image: pegasus('/shared/images/courses/fit-200/logo_course2.jpg'),
  buttonText: i18n.viewCourse()
};

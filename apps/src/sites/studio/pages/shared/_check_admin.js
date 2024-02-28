import getScriptData from '@cdo/apps/util/getScriptData';
import md5 from 'md5';

const serverHOCSecret = getScriptData('checkadmin');
const localHOCSecret = md5(localStorage.getItem('hoc_secret'));
if (localHOCSecret !== serverHOCSecret) {
  document.location = '/';
}

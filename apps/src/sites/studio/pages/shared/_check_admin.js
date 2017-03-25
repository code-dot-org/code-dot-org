import MD5 from 'crypto-js/md5';
import getScriptData from '@cdo/apps/util/getScriptData';

const serverHOCSecret = getScriptData('checkadmin');
const localHOCSecret = MD5(localStorage.getItem('hoc_secret')).toString();
if (localHOCSecret !== serverHOCSecret) {
  document.location = '/';
}

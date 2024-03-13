import getScriptData from '@cdo/apps/util/getScriptData';
import {md5} from '@cdo/apps/util/crypto';

const serverHOCSecret = getScriptData('checkadmin');
const localHOCSecret = md5(localStorage.getItem('hoc_secret'));
if (localHOCSecret !== serverHOCSecret) {
  document.location = '/';
}

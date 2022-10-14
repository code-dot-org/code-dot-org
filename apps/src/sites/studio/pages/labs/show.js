// TODO: make this a .ts file to simplify
// probably need to change checkEntryPoints
import getScriptData from '../../../../util/getScriptData';
import init from '@cdo/apps/labs';

document.onreadystatechange = event => {
  if (document.readyState === 'complete') {
    init(
      getScriptData('appoptions'),
      document.querySelector('#lab-container') || document.createElement('div')
    );
  }
};

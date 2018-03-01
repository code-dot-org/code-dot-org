/**
 * Entry point to build a bundle containing a set of globals used when displaying
 * embedded blocks via blockly-in-an-iframe.
 */
import { convertXmlToBlockly } from '@cdo/apps/templates/instructions/utils';

window.addEventListener('DOMContentLoaded', () => {
  convertXmlToBlockly(document.body);
});

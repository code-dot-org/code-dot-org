import GoogleBlockly from 'blockly/core';
import {noMobileShowEditorOverride} from './cdoFieldTextInput';

// override should probably be in cdoFieldTextInput, then subclass from that here
// how do we make sure all FieldTextInput subclasses to have this customization though?
export default class CdoFieldNumber extends GoogleBlockly.FieldNumber {
  showEditor_ = noMobileShowEditorOverride;
}

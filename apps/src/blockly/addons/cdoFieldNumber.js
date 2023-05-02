import GoogleBlockly from 'blockly/core';
import {noMobileShowEditorOverride} from './cdoFieldTextInput';

export default class CdoFieldNumber extends GoogleBlockly.FieldNumber {
  showEditor_ = noMobileShowEditorOverride;
}

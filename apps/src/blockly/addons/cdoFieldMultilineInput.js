import GoogleBlockly from 'blockly/core';
import {noMobileShowEditorOverride} from './cdoFieldTextInput';

export default class CdoFieldMultilineInput extends GoogleBlockly.FieldNumber {
  showEditor_ = noMobileShowEditorOverride;
}

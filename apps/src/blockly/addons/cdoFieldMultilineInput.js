import GoogleBlockly from 'blockly/core';
import {noMobileShowEditorOverride} from './cdoFieldTextInput';

export default class CdoFieldMultilineInput extends GoogleBlockly.FieldMultilineInput {
  showEditor_ = noMobileShowEditorOverride;
}

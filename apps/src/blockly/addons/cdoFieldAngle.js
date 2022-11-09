import GoogleBlockly from 'blockly/core';
import {noMobileShowEditorOverride} from './cdoFieldTextInput';

export default class CdoFieldAngle extends GoogleBlockly.FieldNumber {
  showEditor_ = noMobileShowEditorOverride;
}

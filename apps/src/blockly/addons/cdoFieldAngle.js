import GoogleBlockly from 'blockly/core';
import {noMobileShowEditorOverride} from './cdoFieldTextInput';

export default class CdoFieldAngle extends GoogleBlockly.FieldAngle {
  showEditor_ = noMobileShowEditorOverride;
}

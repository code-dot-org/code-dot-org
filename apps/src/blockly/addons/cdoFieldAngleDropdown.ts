import {FieldAngle} from '@blockly/field-angle';

// The second parameter of CDO Blockly implementation of this class is
// a config object, which we are not currently using. In Google Blockly,
// the second parameter is an optional string for a class name. If the
// config option was used, errors would occur.
// The config option is specified for certain blocks in Jigsaw, Maze,
// Artist, and Play Lab. We can potentially add additional handling of
// this argument to this class in the future should we need it.
export default class CdoFieldAngleDropdown extends FieldAngle {
  constructor(value?: undefined, options?: undefined, config?: undefined) {
    super(value, options, config);
  }
}

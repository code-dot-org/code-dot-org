import EnumPropertyRow from './EnumPropertyRow';
import {fontFamilyOptions} from '../constants';

export default class FontFamilyPropertyRow extends EnumPropertyRow {
  static defaultProps = {
    desc: 'font family',
    initialValue: fontFamilyOptions[0],
    options: fontFamilyOptions
  };
}

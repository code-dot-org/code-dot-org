import EnumPropertyRow from './EnumPropertyRow';
import {themeDisplayNames, themeOptions} from '../constants';

export default class ThemePropertyRow extends EnumPropertyRow {
  static defaultProps = {
    desc: 'theme',
    displayOptions: themeDisplayNames,
    initialValue: themeOptions[0],
    options: themeOptions
  };
}

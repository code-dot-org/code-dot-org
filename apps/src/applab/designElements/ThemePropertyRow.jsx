import EnumPropertyRow from './EnumPropertyRow';
import {
  themeDisplayNames,
  themeOptions,
  DEFAULT_THEME_INDEX
} from '../constants';

export default class ThemePropertyRow extends EnumPropertyRow {
  static defaultProps = {
    desc: 'theme',
    displayOptions: themeDisplayNames,
    initialValue: themeOptions[DEFAULT_THEME_INDEX],
    options: themeOptions
  };
}

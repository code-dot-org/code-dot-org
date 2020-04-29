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

  // Need to reset theme value if screen switches
  componentWillReceiveProps(nextProps) {
    const {initialValue} = nextProps;
    if (this.props.initialValue !== initialValue) {
      this.setState({selectedValue: initialValue});
    }
  }
}

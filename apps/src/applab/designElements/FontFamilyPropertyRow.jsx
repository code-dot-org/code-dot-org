import applabMsg from '@cdo/applab/locale';
import EnumPropertyRow from './EnumPropertyRow';
import {fontFamilyOptions} from '../constants';

export default class FontFamilyPropertyRow extends EnumPropertyRow {
  static defaultProps = {
    desc: applabMsg.designElementProperty_fontFamily(),
    initialValue: fontFamilyOptions[0],
    options: fontFamilyOptions,
  };
}

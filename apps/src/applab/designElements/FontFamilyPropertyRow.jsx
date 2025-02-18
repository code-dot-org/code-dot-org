import applabMsg from '@cdo/applab/locale';

import {fontFamilyOptions} from '../constants';

import EnumPropertyRow from './EnumPropertyRow';

export default class FontFamilyPropertyRow extends EnumPropertyRow {
  static defaultProps = {
    desc: applabMsg.designElementProperty_fontFamily(),
    initialValue: fontFamilyOptions[0],
    options: fontFamilyOptions,
  };
}

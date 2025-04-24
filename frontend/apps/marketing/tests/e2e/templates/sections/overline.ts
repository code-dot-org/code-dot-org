import {Section} from './section';

class OverlineSection extends Section {
  constructor() {
    super('Overline');
  }

  createChildren() {
    this.createOverline({
      color: 'primary',
      size: 'm',
      removeMarginBottom: false,
      text: 'Overline Primary Medium',
    });

    this.createOverline({
      color: 'secondary',
      size: 's',
      removeMarginBottom: false,
      text: 'Overline Secondary Small',
      cfTextAlign: 'center',
    });

    this.createOverline({
      color: 'primary',
      size: 'l',
      removeMarginBottom: false,
      text: 'Overline Primary Large',
      cfTextAlign: 'right',
    });
  }
}

export default OverlineSection;

import {Section} from './section';

class DividerSection extends Section {
  constructor() {
    super('Divider');
  }

  createChildren() {
    this.createDivider({
      color: 'primary',
      margin: 'none',
    });

    this.createDivider({
      color: 'strong',
      margin: 'l',
    });
  }
}

export default DividerSection;

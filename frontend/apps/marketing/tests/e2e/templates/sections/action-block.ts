import {Section} from './section';

class ActionBlockSection extends Section {
  constructor() {
    super('Action Block');
  }

  createChildren() {
    this.createHeading({
      heading: 'With all content',
      visualAppearance: 'heading-xl',
    });
    //this.createContainer([actionBlockPrimary, actionBlockExternal]);
  }
}

export default ActionBlockSection;

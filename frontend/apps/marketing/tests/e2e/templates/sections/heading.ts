import {Section} from './section';

class HeadingSection extends Section {
  constructor() {
    super('Heading');
  }

  createChildren() {
    this.createHeading({
      heading: 'Heading 2',
      visualAppearance: 'heading-xl',
    });

    this.createHeading({
      heading: 'Heading 3',
      visualAppearance: 'heading-lg',
    });

    this.createHeading({
      heading: 'Heading 4',
      visualAppearance: 'heading-md',
      cfTextAlign: 'center',
    });

    this.createHeading({
      heading: 'Heading 5',
      visualAppearance: 'heading-sm',
      cfTextAlign: 'center',
    });

    this.createHeading({
      heading: 'Heading 6',
      visualAppearance: 'heading-xs',
      cfTextAlign: 'right',
    });
  }
}

export default HeadingSection;

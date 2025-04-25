import {Section} from './section';

class LocalizationSection extends Section {
  constructor() {
    super('Localization');
  }

  createChildren() {
    this.createHeading({
      heading: 'Short Text',
      visualAppearance: 'heading-xl',
    });

    this.createParagraph({
      paragraph: {
        type: 'BoundValue',
        entryId: '4SDvKKtx0qpCDwFTizoPVx',
        path: '/fields/quoteName/~locale',
      },
    });

    this.createHeading({
      heading: 'Localization- Long Text',
      visualAppearance: 'heading-xl',
    });

    this.createParagraph({
      paragraph: {
        type: 'BoundValue',
        entryId: '4SDvKKtx0qpCDwFTizoPVx',
        path: '/fields/longQuote/~locale',
      },
    });

    this.createHeading({
      heading: 'Math',
      visualAppearance: 'heading-xl',
    });

    this.createParagraph({
      paragraph: {
        type: 'UnboundValue',
        value: 'Math Symbols: 1 + 2 − 2 × 5 ≠ 0',
      },
    });
  }
}

export default LocalizationSection;

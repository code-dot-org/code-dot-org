import {Section} from './section';

class ParagraphSection extends Section {
  constructor() {
    super('Paragraph');
  }

  createChildren() {
    this.createParagraph({
      color: 'primary',
      visualAppearance: 'body-four',
      paragraph: 'Paragraph Body XS',
    });

    this.createParagraph({
      color: 'secondary',
      visualAppearance: 'body-two',
      paragraph: 'Paragraph Secondary Medium',
      cfTextAlign: 'center',
    });

    this.createParagraph({
      color: 'secondary',
      visualAppearance: 'body-two',
      paragraph: 'Paragraph Secondary Bold',
      isStrong: true,
      cfTextAlign: 'right',
    });

    this.createParagraph({
      color: 'primary',
      visualAppearance: 'body-one',
      paragraph:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi blandit orci nec iaculis ullamcorper. Morbi blandit bibendum nibh, at auctor metus consequat sit amet. Fusce sodales nisi dolor. Nam at lorem mattis, aliquam elit ut, facilisis nunc. Donec mollis sollicitudin dolor, sed blandit diam accumsan id. Proin suscipit lacus et elit molestie dignissim. Aliquam nisi velit, lobortis ut porta volutpat, aliquam at arcu. Donec nunc sapien, mattis congue pulvinar vel, sollicitudin vel sapien. Morbi quis pulvinar nulla. Cras ac sem ante. Sed eu interdum sapien, id fermentum nunc. Donec vehicula ut erat eget vehicula. Ut euismod sem ut nisl vehicula sagittis. Suspendisse mattis justo elit, eu sagittis lorem mattis id. Sed sit amet scelerisque magna, nec dictum ex. Praesent tincidunt massa sed laoreet posuere. Sed efficitur, justo id pharetra pretium, dui turpis convallis metus, eleifend euismod risus nibh vel enim. Vestibulum molestie justo eget ligula posuere bibendum.',
      removeMarginBottom: true,
    });
  }
}

export default ParagraphSection;

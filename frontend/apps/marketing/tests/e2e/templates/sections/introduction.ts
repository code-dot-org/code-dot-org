import {Section} from './section';

class IntroductionSection extends Section {
  constructor() {
    super('All the things UI Integration Test');
  }

  createChildren() {
    this.createParagraph({
      paragraph:
        'This page is for engineering to test the integration between Contentful and Code.org. Please do not modify this page unless part of the engineering group.',
    });
    this.createParagraph({
      paragraph:
        'Each Section in this page is composed of a unique CMS component. Add edge case scenarios to this section that you would like tested.',
    });
  }
}

export default IntroductionSection;

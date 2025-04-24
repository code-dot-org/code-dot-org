import {Section} from './section';

class TextLinkSection extends Section {
  constructor() {
    super('Text Link');
  }

  createChildren() {
    this.createTextLink({
      size: 'xs',
      text: 'Internal Link XS',
      href: '/ping',
      isLinkExternal: false,
    });

    this.createTextLink({
      size: 's',
      text: 'Internal Link S',
      href: '/ping',
      isLinkExternal: false,
    });

    this.createTextLink({
      size: 'm',
      text: 'Internal Link M',
      href: '/ping',
      isLinkExternal: false,
      cfTextAlign: 'center',
    });

    this.createTextLink({
      size: 'l',
      text: 'External Link L',
      href: 'about:blank',
      isLinkExternal: true,
      cfTextAlign: 'right',
    });
  }
}

export default TextLinkSection;

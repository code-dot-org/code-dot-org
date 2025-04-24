import {Section} from './section';

class ButtonSection extends Section {
  constructor() {
    super('Button');
  }

  createChildren() {
    this.createButton({
      text: 'Primary Button',
      href: '/ping',
      isLinkExternal: false,
      color: 'purple',
      type: 'primary',
    });

    this.createButton({
      text: 'Secondary Black Button',
      href: '/ping',
      isLinkExternal: false,
      color: 'black',
      type: 'secondary',
      iconLeftName: 'home',
      cfTextAlign: 'center',
    });

    this.createButton({
      text: 'External Button',
      href: 'about:blank',
      isLinkExternal: true,
      color: 'white',
      type: 'secondary',
      iconLeftName: 'smile',
      cfTextAlign: 'right',
    });
  }
}

export default ButtonSection;

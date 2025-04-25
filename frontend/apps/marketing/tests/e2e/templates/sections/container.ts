import {ComponentTree} from './component-tree';
import {Section} from './section';

class ContainerSection extends Section {
  constructor() {
    super('Container');
  }

  getSubContainerContents(
    heading: string,
    paragraphText: string,
    paragraphAlignment: string,
  ) {
    const subContainerComponenTree = new ComponentTree();

    subContainerComponenTree.createHeading({
      heading,
      visualAppearance: 'heading-xxl',
    });

    subContainerComponenTree.createParagraph({
      paragraph: {type: 'UnboundValue', value: paragraphText},
      cfTextAlign: paragraphAlignment,
    });

    this.unboundValues = {
      ...this.unboundValues,
      ...subContainerComponenTree.unboundValues,
    };

    return subContainerComponenTree.children;
  }

  getSubContainer(
    alignment: string,
    heading: string,
    paragraphText: string,
    paragraphAlignment: string,
  ) {
    const subContainerComponenTree = new ComponentTree();

    subContainerComponenTree.createContainer({
      cfVerticalAlignement: alignment,
      cfWidth: '25%',
      children: this.getSubContainerContents(
        heading,
        paragraphText,
        paragraphAlignment,
      ),
    });
    this.unboundValues = {
      ...this.unboundValues,
      ...subContainerComponenTree.unboundValues,
    };

    return subContainerComponenTree.children[0];
  }

  createChildren() {
    this.createContainer({
      cfFlexDirection: 'row',
      children: [
        this.getSubContainer(
          'start',
          'Left',
          'Left Aligned: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          'left',
        ),
        this.getSubContainer(
          'center',
          'Center',
          'Center Aligned: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          'center',
        ),
        this.getSubContainer(
          'end',
          'Right',
          'Right Aligned: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          'right',
        ),
      ],
    });
  }
}

export default ContainerSection;

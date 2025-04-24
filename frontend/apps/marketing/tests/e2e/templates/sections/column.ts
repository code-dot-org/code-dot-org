import {ComponentTree} from './component-tree';
import {Section} from './section';

class ColumnSection extends Section {
  constructor() {
    super('Column');
  }

  getParagraph(text: string) {
    const paragraphComponenTree = new ComponentTree();

    paragraphComponenTree.createParagraph({
      paragraph: text,
    });

    this.unboundValues = {
      ...this.unboundValues,
      ...paragraphComponenTree.unboundValues,
    };

    return paragraphComponenTree.children;
  }

  createChildren() {
    this.createColumnContainer({
      cfWrapColumnsCount: 2,
      cfColumns: '[3,3,3,3]',
      cfBorder: '1px solid rgba(0,0,0,1)',
      children: [
        this.createSingleColumn({
          cfBorder: '1px solid rgba(0,0,0,1)',
          cfVerticalAlignment: 'start',
          cfHorizontalAlignment: 'center',
          children: this.getParagraph('Left Aligned'),
        }),
        this.createSingleColumn({
          cfBorder: '1px solid rgba(0,0,0,1)',
          cfVerticalAlignment: 'center',
          cfHorizontalAlignment: 'center',
          children: this.getParagraph('Center Aligned'),
        }),
        this.createSingleColumn({
          cfBorder: '1px solid rgba(0,0,0,1)',
          cfVerticalAlignment: 'end',
          cfHorizontalAlignment: 'center',
          children: this.getParagraph('Right Aligned'),
        }),
      ],
    });
  }
}

export default ColumnSection;

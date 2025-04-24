import {nanoid} from 'nanoid';

export class ComponentTree {
  public unboundValues: object;
  public children: any[];

  constructor() {
    this.unboundValues = {};
    this.children = [];
  }

  createHeading({
    heading,
    visualAppearance,
  }: {
    heading: string;
    visualAppearance?: string;
  }) {
    const headingChild = this.createUnboundValue(heading);

    this.children.push({
      displayName: 'Heading',
      definitionId: 'heading',
      patternProperties: {},
      variables: {
        visualAppearance: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: visualAppearance ?? 'heading-xxl',
          },
        },
        children: headingChild,
      },
      children: [],
    });
  }

  createButton({
    color,
    type,
    text,
    href,
    isLinkExternal,
    ariaLabel,
    iconLeftName,
    cfTextAlign,
  }: {
    color: string;
    type: string;
    text: string;
    href: string;
    isLinkExternal: boolean;
    ariaLabel?: string;
    iconLeftName?: string;
    cfTextAlign?: string;
  }) {
    this.children.push({
      displayName: 'Button',
      definitionId: 'button',
      patternProperties: {},
      variables: {
        color: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: color,
          },
        },
        type: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: type,
          },
        },
        text: this.createUnboundValue(text),
        href: this.createUnboundValue(href),
        isLinkExternal: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: isLinkExternal,
          },
        },
        ariaLabel: this.createUnboundValue(ariaLabel),
        iconLeftName: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: iconLeftName ?? '',
          },
        },
        cfTextAlign: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfTextAlign ?? 'left',
          },
        },
      },
      children: [],
    });
  }

  createColumnContainer({
    cfWrapColumnsCount,
    cfColumns,
    cfBorder,
    children,
  }: {
    cfWrapColumnsCount?: number;
    cfColumns: string;
    cfBorder: string;
    children: any;
  }) {
    this.children.push({
      definitionId: 'contentful-columns',
      patternProperties: {},
      variables: {
        cfWrapColumnsCount: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfWrapColumnsCount,
          },
        },
        cfColumns: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfColumns,
          },
        },
        cfBorder: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfBorder,
          },
        },
        cfWrapColumns: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: true,
          },
        },
      },
      children,
    });
  }

  createParagraph({paragraph}: {paragraph: string}) {
    const paragraphChild = this.createUnboundValue(paragraph);

    this.children.push({
      displayName: 'Paragraph',
      definitionId: 'paragraph',
      patternProperties: {},
      variables: {
        visualAppearance: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: 'body-one',
          },
        },
        children: paragraphChild,
      },
      children: [],
    });
  }

  createUnboundValue(value: string | undefined) {
    const id = nanoid();

    this.unboundValues[id] = {};

    if (value) {
      this.unboundValues[id].value = value;
    }

    return {
      key: id,
      type: 'UnboundValue',
    };
  }
}

import {nanoid} from 'nanoid';

export class ComponentTree {
  public unboundValues: object;
  public children: any[];

  constructor() {
    this.unboundValues = {};
    this.children = [];
  }

  createOverline({
    color,
    size,
    removeMarginBottom,
    text,
    cfTextAlign,
  }: {
    color: string;
    size: string;
    removeMarginBottom: boolean;
    text: string;
    cfTextAlign?: string;
  }) {
    this.children.push({
      displayName: 'Overline',
      definitionId: 'overline',
      patternProperties: {},
      variables: {
        color: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: color,
          },
        },
        size: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: size,
          },
        },
        removeMarginBottom: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: removeMarginBottom ?? false,
          },
        },
        children: this.createUnboundValue(text),
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

  createHeading({
    heading,
    visualAppearance,
    cfTextAlign,
  }: {
    heading: string;
    visualAppearance?: string;
    cfTextAlign?: string;
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
        cfTextAlign: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfTextAlign ?? 'left',
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

  createDivider({color, margin}: {color: string; margin: string}) {
    this.children.push({
      displayName: 'Divider',
      definitionId: 'divider',
      patternProperties: {},
      variables: {
        color: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: color,
          },
        },
        margin: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: margin,
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

  createContainer({
    cfBorder,
    cfHorizontalAlignment,
    cfVerticalAlignement,
    cfFlexDirection,
    cfWidth,
    children,
  }: {
    cfBorder?: string;
    cfFlexDirection?: string;
    cfWidth?: string;
    cfHorizontalAlignment?: string;
    cfVerticalAlignement?: string;
    children: any;
  }) {
    this.children.push({
      definitionId: 'contentful-container',
      patternProperties: {},
      variables: {
        ...(cfBorder && {
          cfBorder: {
            type: 'DesignValue',
            valuesByBreakpoint: {
              desktop: cfBorder,
            },
          },
        }),
        ...(cfFlexDirection && {
          cfFlexDirection: {
            type: 'DesignValue',
            valuesByBreakpoint: {
              desktop: cfFlexDirection,
            },
          },
        }),
        ...(cfWidth && {
          cfWidth: {
            type: 'DesignValue',
            valuesByBreakpoint: {
              desktop: cfWidth,
            },
          },
        }),
        cfHorizontalAlignment: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfHorizontalAlignment ?? 'start',
          },
        },
        cfVerticalAlignement: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfVerticalAlignement ?? 'start',
          },
        },
      },
      children,
    });
  }

  createVideo({
    videoTitle,
    videoDesc,
    uploadDate,
    youTubeId,
    videoFallback,
    showCaption,
  }: {
    videoTitle: string;
    videoDesc: string;
    uploadDate: string;
    youTubeId: string;
    videoFallback?: string;
    showCaption?: boolean;
  }) {
    this.children.push({
      displayName: 'Video',
      definitionId: 'video',
      patternProperties: {},
      variables: {
        videoTitle: this.createUnboundValue(videoTitle),
        videoDesc: this.createUnboundValue(videoDesc),
        uploadDate: this.createUnboundValue(uploadDate),
        youTubeId: this.createUnboundValue(youTubeId),
        videoFallback: this.createUnboundValue(videoFallback),
        showCaption: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: showCaption ?? false,
          },
        },
      },
      children: [],
    });
  }

  createTextLink({
    size,
    text,
    href,
    isLinkExternal,
    removeMarginBottom,
    cfTextAlign,
  }: {
    size: string;
    text: string;
    href: string;
    isLinkExternal: boolean;
    removeMarginBottom?: boolean;
    arialabel?: string;
    cfTextAlign?: string;
  }) {
    this.children.push({
      displayName: 'Text Link',
      definitionId: 'link',
      patternProperties: {},
      variables: {
        size: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: size,
          },
        },
        children: this.createUnboundValue(text),
        href: this.createUnboundValue(href),
        isLinkExternal: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: isLinkExternal ?? false,
          },
        },
        removeMarginBottom: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: removeMarginBottom ?? false,
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

  createParagraph({
    paragraph,
    visualAppearance,
    color,
    removeMarginBottom,
    isStrong,
    cfTextAlign,
  }: {
    visualAppearance?: string;
    color?: string;
    removeMarginBottom?: boolean;
    isStrong?: boolean;
    paragraph: string;
    cfTextAlign?: string;
  }) {
    const paragraphChild = this.createUnboundValue(paragraph);

    this.children.push({
      displayName: 'Paragraph',
      definitionId: 'paragraph',
      patternProperties: {},
      variables: {
        visualAppearance: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: visualAppearance ?? 'body-one',
          },
        },
        cfTextAlign: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfTextAlign ?? 'left',
          },
        },
        color: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: color ?? 'primary',
          },
        },
        removeMarginBottom: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: removeMarginBottom ?? false,
          },
        },
        isStrong: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: isStrong ?? false,
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

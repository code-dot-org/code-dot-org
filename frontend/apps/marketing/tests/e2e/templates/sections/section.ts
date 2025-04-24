import {ComponentTree} from './component-tree';

export abstract class Section extends ComponentTree {
  protected headingLabel: string;

  constructor(headingLabel: string) {
    super();
    this.headingLabel = headingLabel;

    this.createHeading({heading: headingLabel});

    // Create the inner contents of this section
    this.createChildren();
  }

  getComponentTree() {
    return this.createContentfulSectionWrapper({
      name: this.headingLabel,
      children: this.children,
    });
  }

  createDscoSectionWrapper({name, children}: {name: string; children: any}) {
    return {
      displayName: name,
      definitionId: 'section',
      patternProperties: {},
      variables: {
        background: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: 'primary',
          },
        },
        padding: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: 'l',
          },
        },
        cfVisibility: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: true,
          },
        },
      },
      children,
    };
  }

  createContentfulSectionWrapper({
    name,
    children,
  }: {
    name: string;
    children: any;
  }) {
    return {
      displayName: name,
      definitionId: 'contentful-section',
      patternProperties: {},
      variables: {},
      children: [this.createDscoSectionWrapper({name, children})],
    };
  }

  createSingleColumn({
    cfVerticalAlignment,
    cfHorizontalAlignment,
    children,
    cfBorder,
  }: {
    cfVerticalAlignment?: string;
    cfHorizontalAlignment?: string;
    cfBorder?: string;
    children: any;
  }) {
    return {
      definitionId: 'contentful-single-column',
      patternProperties: {},
      variables: {
        cfVerticalAlignment: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfVerticalAlignment ?? 'top',
          },
        },
        cfHorizontalAlignment: {
          type: 'DesignValue',
          valuesByBreakpoint: {
            desktop: cfHorizontalAlignment ?? 'left',
          },
        },
        ...(cfBorder && {
          cfBorder: {
            type: 'DesignValue',
            valuesByBreakpoint: {
              desktop: cfBorder,
            },
          },
        }),
      },
      children,
    };
  }

  abstract createChildren(): void;
}

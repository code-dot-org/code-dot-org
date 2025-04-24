import {createClient} from 'contentful-management';
import {
  getBreakpoints,
  createContentfulSectionWrapper,
  createSectionHeading,
} from './utils';
import IntroductionSection from './sections/introduction';
import ActionBlockSection from './sections/action-block';
import ButtonSection from './sections/button';
import ColumnSection from './sections/column';
import ContainerSection from './sections/container';
import DividerSection from './sections/divider';
import HeadingSection from './sections/heading';
import OverlineSection from './sections/overline';
import ParagraphSection from './sections/paragraph';
import TextLinkSection from './sections/text-link';
import VideoSection from './sections/video';

export async function createAllTheThingsExperienceEntry() {
  const managementClient = createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_API_KEY!,
    space: process.env.CONTENTFUL_SPACE_ID!,
  });

  const space = await managementClient.getSpace(
    process.env.CONTENTFUL_SPACE_ID!,
  );

  const environment = await space.getEnvironment('development');

  const introductionSection = new IntroductionSection();
  const actionBlockSection = new ActionBlockSection();
  const buttonSection = new ButtonSection();
  const columnSection = new ColumnSection();
  const containerSection = new ContainerSection();
  const dividerSection = new DividerSection();
  const headingSection = new HeadingSection();
  const overlineSection = new OverlineSection();
  const paragraphSection = new ParagraphSection();
  const textLinkSection = new TextLinkSection();
  const videoSection = new VideoSection();

  const sections = [
    introductionSection,
    actionBlockSection,
    buttonSection,
    columnSection,
    containerSection,
    dividerSection,
    headingSection,
    overlineSection,
    paragraphSection,
    textLinkSection,
    videoSection,
  ];

  const unboundValues = sections.reduce((acc, section) => {
    return Object.assign(acc, section.unboundValues);
  }, {});

  console.log(unboundValues);

  const entry = await environment.createEntry('experience', {
    fields: {
      title: {
        'en-US':
          '⛔️ [ENGINEERING ONLY] UI Integration Testing - PROGRAMMATIC TEST',
      },
      directory: {
        'en-US': 'None',
      },
      slug: {
        'en-US': 'all-the-things',
      },
      pageHeading: {
        'en-US': '[Engineering] UI Integration Test',
      },
      componentTree: {
        'en-US': {
          breakpoints: getBreakpoints(),
          schemaVersion: '2023-09-28',
          children: [
            introductionSection.getComponentTree(),
            createContentfulSectionWrapper({
              name: 'Localization',
              children: [
                {
                  id: 'BkKYMhQm',
                  displayName: 'Heading',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xxl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'd5NKAnwp',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'dxKxFE8C',
                  displayName: 'Heading 1',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'uML982xB',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'b55f9mox',
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
                    color: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      path: '/TDy6kSns/fields/quoteName/~locale',
                      type: 'BoundValue',
                    },
                    isStrong: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'VzJgPw9B',
                  displayName: 'Heading 2',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'qQFZT2Ct',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'QKZo3i6u',
                  displayName: 'Paragraph 1',
                  definitionId: 'paragraph',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'body-one',
                      },
                    },
                    color: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      path: '/OBu7LBgD/fields/longQuote/~locale',
                      type: 'BoundValue',
                    },
                    isStrong: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'jltL4xD9',
                  displayName: 'Heading 3',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'bvkdCWAp',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'RydO4DZ5',
                  displayName: 'Paragraph 1',
                  definitionId: 'paragraph',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'body-one',
                      },
                    },
                    color: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'M6UV6klE',
                      type: 'UnboundValue',
                    },
                    isStrong: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
              ],
            }),
            actionBlockSection.getComponentTree(),
            createContentfulSectionWrapper({
              name: 'Action Block',

              children: [
                {
                  id: 'lBfKWG1Q',
                  displayName: 'Heading',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xxl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'zB9624m9',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'NcFGUcus',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'IRGGNCsc',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: '4Z9z51w4',
                  definitionId: 'contentful-container',
                  patternProperties: {},
                  variables: {
                    cfVerticalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfHorizontalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfMargin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0 0 0 0',
                      },
                    },
                    cfPadding: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0 0 0 0',
                      },
                    },
                    cfBackgroundColor: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'rgba(0, 0, 0, 0)',
                      },
                    },
                    cfWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '100%',
                      },
                    },
                    cfHeight: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'fit-content',
                      },
                    },
                    cfMaxWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '1192px',
                      },
                    },
                    cfFlexDirection: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'row',
                        mobile: 'column',
                      },
                    },
                    cfFlexReverse: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    cfFlexWrap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'nowrap',
                      },
                    },
                    cfBorder: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px solid rgba(0, 0, 0, 0)',
                      },
                    },
                    cfGap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px 24px',
                        mobile: '24px 24px',
                      },
                    },
                    cfHyperlink: {
                      type: 'UnboundValue',
                      key: '36YfTgYM',
                    },
                    cfOpenInNewTab: {
                      type: 'UnboundValue',
                      key: '1g7RleiK',
                    },
                    cfBorderRadius: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px',
                      },
                    },
                    cfBackgroundImageUrl: {
                      type: 'UnboundValue',
                      key: 'dJNC5rnb',
                    },
                    cfBackgroundImageOptions: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: {
                          scaling: 'fill',
                          alignment: 'left top',
                          targetSize: '2000px',
                        },
                      },
                    },
                  },
                  children: [
                    {
                      id: 'KXc3wv4t',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'Ov2KaMlI',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'z9iS8tow',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'SGrm6TeM',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: 'cqVonltI',
                          definitionId: 'verticalActionBlock',
                          patternProperties: {},
                          variables: {
                            overline: {
                              path: '/Ura63qS4/fields/actionBlockOverline/~locale',
                              type: 'BoundValue',
                            },
                            title: {
                              path: '/sOCuihY3/fields/title/~locale',
                              type: 'BoundValue',
                            },
                            description: {
                              path: '/P3w0MI3x/fields/shortDescription/~locale',
                              type: 'BoundValue',
                            },
                            image: {
                              path: '/D06vmzVo/fields/image/~locale/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            primaryButton: {
                              path: '/0Uc1jnt8/fields/primaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            secondaryButton: {
                              path: '/5gQSSrFE/fields/secondaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            background: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'primary',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                    {
                      id: 'GIbKtM99',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'eMXbhJJO',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'hAGyY1mh',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'Aw5CTnlT',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: 'cNcSAcmb',
                          definitionId: 'verticalActionBlock',
                          patternProperties: {},
                          variables: {
                            overline: {
                              path: '/btGygYlg/fields/actionBlockOverline/~locale',
                              type: 'BoundValue',
                            },
                            title: {
                              path: '/qj8MdFqk/fields/title/~locale',
                              type: 'BoundValue',
                            },
                            description: {
                              path: '/OkAdGTNN/fields/shortDescription/~locale',
                              type: 'BoundValue',
                            },
                            image: {
                              path: '/4rTEErM8/fields/image/~locale/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            primaryButton: {
                              path: '/wf6Nfy0h/fields/marketingLink/~locale',
                              type: 'BoundValue',
                            },
                            secondaryButton: {
                              path: '/L4ppraxB/fields/marketingLink/~locale',
                              type: 'BoundValue',
                            },
                            background: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'primary',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'XkRIiyuw',
                  definitionId: 'divider',
                  patternProperties: {},
                  variables: {
                    color: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    margin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 's',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'WF9VdUgg',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'rXgI4Mvr',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'Jx09S5tI',
                  definitionId: 'contentful-container',
                  patternProperties: {},
                  variables: {
                    cfVerticalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfHorizontalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfMargin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0 0 0 0',
                      },
                    },
                    cfPadding: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '24px 24px 24px 24px',
                      },
                    },
                    cfBackgroundColor: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'rgba(247, 248, 250, 1)',
                      },
                    },
                    cfWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '100%',
                      },
                    },
                    cfHeight: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'fit-content',
                      },
                    },
                    cfMaxWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '1192px',
                      },
                    },
                    cfFlexDirection: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'row',
                        mobile: 'column',
                      },
                    },
                    cfFlexReverse: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    cfFlexWrap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'nowrap',
                      },
                    },
                    cfBorder: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px solid rgba(0, 0, 0, 0)',
                      },
                    },
                    cfGap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px 24px',
                        mobile: '24px 24px',
                      },
                    },
                    cfHyperlink: {
                      type: 'UnboundValue',
                      key: 'xaSe4Rjf',
                    },
                    cfOpenInNewTab: {
                      type: 'UnboundValue',
                      key: 'TnZjwBke',
                    },
                    cfBorderRadius: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px',
                      },
                    },
                    cfBackgroundImageUrl: {
                      type: 'UnboundValue',
                      key: 'gwYa67z7',
                    },
                    cfBackgroundImageOptions: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: {
                          scaling: 'fill',
                          alignment: 'left top',
                          targetSize: '2000px',
                        },
                      },
                    },
                  },
                  children: [
                    {
                      id: 'pSAn3QNf',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'rqSvSSLH',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'ZdTFBVAL',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'dWrBnOHy',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: 'HA6kV8lH',
                          definitionId: 'verticalActionBlock',
                          patternProperties: {},
                          variables: {
                            overline: {
                              path: '/eV4HBBLe/fields/actionBlockOverline/~locale',
                              type: 'BoundValue',
                            },
                            title: {
                              path: '/eeVAmXO7/fields/title/~locale',
                              type: 'BoundValue',
                            },
                            description: {
                              path: '/1V2S6k5O/fields/shortDescription/~locale',
                              type: 'BoundValue',
                            },
                            image: {
                              path: '/3xRBhtEN/fields/image/~locale/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            primaryButton: {
                              path: '/iKuwF5UL/fields/primaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            secondaryButton: {
                              path: '/XC0Orztn/fields/secondaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            background: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'secondary',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                    {
                      id: 'hAm0hXK7',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'GGSUj7T7',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: '6dweZgN5',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'TC9267aF',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: 'NRvZhJuI',
                          definitionId: 'verticalActionBlock',
                          patternProperties: {},
                          variables: {
                            overline: {
                              path: '/pnEVNJEY/fields/actionBlockOverline/~locale',
                              type: 'BoundValue',
                            },
                            title: {
                              path: '/289w042P/fields/title/~locale',
                              type: 'BoundValue',
                            },
                            description: {
                              path: '/8W24TK7L/fields/shortDescription/~locale',
                              type: 'BoundValue',
                            },
                            image: {
                              path: '/Gac8HyiL/fields/image/~locale/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            primaryButton: {
                              path: '/L1oQ0Cfn/fields/marketingLink/~locale',
                              type: 'BoundValue',
                            },
                            secondaryButton: {
                              path: '/jgZPQ2f4/fields/marketingLink/~locale',
                              type: 'BoundValue',
                            },
                            background: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'secondary',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'HT5aw3I7',
                  definitionId: 'divider',
                  patternProperties: {},
                  variables: {
                    color: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    margin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 's',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'aAeOh6L6',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'Tgg1s2D2',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'kAFZ2mur',
                  definitionId: 'contentful-container',
                  patternProperties: {},
                  variables: {
                    cfVerticalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfHorizontalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfMargin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0 0 0 0',
                      },
                    },
                    cfPadding: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0 0 0 0',
                      },
                    },
                    cfBackgroundColor: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'rgba(0, 0, 0, 0)',
                      },
                    },
                    cfWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '100%',
                      },
                    },
                    cfHeight: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'fit-content',
                      },
                    },
                    cfMaxWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '1192px',
                      },
                    },
                    cfFlexDirection: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'row',
                        mobile: 'column',
                      },
                    },
                    cfFlexReverse: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    cfFlexWrap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'nowrap',
                      },
                    },
                    cfBorder: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px solid rgba(0, 0, 0, 0)',
                      },
                    },
                    cfGap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px 24px',
                        mobile: '24px 24px',
                      },
                    },
                    cfHyperlink: {
                      type: 'UnboundValue',
                      key: '5rKwB2lO',
                    },
                    cfOpenInNewTab: {
                      type: 'UnboundValue',
                      key: 'hEDkMrEi',
                    },
                    cfBorderRadius: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px',
                      },
                    },
                    cfBackgroundImageUrl: {
                      type: 'UnboundValue',
                      key: 'mp03r8eT',
                    },
                    cfBackgroundImageOptions: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: {
                          scaling: 'fill',
                          alignment: 'left top',
                          targetSize: '2000px',
                        },
                      },
                    },
                  },
                  children: [
                    {
                      id: 'CC1rbHZN',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'LY3fwrGF',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'vl7mGMNk',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'Mo4S1GHf',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: 'vKRDeLjD',
                          definitionId: 'verticalActionBlock',
                          patternProperties: {},
                          variables: {
                            overline: {
                              path: '/S9wdCChd/fields/actionBlockOverline/~locale',
                              type: 'BoundValue',
                            },
                            title: {
                              path: '/sCyp4umt/fields/title/~locale',
                              type: 'BoundValue',
                            },
                            description: {
                              path: '/VHT0F26i/fields/shortDescription/~locale',
                              type: 'BoundValue',
                            },
                            image: {
                              path: '/hbWAEPUa/fields/image/~locale/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            primaryButton: {
                              path: '/NQABxHSW/fields/primaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            secondaryButton: {
                              path: '/0HkUraow/fields/secondaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            background: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'primary',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                    {
                      id: 'MFJ3yTqG',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'JjsxkEPq',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'mI3808f6',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'AKTPfVrs',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: '1yfSgGaI',
                          definitionId: 'verticalActionBlock',
                          patternProperties: {},
                          variables: {
                            overline: {
                              path: '/qUW7SuUq/fields/actionBlockOverline/~locale',
                              type: 'BoundValue',
                            },
                            title: {
                              path: '/7Gxx550Y/fields/title/~locale',
                              type: 'BoundValue',
                            },
                            description: {
                              path: '/PkMzRu3l/fields/shortDescription/~locale',
                              type: 'BoundValue',
                            },
                            image: {
                              path: '/q64yPb2d/fields/image/~locale/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            primaryButton: {
                              path: '/9VSvsbCf/fields/primaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            secondaryButton: {
                              path: '/o8e0EuB2/fields/secondaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            background: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'primary',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                    {
                      id: 'w6KnOUij',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'lTlx2Ck5',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'byHQXRz8',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'IuXKDn7Q',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: 'KtyKVhex',
                          definitionId: 'verticalActionBlock',
                          patternProperties: {},
                          variables: {
                            overline: {
                              path: '/MKnXMzs0/fields/actionBlockOverline/~locale',
                              type: 'BoundValue',
                            },
                            title: {
                              path: '/tgGNSw4W/fields/title/~locale',
                              type: 'BoundValue',
                            },
                            description: {
                              path: '/o5ZyffFl/fields/shortDescription/~locale',
                              type: 'BoundValue',
                            },
                            image: {
                              path: '/EGqljg4x/fields/image/~locale/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            primaryButton: {
                              path: '/TBoKgmUE/fields/primaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            secondaryButton: {
                              path: '/tqX7SCKc/fields/secondaryLinkRef/~locale',
                              type: 'BoundValue',
                            },
                            background: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'primary',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            }),
            createContentfulSectionWrapper({
              name: 'Full Width Action Block',

              children: [
                {
                  id: 'mKmQjjB5',
                  displayName: 'Heading 1',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xxl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: '0BYMXHkY',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'XQ7TfDn9',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'IAwsxK7N',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'pU9KFVeN',
                  definitionId: 'fullWidthActionBlock',
                  patternProperties: {},
                  variables: {
                    image: {
                      path: '/FbSNI62I/fields/image/~locale/fields/file/~locale',
                      type: 'BoundValue',
                    },
                    overline: {
                      path: '/zibXm2hu/fields/actionBlockOverline/~locale',
                      type: 'BoundValue',
                    },
                    title: {
                      path: '/k5eX10Tv/fields/title/~locale',
                      type: 'BoundValue',
                    },
                    description: {
                      path: '/d2JuVKZQ/fields/shortDescription/~locale',
                      type: 'BoundValue',
                    },
                    primaryButton: {
                      path: '/NqrmKrUA/fields/primaryLinkRef/~locale',
                      type: 'BoundValue',
                    },
                    secondaryButton: {
                      path: '/f5guroL4/fields/secondaryLinkRef/~locale',
                      type: 'BoundValue',
                    },
                    background: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'X3HvQXNU',
                  definitionId: 'divider',
                  patternProperties: {},
                  variables: {
                    color: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    margin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 's',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'qPYEMk2o',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'Xsx7dtxc',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'dtvNdOmk',
                  definitionId: 'fullWidthActionBlock',
                  patternProperties: {},
                  variables: {
                    image: {
                      path: '/DXDrLIKT/fields/image/~locale/fields/file/~locale',
                      type: 'BoundValue',
                    },
                    overline: {
                      path: '/XvAA9yze/fields/actionBlockOverline/~locale',
                      type: 'BoundValue',
                    },
                    title: {
                      path: '/lnB5pwJz/fields/title/~locale',
                      type: 'BoundValue',
                    },
                    description: {
                      path: '/MdJaRWGZ/fields/shortDescription/~locale',
                      type: 'BoundValue',
                    },
                    primaryButton: {
                      path: '/0TXnLT0j/fields/marketingLink/~locale',
                      type: 'BoundValue',
                    },
                    secondaryButton: {
                      path: '/uyYAAfql/fields/marketingLink/~locale',
                      type: 'BoundValue',
                    },
                    background: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'RdLeOx6U',
                  definitionId: 'divider',
                  patternProperties: {},
                  variables: {
                    color: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'primary',
                      },
                    },
                    margin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 's',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'fwnmq3Qj',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'v6A0d7WI',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'SYclWTwE',
                  definitionId: 'contentful-container',
                  patternProperties: {},
                  variables: {
                    cfVerticalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfHorizontalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfMargin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0 0 0 0',
                      },
                    },
                    cfPadding: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '24px 24px 24px 24px',
                      },
                    },
                    cfBackgroundColor: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'rgba(247, 248, 250, 1)',
                      },
                    },
                    cfWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '100%',
                      },
                    },
                    cfHeight: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'fit-content',
                      },
                    },
                    cfMaxWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '1192px',
                      },
                    },
                    cfFlexDirection: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'column',
                      },
                    },
                    cfFlexReverse: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    cfFlexWrap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'nowrap',
                      },
                    },
                    cfBorder: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px solid rgba(0, 0, 0, 0)',
                      },
                    },
                    cfGap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px',
                      },
                    },
                    cfHyperlink: {
                      type: 'UnboundValue',
                      key: 'ICrX3vs',
                    },
                    cfOpenInNewTab: {
                      type: 'UnboundValue',
                      key: 'bAIeQt5',
                    },
                    cfBorderRadius: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px',
                      },
                    },
                    cfBackgroundImageUrl: {
                      type: 'UnboundValue',
                      key: 'fupk4k7',
                    },
                    cfBackgroundImageOptions: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: {
                          scaling: 'fill',
                          alignment: 'left top',
                          targetSize: '2000px',
                        },
                      },
                    },
                  },
                  children: [
                    {
                      id: 'jPGXtwTT',
                      definitionId: 'fullWidthActionBlock',
                      patternProperties: {},
                      variables: {
                        image: {
                          path: '/w3A8mGao/fields/image/~locale/fields/file/~locale',
                          type: 'BoundValue',
                        },
                        overline: {
                          path: '/XXpWcD4q/fields/actionBlockOverline/~locale',
                          type: 'BoundValue',
                        },
                        title: {
                          path: '/x7pyjFFj/fields/title/~locale',
                          type: 'BoundValue',
                        },
                        description: {
                          path: '/WIYCSsvX/fields/shortDescription/~locale',
                          type: 'BoundValue',
                        },
                        primaryButton: {
                          path: '/xSo60zbz/fields/primaryLinkRef/~locale',
                          type: 'BoundValue',
                        },
                        secondaryButton: {
                          path: '/baGfsFOR/fields/secondaryLinkRef/~locale',
                          type: 'BoundValue',
                        },
                        background: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'secondary',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                      },
                      children: [],
                    },
                  ],
                },
              ],
            }),
            buttonSection.getComponentTree(),
            columnSection.getComponentTree(),
            containerSection.getComponentTree(),
            dividerSection.getComponentTree(),
            headingSection.getComponentTree(),
            createContentfulSectionWrapper({
              name: 'Image',

              children: [
                {
                  id: 'AI1IIxgR',
                  displayName: 'Heading',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xxl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'ZJnqNzR6',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'pW9sYR0b',
                  definitionId: 'contentful-container',
                  patternProperties: {},
                  variables: {
                    cfVerticalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfHorizontalAlignment: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'center',
                      },
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfMargin: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0 0 0 0',
                      },
                    },
                    cfPadding: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0 0 0 0',
                      },
                    },
                    cfBackgroundColor: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'rgba(0, 0, 0, 0)',
                      },
                    },
                    cfWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '100%',
                      },
                    },
                    cfHeight: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '178px',
                      },
                    },
                    cfMaxWidth: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '1192px',
                      },
                    },
                    cfFlexDirection: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'row',
                        mobile: 'column',
                      },
                    },
                    cfFlexReverse: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    cfFlexWrap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'nowrap',
                      },
                    },
                    cfBorder: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px solid rgba(0, 0, 0, 0)',
                      },
                    },
                    cfGap: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px 24px',
                        mobile: '24px 24px',
                      },
                    },
                    cfHyperlink: {
                      type: 'UnboundValue',
                      key: 'Fe4Bfar',
                    },
                    cfOpenInNewTab: {
                      type: 'UnboundValue',
                      key: 'baOMaPo',
                    },
                    cfBorderRadius: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: '0px',
                      },
                    },
                    cfBackgroundImageUrl: {
                      type: 'UnboundValue',
                      key: 'KBQ3_Cb',
                    },
                    cfBackgroundImageOptions: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: {
                          scaling: 'fill',
                          alignment: 'left top',
                          targetSize: '2000px',
                        },
                      },
                    },
                  },
                  children: [
                    {
                      id: 'Jk6x2y8G',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'Idr0CiO',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'JFCnn0N',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'xbPE1--',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: '8oIklkai',
                          definitionId: 'image',
                          patternProperties: {},
                          variables: {
                            src: {
                              path: '/JtSxyKC/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            altText: {
                              key: 'KU5oIGN',
                              type: 'UnboundValue',
                            },
                            decoration: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'none',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                            cfWidth: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: '100%',
                              },
                            },
                            cfHeight: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'fit-content',
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                    {
                      id: 'K3kEoR9T',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'FHSW9Y15',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'eI0ylAC7',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'uNXnh4Ev',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: 'fSh2sEYp',
                          definitionId: 'image',
                          patternProperties: {},
                          variables: {
                            src: {
                              path: '/gxYbZM71/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            altText: {
                              key: 'm93uQB8b',
                              type: 'UnboundValue',
                            },
                            decoration: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'border',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                            cfWidth: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: '100%',
                              },
                            },
                            cfHeight: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'fit-content',
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                    {
                      id: 'N7Aakgl2',
                      definitionId: 'contentful-container',
                      patternProperties: {},
                      variables: {
                        cfVerticalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfHorizontalAlignment: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'center',
                          },
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfMargin: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfPadding: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0 0 0 0',
                          },
                        },
                        cfBackgroundColor: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'rgba(0, 0, 0, 0)',
                          },
                        },
                        cfWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '100%',
                          },
                        },
                        cfHeight: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'fit-content',
                          },
                        },
                        cfMaxWidth: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '1192px',
                          },
                        },
                        cfFlexDirection: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'column',
                          },
                        },
                        cfFlexReverse: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        cfFlexWrap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'nowrap',
                          },
                        },
                        cfBorder: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px solid rgba(0, 0, 0, 0)',
                          },
                        },
                        cfGap: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfHyperlink: {
                          type: 'UnboundValue',
                          key: 'La3LNBan',
                        },
                        cfOpenInNewTab: {
                          type: 'UnboundValue',
                          key: 'DdGHC1uP',
                        },
                        cfBorderRadius: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: '0px',
                          },
                        },
                        cfBackgroundImageUrl: {
                          type: 'UnboundValue',
                          key: 'LlO8NttI',
                        },
                        cfBackgroundImageOptions: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: {
                              scaling: 'fill',
                              alignment: 'left top',
                              targetSize: '2000px',
                            },
                          },
                        },
                      },
                      children: [
                        {
                          id: 'WRfAXA8Z',
                          definitionId: 'image',
                          patternProperties: {},
                          variables: {
                            src: {
                              path: '/6xDlDPPs/fields/file/~locale',
                              type: 'BoundValue',
                            },
                            altText: {
                              key: 'T8hhqfhy',
                              type: 'UnboundValue',
                            },
                            decoration: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'shadow',
                              },
                            },
                            cfVisibility: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: true,
                              },
                            },
                            cfWidth: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: '100%',
                              },
                            },
                            cfHeight: {
                              type: 'DesignValue',
                              valuesByBreakpoint: {
                                desktop: 'fit-content',
                              },
                            },
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            }),
            overlineSection.getComponentTree(),
            paragraphSection.getComponentTree(),
            createContentfulSectionWrapper({
              name: 'Section',

              children: [
                {
                  id: 'io9EJVj6',
                  displayName: 'Heading',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xxl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'uqryIUsQ',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'Ko7M7vnH',
                  definitionId: 'section',
                  patternProperties: {},
                  variables: {
                    background: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'patternPrimary',
                      },
                    },
                    padding: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'l',
                      },
                    },
                    id: {
                      key: 'wmG6IXrB1B-h8zddto0vr',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                  },
                  children: [
                    {
                      id: 'RSQxdVwv',
                      definitionId: 'heading',
                      patternProperties: {},
                      variables: {
                        visualAppearance: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'heading-xxl',
                          },
                        },
                        removeMarginBottom: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: false,
                          },
                        },
                        children: {
                          key: 'qM57cKR3J1QPDQnHDERkX',
                          type: 'UnboundValue',
                        },
                        cfVisibility: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: true,
                          },
                        },
                        cfTextAlign: {
                          type: 'DesignValue',
                          valuesByBreakpoint: {
                            desktop: 'left',
                          },
                        },
                      },
                      children: [],
                    },
                  ],
                },
              ],
            }),
            textLinkSection.getComponentTree(),
            videoSection.getComponentTree(),
            createContentfulSectionWrapper({
              name: 'Video Carousel',

              children: [
                {
                  id: '89PlsO6u',
                  definitionId: 'heading',
                  patternProperties: {},
                  variables: {
                    visualAppearance: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'heading-xxl',
                      },
                    },
                    removeMarginBottom: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: false,
                      },
                    },
                    children: {
                      key: 'zyqjhLXToMUDWS9_Gj5le',
                      type: 'UnboundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                    cfTextAlign: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: 'left',
                      },
                    },
                  },
                  children: [],
                },
                {
                  id: 'CzL11C45',
                  definitionId: 'carousel-video',
                  patternProperties: {},
                  variables: {
                    slides: {
                      path: '/9g-7kZ472XQBkhnml-mZ-/fields/slides/~locale',
                      type: 'BoundValue',
                    },
                    cfVisibility: {
                      type: 'DesignValue',
                      valuesByBreakpoint: {
                        desktop: true,
                      },
                    },
                  },
                  children: [],
                },
              ],
            }),
          ],
        },
      },
      dataSource: {
        'en-US': {
          JtSxyKC: {
            sys: {
              id: '6fdNRFZbNXpiXQd6v7fHen',
              type: 'Link',
              linkType: 'Asset',
            },
          },
          '0HkUraow': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '0TXnLT0j': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '0Uc1jnt8': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '1V2S6k5O': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '289w042P': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '3xRBhtEN': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '4rTEErM8': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '5gQSSrFE': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '6xDlDPPs': {
            sys: {
              id: '6fdNRFZbNXpiXQd6v7fHen',
              type: 'Link',
              linkType: 'Asset',
            },
          },
          '7Gxx550Y': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '8W24TK7L': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '9VSvsbCf': {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          D06vmzVo: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          DXDrLIKT: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          EGqljg4x: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          FbSNI62I: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          Gac8HyiL: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          L1oQ0Cfn: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          L4ppraxB: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          MKnXMzs0: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          MdJaRWGZ: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          NQABxHSW: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          NqrmKrUA: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          OBu7LBgD: {
            sys: {
              id: '4SDvKKtx0qpCDwFTizoPVx',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          OkAdGTNN: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          P3w0MI3x: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          PkMzRu3l: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          S9wdCChd: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          TBoKgmUE: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          TDy6kSns: {
            sys: {
              id: '4SDvKKtx0qpCDwFTizoPVx',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          Ura63qS4: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          VHT0F26i: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          WIYCSsvX: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          XC0Orztn: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          XXpWcD4q: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          XvAA9yze: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          baGfsFOR: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          btGygYlg: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          d2JuVKZQ: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          eV4HBBLe: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          eeVAmXO7: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          f5guroL4: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          gxYbZM71: {
            sys: {
              id: '6fdNRFZbNXpiXQd6v7fHen',
              type: 'Link',
              linkType: 'Asset',
            },
          },
          hbWAEPUa: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          iKuwF5UL: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          jgZPQ2f4: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          k5eX10Tv: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          lnB5pwJz: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          o5ZyffFl: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          o8e0EuB2: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          pnEVNJEY: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          q64yPb2d: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          qUW7SuUq: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          qj8MdFqk: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          sCyp4umt: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          sOCuihY3: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          tgGNSw4W: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          tqX7SCKc: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          uyYAAfql: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          w3A8mGao: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          wf6Nfy0h: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          x7pyjFFj: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          xSo60zbz: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          zibXm2hu: {
            sys: {
              id: '7Gumifs6ZTcj2G02BUoqFz',
              type: 'Link',
              linkType: 'Entry',
            },
          },
          '9g-7kZ472XQBkhnml-mZ-': {
            sys: {
              id: '20rQYDvS9V3fnwtMyAW0m4',
              type: 'Link',
              linkType: 'Entry',
            },
          },
        },
      },
      unboundValues: {
        'en-US': {
          ...unboundValues,
          '-KqdBQBCJexO6AUlN6Hdk': {
            value: 'Overline',
          },
          '-hiP47xkS8H9dfmgslbdh': {},
          '-izis13YUPq4WCazZckUr': {},
          '08mxl1BGFzTbKwyQDG6DD': {},
          '0BYMXHkY': {
            value: 'Full Width Action Block',
          },
          '0v9inr8Fpqnw8F8ElhUQT': {},
          '18Loxedj': {
            value: false,
          },
          '1O9vd7afmvcqJPb-Hst2m': {
            value: 'Heading',
          },
          '1VT4PEqW': {},
          '1eCExq2WLGpJwNbRFYPCg': {
            value: 'Overline Primary Medium',
          },
          '1g7RleiK': {
            value: false,
          },
          '204Ys74QveR6n_DzcowIB': {
            value:
              'This page is for engineering to test the integration between Contentful and Code.org. Please do not modify this page unless part of the engineering group.',
          },
          '2PSTJ_DqEZxNVxIpr_H8t': {
            value: false,
          },
          '2T84aGT0sd1wyPrlXpm_v': {
            value: false,
          },
          '36YfTgYM': {
            value: '',
          },
          '3BFpKy2b749t3Z0j19D9a': {
            value: 'Right aligned',
          },
          '3kOq2u6E': {},
          '46SVVu7SVI_27igWB64S2': {},
          '4GGacxRsnhMslE0UcSJ97': {},
          '4fZ-pGgFlP7R6tach397W': {
            value: 'Paragraph',
          },
          '5OJDXQCx': {},
          '5OKBDu4C': {},
          '5S0WDaNvwkgyaaXOaPShS': {},
          '5rKwB2lO': {
            value: '',
          },
          '5wXRsLJn': {},
          '6AjZi52JdcRm7jrVI6Sal': {},
          '6dweZgN5': {
            value: false,
          },
          '6ktx3JHv': {
            value: 'about:blank',
          },
          '6lSOjmKa': {
            value: false,
          },
          '6pLrv7NC': {
            value: false,
          },
          '6znvK3h': {},
          '7954gvrQ': {},
          '7Cj0SIqV': {
            value:
              'Right Aligned: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          },
          '7PWBeER6': {
            value: 'External Button',
          },
          '7SxgQMWi': {
            value: false,
          },
          '7W1Qi2iLcCJo1S5FoTklH': {},
          '7cjXZUvesiyPKoMJZUraJ': {},
          '7tPoQs29dgRnwZubnGEms': {
            value: 'Column',
          },
          '8LDk6KB4': {
            value: '',
          },
          '8tSwOMzw': {
            value: 'With fallback',
          },
          '92O5l7Xr': {
            value: '/ping',
          },
          AKTPfVrs: {},
          Aw5CTnlT: {},
          B1N7IJY8: {
            value: 'Right Aligned Button',
          },
          'BHheSJr0-DKiQ2KV6nT9b': {},
          BS3VZDDS: {
            value: '',
          },
          C0ZnFmnY1RLOEnDrehvP2: {
            value: '',
          },
          C2eh9B38: {
            value: 'Secondary Black Button',
          },
          C820WrIq2MCzdJJuM4oiI: {
            value: 'Left Aligned Button\n\n',
          },
          DEtHVoSd: {
            value: 'Link',
          },
          DdGHC1uP: {
            value: false,
          },
          ERvTdJXH: {
            value: 'Internal Link XS',
          },
          'EX79hiIuw8_2Ria-2tQkj': {
            value: 'Internal Link S',
          },
          Enm2i9xxpZNHnLD0K1fpI: {
            value: false,
          },
          FHSW9Y15: {
            value: '',
          },
          FW4Y2V_ECnApbkzqsUbE_: {
            value: '',
          },
          'FXuaWYztKfKJWXod-xTpd': {
            value: '',
          },
          FdwpeSt6bn8LpSSV0pbtv: {
            value: '',
          },
          Fe4Bfar: {
            value: '',
          },
          G5Iyv0YkdyGi6tu6eXCln: {
            value: '',
          },
          GGSUj7T7: {
            value: '',
          },
          GQ_meekKAizcWHfsUxUEe: {
            value: '',
          },
          Gs0XOO8d5eKpR2MQKAm8x: {
            value: false,
          },
          HkS6sKTzMLaB2xX5evo7Z: {
            value: 'nKIu9yen5nc',
          },
          IAwsxK7N: {
            value: 'With all content',
          },
          ICrX3vs: {
            value: '',
          },
          IRGGNCsc: {
            value: 'With all content ',
          },
          Icqsu9JA: {
            value: 'about:blank',
          },
          Idr0CiO: {
            value: '',
          },
          'Is-QBxBKRvrSLF5e6k8WM': {
            value: 'Default Drop In',
          },
          IsyZ4DkUsAKB5tReDxD1q: {
            value: '',
          },
          IuXKDn7Q: {},
          J8z7Qo1L: {
            value: 'Heading 4',
          },
          JFCnn0N: {
            value: false,
          },
          'JVQR-tfdKQE3G3iyEGd3d': {
            value: false,
          },
          JjsxkEPq: {
            value: '',
          },
          Jr3_e_AP72m0PxsOOIzg6: {},
          JwQMnloG: {
            value: '/ping',
          },
          K0KxrTFkzU8KmLwowRzGo: {
            value: 'Video',
          },
          KBQ3_Cb: {},
          'KGUo-pbAmZDeE_onnJmeM': {},
          KU5oIGN: {
            value: '',
          },
          L6HfuP4oVMvQ_xwZqzQc7: {},
          'L7sMSlH7Y_F-LSZzoglh6': {
            value: '/ping',
          },
          LC3Zogrcyn7ko8fQM4Nqs: {},
          LY3fwrGF: {
            value: '',
          },
          La3LNBan: {
            value: '',
          },
          LlO8NttI: {},
          Lu9xfUr8: {
            value: 'Overline Secondary Small',
          },
          M6UV6klE: {
            value: 'Math Symbols: 1 + 2 − 2 × 5 ≠ 0',
          },
          M8tEEkEnbhdKkkzZSTBRd: {
            value: 'Center',
          },
          MJmfC3N564sY154aazOqg: {
            value: false,
          },
          Mo4S1GHf: {},
          NhzwQJMw: {
            value: 'https://code.org',
          },
          NspNpe6v: {
            value: '',
          },
          OmmiviO_PnQgExsnIQWG2: {},
          Oor1uCW9: {},
          Ov2KaMlI: {
            value: '',
          },
          P8671GK5: {
            value: false,
          },
          'PFl39glIFt1TSFfKzC2-Z': {
            value: false,
          },
          PWEyhxSkmxTGO951MgkM_: {},
          PeTivMde: {
            value: 'Link',
          },
          Q8S_CqSaOYMVwDMKlR3jr: {},
          'QcBjAcsD-IhgBz5nwADMs': {
            value:
              'Left Aligned: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          },
          Qkx4iDxSBpSpgdmwqZhqM: {},
          R0C45WqvjfIgrCLvhJPSB: {
            value: 'All the things UI Integration Test',
          },
          REWmmbf2LKIIYFlPSLTFy: {
            value: '',
          },
          RLcvWIOm: {
            value: false,
          },
          'ReHgFwZk-BHm9gAcpYww7': {},
          Ry2EmrfLWGKKxHzN2NKK2: {
            value: '',
          },
          SGrm6TeM: {},
          SHqULneHIzJfEOPmKB4fN: {},
          SQ455se7uXiseEPWsgHS4: {},
          T8hhqfhy: {
            value: 'Image with shadow',
          },
          TC9267aF: {},
          TPp4t_zOnGYYUCQCHczCd: {},
          TSFzv7B9: {
            value: 'Paragraph Secondary Medium',
          },
          Tgg1s2D2: {
            value: 'Three across',
          },
          TnZjwBke: {
            value: false,
          },
          UnsmjdqCrmrO4Trj1nuzn: {},
          V8YHlFRp: {
            value: 'Container',
          },
          VByM26Dq: {},
          Vbrs8KDX: {
            value: '',
          },
          WWIhqOfAkCpzLs6ZV3raO: {
            value:
              'https://videos.code.org/social/what-most-schools-dont-teach.mp4',
          },
          WasTGlxj: {
            value: 'Centered Button',
          },
          X4E1tjHt: {
            value: '',
          },
          XeBIpyktpVkLEy45skA7l: {
            value: '',
          },
          Xsx7dtxc: {
            value: 'With external link buttons',
          },
          'Xyg0Z-kNXwLoS7tUWKWe4': {},
          YKCODw2Gj_YPupxeh2ON7: {
            value: false,
          },
          'YfZC6-Hmjrj20Loaq6-FT': {},
          ZClRveUvVcQjBrlrDvtm6: {
            value: false,
          },
          ZJnqNzR6: {
            value: 'Image',
          },
          ZUNHb1QCXiLvRUG9taeN8: {},
          ZdTFBVAL: {
            value: false,
          },
          ZpinQk1s: {},
          _byo2Rxu56P0ZbFndME7R: {},
          aDgvlZ6op1gK3MYklFgKX: {
            value: false,
          },
          'aL5ooU7rF-Cfhi4sEFovm': {},
          aPeti3xV: {
            value: false,
          },
          aRYsNWTbO_8er8D_crzl2: {},
          'aTtjH3mTVn7fMVJ-xb2nG': {},
          avmUJimV: {
            value: 'Paragraph Secondary Bold',
          },
          bAIeQt5: {
            value: false,
          },
          baOMaPo: {
            value: false,
          },
          bvkdCWAp: {
            value: 'Math',
          },
          byHQXRz8: {
            value: false,
          },
          c6Xllyd: {
            value: 'Link',
          },
          cKcaNJOJ3vHPn3yBMhHgh: {},
          d5NKAnwp: {
            value: 'Localization',
          },
          d7bQZFYP: {},
          dDFAtpAu4xTWTM3cwvHX_: {},
          dJNC5rnb: {},
          dWrBnOHy: {},
          dczpwBQS: {
            value: 'https://code.org',
          },
          eI0ylAC7: {
            value: false,
          },
          eMXbhJJO: {
            value: '',
          },
          fLRxfb9Ecsh1B9F3VCTCi: {
            value: 'Center Aligned',
          },
          fP6j0_ZupHdFnUUB_Ia5H: {},
          fbxlhQrAD8jhqeEPcb_Zc: {},
          fupk4k7: {},
          fvbdsWsT: {
            value: 'Divider',
          },
          g1GOPI4w: {
            value: '',
          },
          gwYa67z7: {},
          gyjlsYtE: {
            value: '',
          },
          h1C3gxnYgR9u4L8CDjo3D: {},
          hAGyY1mh: {
            value: false,
          },
          hEDkMrEi: {
            value: false,
          },
          hRhxjrt3N9VU1NMl2QRh3: {
            value:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi blandit orci nec iaculis ullamcorper. Morbi blandit bibendum nibh, at auctor metus consequat sit amet. Fusce sodales nisi dolor. Nam at lorem mattis, aliquam elit ut, facilisis nunc. Donec mollis sollicitudin dolor, sed blandit diam accumsan id. Proin suscipit lacus et elit molestie dignissim. Aliquam nisi velit, lobortis ut porta volutpat, aliquam at arcu.\n\nDonec nunc sapien, mattis congue pulvinar vel, sollicitudin vel sapien. Morbi quis pulvinar nulla. Cras ac sem ante. Sed eu interdum sapien, id fermentum nunc. Donec vehicula ut erat eget vehicula. Ut euismod sem ut nisl vehicula sagittis. Suspendisse mattis justo elit, eu sagittis lorem mattis id. Sed sit amet scelerisque magna, nec dictum ex. Praesent tincidunt massa sed laoreet posuere. Sed efficitur, justo id pharetra pretium, dui turpis convallis metus, eleifend euismod risus nibh vel enim. Vestibulum molestie justo eget ligula posuere bibendum.',
          },
          hXGMAy_S9tLUATPGf5Zry: {
            value: 'Primary Button',
          },
          'i-CBt91tEkCmZHGzb85xW': {
            value:
              'Each Section in this page is composed of a unique CMS component. Add edge case scenarios to this section that you would like tested.',
          },
          ilVAO2EaIUZ0lA5ewKtJI: {
            value: '',
          },
          'is6sJNT7GqG8M-aved8xI': {
            value: '',
          },
          jNBarAZvvExnBW0FccdXk: {
            value: 'Video with Fallback',
          },
          jUIXS8jmgg7N0QAzowItS: {},
          jjrfcFBAJ5AspsCCOO2xO: {},
          joR8i87odA3R7JLfvzfCw: {
            value: 'Paragraph Body XS',
          },
          k2x0YIUxjaXNGJxbL2xFl: {},
          k7cc4DWU: {
            value: 'Heading 3',
          },
          koY0ISJaPzBIDXqlznL0H: {},
          l2UKloU9: {
            value:
              'Center Aligned: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
          },
          lIsy1GAr: {
            value: 'Internal Link M',
          },
          lP2xlEiG4Ur15q_7otUZo: {},
          lTlx2Ck5: {
            value: '',
          },
          lgABBbaFeSQbvkWefAwA5: {},
          lgGRRfq5zcVueL3yrxoh9: {},
          lzUBFGk045vgYma7aXjur: {
            value: 'Button',
          },
          'm4M7qU_VBvy3rP_lT7V-J': {
            value: false,
          },
          'm5B_-isX7sffstDtAWTWi': {
            value: '/ping',
          },
          m93uQB8b: {
            value: 'Image with border',
          },
          mCXPy8Sk: {
            value: 'Heading 5',
          },
          mFzwT6KHtA9j1FYYT0dvh: {},
          mI3808f6: {
            value: false,
          },
          mJJmzfsA: {},
          mp03r8eT: {},
          n0l5OgPZtTMQsbZ3GNKiR: {},
          nBnzzrrg: {
            value: 'External Link L',
          },
          nM4Jx3EajfRTuaILiaRh1: {
            value: '',
          },
          nOVfFtTI: {
            value: 'Without fallback',
          },
          oPc8lo0F: {},
          'op-Qp-gdr8uf9I9-WXcdr': {
            value: 'Left',
          },
          ppcJTpQrNNmiFzRpoKuk7: {
            value: 'Heading 2',
          },
          qM57cKR3J1QPDQnHDERkX: {
            value: 'Section - Pattern Teal',
          },
          qQFZT2Ct: {
            value: 'Localization - Long Text',
          },
          qg0XcsQhQK20HDFZctW0_: {},
          qhMtsAXw: {
            value: false,
          },
          rMO0UpAm: {
            value: 'Heading 6',
          },
          rXgI4Mvr: {
            value: 'With secondary background',
          },
          rpWptElOUBNuPNQXKsjMo: {
            value: false,
          },
          rqSvSSLH: {
            value: '',
          },
          sQZaBqbWsJUIR6cGO4R7w: {},
          sU117GEiAbQOFMhXtxs7a: {},
          sfjHI0Y3PWcC6rm8lYfap: {
            value: 'Right',
          },
          tgfqSQxT: {
            value: 'Overline Primary Large',
          },
          uML982xB: {
            value: 'Short Text',
          },
          uMhUcdTnHh9zPBFXifvKq: {
            value: 'https://code.org',
          },
          uNXnh4Ev: {},
          uTgCIxZc: {
            value: 'Video without Fallback',
          },
          uqryIUsQ: {
            value: 'Section - Pattern Dark',
          },
          uyEiVj6ofeCIPPsOLAAcg: {
            value: 'Left Aligned',
          },
          v6A0d7WI: {
            value: 'With secondary background',
          },
          vNAYFsDQ: {
            value: 'nKIu9yen5nc',
          },
          vNE31MABBbkMScnKL4BMU: {},
          vYKqsBQ5xXnkpbPCxrnKb: {},
          vl7mGMNk: {
            value: false,
          },
          vy3Z4qCBqa2yM79waYyZx: {},
          'wmG6IXrB1B-h8zddto0vr': {},
          ws1Q0E4GP0WIGLne79bIY: {
            value: 'Text Link',
          },
          xaSe4Rjf: {
            value: '',
          },
          'xbPE1--': {},
          yzVjh0Ni: {
            value: '',
          },
          z9iS8tow: {
            value: false,
          },
          zB9624m9: {
            value: 'Action Block',
          },
          zQNTpdsD: {
            value: '/ping',
          },
          zcuX6eaiBiUs3mCXjHYq2: {},
          zkx5V9ed: {},
          zyqjhLXToMUDWS9_Gj5le: {
            value: 'Video Carousel',
          },
        },
      },
      seoMetadata: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: '1hQeP2bdFuIFm5kuYeefew',
          },
        },
      },
    },
  });

  console.log(`Entry created with ID: ${entry.sys.id}`);
}

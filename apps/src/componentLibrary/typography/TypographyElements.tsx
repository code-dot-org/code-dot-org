import React from 'react';

import {SemanticTag, VisualAppearance, TypographyElementProps} from './types';
import Typography from './Typography';

interface TypographyElementToGenerateTemplate {
  displayName: string;
  semanticTag: SemanticTag;
  defaultVisualAppearance: VisualAppearance;
}
const typographyElementsToGenerate: TypographyElementToGenerateTemplate[] = [
  {
    displayName: 'Heading1',
    semanticTag: 'h1',
    defaultVisualAppearance: 'heading-xxl',
  },
  {
    displayName: 'Heading2',
    semanticTag: 'h2',
    defaultVisualAppearance: 'heading-xl',
  },
  {
    displayName: 'Heading3',
    semanticTag: 'h3',
    defaultVisualAppearance: 'heading-lg',
  },
  {
    displayName: 'Heading4',
    semanticTag: 'h4',
    defaultVisualAppearance: 'heading-md',
  },
  {
    displayName: 'Heading5',
    semanticTag: 'h5',
    defaultVisualAppearance: 'heading-sm',
  },
  {
    displayName: 'Heading6',
    semanticTag: 'h6',
    defaultVisualAppearance: 'heading-xs',
  },
  {
    displayName: 'BodyOneText',
    semanticTag: 'p',
    defaultVisualAppearance: 'body-one',
  },
  {
    displayName: 'BodyTwoText',
    semanticTag: 'p',
    defaultVisualAppearance: 'body-two',
  },
  {
    displayName: 'BodyThreeText',
    semanticTag: 'p',
    defaultVisualAppearance: 'body-three',
  },
  {
    displayName: 'BodyFourText',
    semanticTag: 'p',
    defaultVisualAppearance: 'body-four',
  },
  {
    displayName: 'OverlineOneText',
    semanticTag: 'p',
    defaultVisualAppearance: 'overline-one',
  },
  {
    displayName: 'OverlineTwoText',
    semanticTag: 'p',
    defaultVisualAppearance: 'overline-two',
  },
  {
    displayName: 'OverlineThreeText',
    semanticTag: 'p',
    defaultVisualAppearance: 'overline-three',
  },
  {displayName: 'EmText', semanticTag: 'em', defaultVisualAppearance: 'em'},
  {
    displayName: 'StrongText',
    semanticTag: 'strong',
    defaultVisualAppearance: 'strong',
  },
  {
    displayName: 'ExtraStrongText',
    semanticTag: 'strong',
    defaultVisualAppearance: 'extra-strong',
  },
  {
    displayName: 'Figcaption',
    semanticTag: 'figcaption',
    defaultVisualAppearance: 'figcaption',
  },
];

// Generates a set of components(Typography Elements) based on the data in typographyElementsToGenerate
const generateComponents = (
  componentsToGenerate: TypographyElementToGenerateTemplate[]
): {[key: string]: React.FunctionComponent<TypographyElementProps>} =>
  componentsToGenerate.reduce((acc, componentTemplateData) => {
    const {displayName, semanticTag, defaultVisualAppearance} =
      componentTemplateData;

    const TypographyElement: React.FunctionComponent<
      TypographyElementProps
    > = componentProps => {
      const {visualAppearance, children, id, className, style} = componentProps;

      return (
        <Typography
          semanticTag={semanticTag}
          visualAppearance={visualAppearance || defaultVisualAppearance}
          id={id}
          className={className}
          style={style}
        >
          {children}
        </Typography>
      );
    };
    TypographyElement.displayName = displayName;
    return {...acc, [displayName]: TypographyElement};
  }, {});

export const {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  BodyOneText,
  BodyTwoText,
  BodyThreeText,
  BodyFourText,
  OverlineOneText,
  OverlineTwoText,
  OverlineThreeText,
  EmText,
  StrongText,
  ExtraStrongText,
  Figcaption,
} = generateComponents(typographyElementsToGenerate);

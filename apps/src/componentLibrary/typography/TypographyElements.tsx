import React from 'react';
import Typography from './Typography';
import {SemanticTag, VisualAppearance, TypographyElementProps} from './types';

interface TypographyElementToGenerateTemplate {
  displayName: string;
  semanticTag: SemanticTag;
  defaultVisualAppearance?: VisualAppearance;
}
const typographyElementsToGenerate: TypographyElementToGenerateTemplate[] = [
  {displayName: 'Heading1', semanticTag: 'h1'},
  {displayName: 'Heading2', semanticTag: 'h2'},
  {displayName: 'Heading3', semanticTag: 'h3'},
  {displayName: 'Heading4', semanticTag: 'h4'},
  {displayName: 'Heading5', semanticTag: 'h5'},
  {displayName: 'Heading6', semanticTag: 'h6'},
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
    displayName: 'OverlineText',
    semanticTag: 'p',
    defaultVisualAppearance: 'overline',
  },
  {displayName: 'EmText', semanticTag: 'em'},
  {displayName: 'StrongText', semanticTag: 'strong'},
  {displayName: 'Figcaption', semanticTag: 'figcaption'},
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
      const {visualAppearance, children, className, style} = componentProps;

      return (
        <Typography
          semanticTag={semanticTag}
          visualAppearance={visualAppearance || defaultVisualAppearance}
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
  OverlineText,
  EmText,
  StrongText,
  Figcaption,
} = generateComponents(typographyElementsToGenerate);

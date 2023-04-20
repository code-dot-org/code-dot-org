import React from 'react';
import Typography from './index';
import {
  SemanticTag,
  VisualApproach,
  SpecificTypographyElementProps
} from './types';

interface SpecificTypographyElementToGenerateTemplate {
  displayName: string;
  semanticTag: SemanticTag;
  defaultVisualApproach?: VisualApproach;
}
const specificTypographyComponentsToGenerate: SpecificTypographyElementToGenerateTemplate[] =
  [
    {displayName: 'Heading1', semanticTag: 'h1'},
    {displayName: 'Heading2', semanticTag: 'h2'},
    {displayName: 'Heading3', semanticTag: 'h3'},
    {displayName: 'Heading4', semanticTag: 'h4'},
    {displayName: 'Heading5', semanticTag: 'h5'},
    {displayName: 'Heading6', semanticTag: 'h6'},
    {
      displayName: 'BodyOneText',
      semanticTag: 'p',
      defaultVisualApproach: 'body-one'
    },
    {
      displayName: 'BodyTwoText',
      semanticTag: 'p',
      defaultVisualApproach: 'body-two'
    },
    {
      displayName: 'OverlineText',
      semanticTag: 'p',
      defaultVisualApproach: 'overline'
    },
    {displayName: 'EmText', semanticTag: 'em'},
    {displayName: 'StrongText', semanticTag: 'strong'},
    {displayName: 'Figcaption', semanticTag: 'figcaption'}
  ];

function generateSpecificTypographyComponents(
  componentsToGenerate: SpecificTypographyElementToGenerateTemplate[]
): {[key: string]: React.FunctionComponent<SpecificTypographyElementProps>} {
  return componentsToGenerate.reduce((acc, componentTemplateData) => {
    const {displayName, semanticTag, defaultVisualApproach} =
      componentTemplateData;

    const SpecificTypographyComponent: React.FunctionComponent<
      SpecificTypographyElementProps
    > = componentProps => {
      const {visualApproach, children, className, style} = componentProps;

      return (
        <Typography
          semanticTag={semanticTag}
          visualApproach={visualApproach || defaultVisualApproach}
          className={className}
          style={style}
        >
          {children}
        </Typography>
      );
    };
    SpecificTypographyComponent.displayName = displayName;
    return {...acc, [displayName]: SpecificTypographyComponent};
  }, {});
}

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
  Figcaption
} = generateSpecificTypographyComponents(
  specificTypographyComponentsToGenerate
);

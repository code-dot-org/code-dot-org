import {TypographyVariant} from '@mui/material/styles';
import TypographyMui from '@mui/material/Typography';
import classnames from 'classnames';
import {memo, ReactNode, CSSProperties} from 'react';

import {SemanticTag, VisualAppearance} from './types';

import moduleStyles from '@code-dot-org/component-library-styles/typography.module.scss';

export interface TypographyProps {
  /** Html tag to use for the typography element */
  semanticTag: SemanticTag;
  /** Scss module classname to use for the typography element */
  visualAppearance: VisualAppearance;
  /** Additional classnames to apply to the typography element */
  className?: string;
  /** Inline styles to apply to the typography element */
  style?: CSSProperties;
  /** Text or other elements to render inside the typography element */
  children: ReactNode;
  /** Typography element id */
  id?: string;
  /** Typography without margins */
  noMargin?: boolean;
}

const Typography: React.FunctionComponent<TypographyProps> = ({
  semanticTag,
  visualAppearance,
  children,
  className,
  style,
  id,
  noMargin = false,
  ...props
}) => {
  /*
  TODO:
    - Figure out how to handle strong
    - How we want to map the styles onto things
    - Ask stephen if anything needs to be done to set up the theming on a platform level
  */

  // Maps component-library VisualAppearance values with
  // MUI Typography `variant` prop values.
  const visualAppearanceToVariantMap: Record<
    VisualAppearance,
    TypographyVariant
  > = {
    'heading-xxl': 'h1',
    'heading-xl': 'h2',
    'heading-lg': 'h3',
    'heading-md': 'h4',
    'heading-sm': 'h5',
    'heading-xs': 'h6',
    'body-one': 'body1',
    'body-two': 'body2',
    strong: 'body1',
    em: 'body1',
    figcaption: 'caption',
    'body-three': 'body2',
    'body-four': 'body2',
    'overline-one': 'overline',
    'overline-two': 'overline',
    'overline-three': 'overline',
    'extra-strong': 'body1',
  };

  return (
    <TypographyMui
      id={id}
      className={classnames(
        moduleStyles[visualAppearance],
        {
          [moduleStyles['no-margin']]: noMargin,
          [moduleStyles.wrapper]: semanticTag === 'div',
        },
        className,
      )}
      sx={style}
      {...props}
      component={semanticTag}
      variant={visualAppearanceToVariantMap[visualAppearance]}
    >
      {children}
    </TypographyMui>
  );
};

export default memo(Typography);

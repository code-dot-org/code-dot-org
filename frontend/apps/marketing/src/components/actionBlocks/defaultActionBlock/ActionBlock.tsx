// import {EntryFields} from 'contentful';

import DSCOActionBlock from '@code-dot-org/component-library/actionBlock';

export type ActionBlockContentfulProps = {
  detailLabel?: string;
  detailDescription?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  primaryButtonAriaLabel?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  secondaryButtonAriaLabel?: string;
};

const ActionBlock: React.FC<ActionBlockContentfulProps> = ({
  detailLabel,
  detailDescription,
  primaryButtonText,
  primaryButtonHref,
  primaryButtonAriaLabel,
  secondaryButtonText,
  secondaryButtonHref,
  secondaryButtonAriaLabel,
  ...props
}) => {
  return (
    <DSCOActionBlock
      {...props}
      details={
        detailDescription
          ? {
              label: detailLabel || '',
              description: detailDescription || '',
            }
          : undefined
      }
      primaryButton={
        primaryButtonText
          ? {
              text: primaryButtonText || 'Primary button',
              href: primaryButtonHref || '#',
              ariaLabel: primaryButtonAriaLabel || '',
            }
          : undefined
      }
      secondaryButton={
        secondaryButtonText
          ? {
              text: secondaryButtonText || 'Secondary button',
              href: secondaryButtonHref || '#',
              ariaLabel: secondaryButtonAriaLabel || '',
            }
          : undefined
      }
    />
  );
};

export default ActionBlock;

import {EntryFields} from 'contentful';

import DSCOActionBlock from '@code-dot-org/component-library/actionBlock';

export type ActionBlockContentfulProps = {
  primaryButton: {
    fields: {
      label: EntryFields.Text;
      primaryTarget: EntryFields.Text;
      ariaLabel: EntryFields.Text;
    };
  };
  secondaryButton: {
    fields: {
      label: EntryFields.Text;
      primaryTarget: EntryFields.Text;
      ariaLabel: EntryFields.Text;
    };
  };
};

const ActionBlock: React.FC<ActionBlockContentfulProps> = ({
  primaryButton,
  secondaryButton,
  ...props
}) => {
  const actionBlockProps = {
    primaryButton: {
      label: primaryButton?.fields?.label,
      primaryTarget: primaryButton?.fields?.primaryTarget,
      ariaLabel: primaryButton?.fields?.ariaLabel,
    },
    secondaryButton: {
      label: secondaryButton?.fields?.label,
      primaryTarget: secondaryButton?.fields?.primaryTarget,
      ariaLabel: secondaryButton?.fields?.ariaLabel,
    },
  };

  return (
    <DSCOActionBlock
      {...props}
      primaryButton={
        actionBlockProps.primaryButton.label
          ? {
              text: actionBlockProps.primaryButton.label || 'Primary button',
              href: actionBlockProps.primaryButton.primaryTarget || '#',
              ariaLabel: actionBlockProps.primaryButton.ariaLabel || '',
            }
          : undefined
      }
      secondaryButton={
        actionBlockProps.secondaryButton.label
          ? {
              text:
                actionBlockProps.secondaryButton.label || 'Secondary button',
              href: actionBlockProps.secondaryButton.primaryTarget || '#',
              ariaLabel: actionBlockProps.secondaryButton.ariaLabel || '',
            }
          : undefined
      }
    />
  );
};

export default ActionBlock;

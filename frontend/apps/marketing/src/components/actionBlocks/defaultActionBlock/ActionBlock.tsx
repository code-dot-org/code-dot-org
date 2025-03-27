import {BaseEntry, EntryFields} from 'contentful';

import DSCOActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock';

export type ActionBlockContentfulProps = ActionBlockProps & {
  overline: EntryFields.Text;
  title: EntryFields.Text;
  description: EntryFields.Text;
  image: BaseEntry & {
    fields: {
      description?: EntryFields.Text;
      title?: EntryFields.Text;
      file: {url: EntryFields.Text};
    };
  };
  primaryButton: BaseEntry & {
    fields: {
      label: EntryFields.Text;
      primaryTarget: EntryFields.Text;
      ariaLabel: EntryFields.Text;
    };
  };
  secondaryButton: BaseEntry & {
    fields: {
      label: EntryFields.Text;
      primaryTarget: EntryFields.Text;
      ariaLabel: EntryFields.Text;
    };
  };
  background: EntryFields.Text;
};

const ActionBlock: React.FC<ActionBlockContentfulProps> = ({
  overline,
  title,
  description,
  image,
  primaryButton,
  secondaryButton,
  background,
}) => (
  <DSCOActionBlock
    overline={overline}
    title={title}
    description={description}
    image={image}
    primaryButton={
      primaryButton?.fields?.label
        ? {
            text: primaryButton.fields.label,
            href: primaryButton.fields.primaryTarget || '#',
            ariaLabel: primaryButton.fields.ariaLabel || '',
          }
        : undefined
    }
    secondaryButton={
      secondaryButton?.fields?.label
        ? {
            text: secondaryButton.fields.label,
            href: secondaryButton.fields.primaryTarget || '#',
            ariaLabel: secondaryButton.fields.ariaLabel || '',
          }
        : undefined
    }
    background={background}
  />
);

export default ActionBlock;

import {BaseEntry, EntryFields} from 'contentful';

import DSCOFullWidthActionBlock, {
  ActionBlockProps,
} from '@code-dot-org/component-library/actionBlock/fullWidthActionBlock';

export type FullWidthActionBlockContentfulProps = ActionBlockProps & {
  image: BaseEntry & {
    fields: {
      description?: EntryFields.Text;
      title?: EntryFields.Text;
      file: {url: EntryFields.Text};
    };
  };
  overline: EntryFields.Text;
  title: EntryFields.Text;
  description: EntryFields.Text;
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

const FullWidthActionBlock: React.FC<FullWidthActionBlockContentfulProps> = ({
  image,
  overline,
  title,
  description,
  primaryButton,
  secondaryButton,
  background,
}) => (
  <DSCOFullWidthActionBlock
    image={image}
    overline={overline}
    title={title}
    description={description}
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

export default FullWidthActionBlock;

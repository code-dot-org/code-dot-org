export const commonRichTextSpacingStyles = {
  margin: '1rem 0 0',
  '&:first-child, &:empty': {
    margin: 0,
  },
};

export const richTextContainerStyles = {
  '& > br:last-child': {
    display: 'none',
  },
};

export const richTextParagraphStyles = {
  whiteSpace: 'pre-wrap',
  ...commonRichTextSpacingStyles,
};

export const richTextTableStyles = {
  ...commonRichTextSpacingStyles,
};

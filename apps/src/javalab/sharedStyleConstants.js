const headerSectionStyles = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  overflowX: 'visible'
};

// Styles used across Javalab panels to have a left aligned,
// centered (typically a title), and right aligned sections
// of equal widths.
export const headerSectionsStyles = {
  headerSectionLeft: {
    ...headerSectionStyles,
    justifyContent: 'flex-start'
  },
  headerSectionCenter: {
    ...headerSectionStyles,
    justifyContent: 'center'
  },
  headerSectionRight: {
    ...headerSectionStyles,
    justifyContent: 'flex-end'
  }
};

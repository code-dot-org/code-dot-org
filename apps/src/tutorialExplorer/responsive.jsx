function getContainerWidth(windowWidth) {
  if (windowWidth >= 1200) {
    return 1170;
  } else {
    return "95%";
  }
}

function getItemWidthVariable(widths, windowWidth) {
  var width;
  if (windowWidth >= 1024) {
    if (widths.lg) {
      width = widths.lg;
    } else if (widths.md) {
       width = widths.md;
    } else if (widths.sm) {
       width = widths.sm;
    } else {
      width = widths.xs;
    }
  } else if (windowWidth >= 800) {
    if (widths.md) {
       width = widths.md;
    } else if (widths.sm) {
       width = widths.sm;
    } else {
      width = widths.xs;
    }
  } else if (windowWidth >= 650) {
    if (widths.sm) {
       width = widths.sm;
    } else {
      width = widths.xs;
    }
  } else if (widths.xs) {
    width = widths.xs;
  }

  if (width) {
    return `${width}%`;
  }
}

export { getContainerWidth, getItemWidthVariable };

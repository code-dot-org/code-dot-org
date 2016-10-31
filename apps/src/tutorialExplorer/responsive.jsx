function getContainerWidth(windowWidth) {
  if (windowWidth >= 1200) {
    return 1170;
  } else if (windowWidth >= 992) {
    return 970;
  } else if (windowWidth >= 768) {
    return 750;
  } else {
    return "100%";
  }
}

function getItemWidth(itemWidth, windowWidth) {
  if (windowWidth >= 600) {
    return `${itemWidth}%`;
  } else {
    return "100%";
  }
}

function getItemWidthMobile(itemWidth, windowWidth) {
  if (windowWidth < 600) {
    return `${itemWidth}%`;
  } else {
    return "100%";
  }
}

export { getContainerWidth, getItemWidth, getItemWidthMobile };

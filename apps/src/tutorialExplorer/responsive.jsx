function getContainerWidth() {
  const windowWidth = $(window).width();

  if (windowWidth >= 1200) {
    return 1170;
  } else {
    return "97%";
  }
}

function getItemValue(values) {
  const windowWidth = $(window).width();

  var value;
  if (windowWidth >= 1024) {
    if (values.lg) {
      value = values.lg;
    } else if (values.md) {
       value = values.md;
    } else if (values.sm) {
       value = values.sm;
    } else {
      value = values.xs;
    }
  } else if (windowWidth >= 800) {
    if (values.md) {
       value = values.md;
    } else if (values.sm) {
       value = values.sm;
    } else {
      value = values.xs;
    }
  } else if (windowWidth >= 650) {
    if (values.sm) {
       value = values.sm;
    } else {
      value = values.xs;
    }
  } else if (values.xs) {
    value = values.xs;
  }

  if (value) {
    if (typeof(value) === "number") {
      return `${value}%`;
    } else if (typeof(value) === "string") {
      return value;
    }
  }
}

export { getContainerWidth, getItemValue };

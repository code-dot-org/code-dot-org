// Adds a .fa-fw class to all icon elements - used to maintain
// consistent spacing when icons have varying widths and heights.
// FontAwesome docs explains more about how this works:
// https://fontawesome.com/v5/docs/web/style/fixed-width
document.querySelectorAll("i").forEach((icon) => icon.classList.add("fa-fw"));

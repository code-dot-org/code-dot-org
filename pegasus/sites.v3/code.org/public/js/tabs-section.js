// Works with the "resources_tabs.haml" and "donate_tabs.haml" partials.
// Styles that show and hide sections are in "design-system-pegasus.scss"
// under the "div.resources-tabs" selector.

const tabs = document.querySelectorAll(".tabs-section button.tab");

tabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    // Show what element was clicked in the console (for debugging)
    // console.log(event.currentTarget);

    // Remove "active" class style from previously selected tab
    document.querySelector(".tab.active")?.classList.remove("active");

    // Add "active" class style to selected tab
    event.currentTarget.classList.add("active");

    // Hide previously selected tab's content
    document.querySelector(".content.show").classList.remove("show");

    // Show selected tab's respective content
    const selectedContent = event.currentTarget.dataset.content;
    document.querySelector(selectedContent).classList.add("show");
  });
});

// Hide the desktop or tablet/mobile version in the DOM
jQuery(document).ready(function ($) {
  var $showDesktop = $(".show-desktop");
  var $showTabletAndMobile = $(".show-tablet-and-mobile");

  var hideResponsiveTabs = function () {
    var ww = $(window).width();
    if (ww > 1023) {
      $showDesktop.add();
      $showTabletAndMobile.remove();
    } else {
      $showDesktop.remove();
      $showTabletAndMobile.add();
    }
  };
  $(window).resize(function () {
    hideResponsiveTabs();
  });
  //Fire it when the page first loads:
  hideResponsiveTabs();
});

// Hide the Programming Tools section on code.org/curriculum/computer-vision
if (document.querySelector(".hide-tab")) {
  document
    .querySelector(".hide-tab .resources-tabs button.tab.tools")
    .classList.add("hide");
  document
    .querySelector(".hide-tab .resources-tabs details.tools")
    .classList.add("hide");
}

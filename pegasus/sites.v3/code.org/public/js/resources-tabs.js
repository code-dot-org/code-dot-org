// Works with the "resources_tabs.haml" partial.
// Styles that show and hide sections are in "design-system-pegasus.scss"
// under the "div.resources-tabs" selector.

const tabs = document.querySelectorAll(".resources-tabs button.tab");

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

const windowWidth = window.innerWidth;

function reorganizeAndWrapSlides(carouselId, cardsList) {
  const carouselContainer = document.getElementById(carouselId);
  if (!carouselContainer) {
    console.error(`Carousel container with id "${carouselId}" not found.`);
    return;
  }

  const slidesContainer = carouselContainer.querySelector(".slides");
  if (!slidesContainer) {
    console.error(`Slides container not found inside the carousel.`);
    return;
  }

  const slideItems = Array.from(slidesContainer.querySelectorAll(".slide"));
  const slides = [];

  function removeBlocks(container, selector) {
    const elements = Array.from(container.querySelectorAll(selector));
    elements.forEach((block) => block.remove());

    while (elements.length > 0) {
      slides.push(elements.splice(0, cardsList));
    }
  }

  removeBlocks(carouselContainer, ".slide-content");
  removeBlocks(
    carouselContainer,
    ".video-wrapper.video-wrapper--one-col.flex-space-between"
  );

  slides.forEach((slide) => {
    const slideWrapper = document.createElement("div");
    slideWrapper.className = "slide";
    slide.forEach((slideItem) => {
      slideWrapper.appendChild(slideItem);
    });

    slidesContainer.appendChild(slideWrapper);
  });

  slideItems.forEach((slideItem) => slideItem.remove());
}

function handleScreenSize(carouselId, cardsList) {
  if (windowWidth < 639) {
    reorganizeAndWrapSlides(carouselId, 1);
    console.log("< 639");
  } else if (
    windowWidth > 639 &&
    windowWidth < 959 &&
    carouselId === "minecraft_cdo_activities"
  ) {
    reorganizeAndWrapSlides(carouselId, 2);
    console.log("639 - 959");
  } else if (windowWidth > 959) {
    reorganizeAndWrapSlides(carouselId, cardsList);
    console.log("> 959");
  }
}

$(document).ready(function () {
  let idMinecraftActivities = "#minecraft_cdo_activities";
  handleScreenSize("minecraft_cdo_activities", 3);
  $(idMinecraftActivities + " .slides").carouFredSel({
    auto: false,
    pagination: "#minecraft_cdo_activities-pagination",
    prev: "#prev_1",
    next: "#next_1",
    responsive: true,
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });
  let idInspirationalVideo = "#inspirational_works_collection";
  handleScreenSize("inspirational_works_collection", 2);
  $(idInspirationalVideo + " .slides").carouFredSel({
    auto: false,
    pagination: "#inspirational_works_collection_pagination",
    prev: "#prev_8",
    next: "#next_8",
    responsive: true,
    height: "490",
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });
});

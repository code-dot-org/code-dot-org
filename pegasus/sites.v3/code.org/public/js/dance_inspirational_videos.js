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

  const slideContent = Array.from(
    carouselContainer.querySelectorAll(".slide-content")
  );
  slideContent.forEach((block) => block.remove());

  const slides = [];
  while (slideContent.length > 0) {
    slides.push(slideContent.splice(0, cardsList));
  }

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

function handleScreenSize(carouselId) {
  if (windowWidth > 639 && windowWidth < 799) {
    reorganizeAndWrapSlides(carouselId, 1);
    console.log("639 - 799");
  } else if (windowWidth > 799) {
    reorganizeAndWrapSlides(carouselId, 2);
    console.log("> 800");
  }
}

$(document).ready(function () {
  const howAiWorksVideos = "#dance_party_inspirational_videos";
  handleScreenSize("dance_party_inspirational_videos");
  $(howAiWorksVideos + " .slides").carouFredSel({
    auto: false,
    pagination: "#dance_party_inspirational_videos-pagination",
    prev: "#prev_1",
    next: "#next_1",
    responsive: true,
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });
});

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

  const actionBlocks = Array.from(
    carouselContainer.querySelectorAll(
      ".video-wrapper.video-wrapper--one-col.flex-space-between"
    )
  );
  actionBlocks.forEach((block) => block.remove());

  const slides = [];
  while (actionBlocks.length > 0) {
    slides.push(actionBlocks.splice(0, cardsList));
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
    reorganizeAndWrapSlides(carouselId, 0);
    console.log("639 - 799");
  } else if (windowWidth > 799) {
    reorganizeAndWrapSlides(carouselId, 2);
    console.log("> 800");
  }
}

$(document).ready(function () {
  let idCollections = "#collections_carousel";
  handleScreenSize("collections_carousel");
  $(idCollections + " .slides").carouFredSel({
    auto: false,
    pagination: "#collections_carousel-pagination",
    prev: "#prev_2",
    next: "#next_2",
    responsive: true,
    height: "490",
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });

  let idFlexible = "#flexible_units_carousel";
  handleScreenSize("flexible_units_carousel");
  $(idFlexible + " .slides").carouFredSel({
    auto: false,
    pagination: "#flexible_units_carousel-pagination",
    prev: "#prev_1",
    next: "#next_1",
    responsive: true,
    height: "490",
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });

  let idComputerWorks = "#computer_works_collection";
  handleScreenSize("computer_works_collection");
  $(idComputerWorks + " .slides").carouFredSel({
    auto: false,
    pagination: "#computer_works_collection_pagination",
    prev: "#prev_3",
    next: "#next_3",
    responsive: true,
    height: "490",
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });

  let idInternetWorks = "#internet_works_collection";
  handleScreenSize("internet_works_collection");
  $(idInternetWorks + " .slides").carouFredSel({
    auto: false,
    pagination: "#internet_works_collection_pagination",
    prev: "#prev_4",
    next: "#next_4",
    responsive: true,
    height: "490",
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });

  let idBlockchainWorks = "#blockchain_works_collection";
  handleScreenSize("blockchain_works_collection");
  $(idBlockchainWorks + " .slides").carouFredSel({
    auto: false,
    pagination: "#blockchain_works_collection_pagination",
    prev: "#prev_5",
    next: "#next_5",
    responsive: true,
    height: "490",
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });

  let idNotHacked = "#not_hacked_works_collection";
  handleScreenSize("not_hacked_works_collection");
  $(idNotHacked + " .slides").carouFredSel({
    auto: false,
    pagination: "#not_hacked_works_collection_pagination",
    prev: "#prev_6",
    next: "#next_6",
    responsive: true,
    height: "490",
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });

  let idCsVideo = "#cs_works_collection";
  handleScreenSize("cs_works_collection");
  $(idCsVideo + " .slides").carouFredSel({
    auto: false,
    pagination: "#cs_works_collection_pagination",
    prev: "#prev_7",
    next: "#next_7",
    responsive: true,
    height: "490",
    scroll: 1,
    swipe: {
      onTouch: true,
      onMouse: true,
    },
  });

  let idInspirationalVideo = "#inspirational_works_collection";
  handleScreenSize("inspirational_works_collection");
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

const banners = document.querySelectorAll(".top-skinny-banner");

banners.forEach((banner) => {
  const bannerId = banner.getAttribute("id");
  const closeButton = banner.querySelector("button");

  if (localStorage.getItem(`hideBanner-${bannerId}`) === "true") {
    banner.style.display = "none";
  }

  closeButton.addEventListener("click", () => {
    banner.style.display = "none";
    localStorage.setItem(`hideBanner-${bannerId}`, "true");
  });
});

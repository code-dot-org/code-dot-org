const menuButton = document.querySelector("button.menu-button");
const menuList = document.querySelector("ul.menu-list");

menuButton.onclick = () => {
  if (menuList.style.display !== "none") {
    menuList.style.display = "none";
    menuButton.classList.remove("rotate");
  } else {
    menuList.style.display = "block";
    menuButton.classList.add("rotate");
  }
};

document.body.addEventListener("click", (event) => {
  const pageArea = event.target;
  if (pageArea !== menuButton && pageArea !== menuList) {
    menuList.style.display = "none";
    menuButton.classList.remove("rotate");
  }
});

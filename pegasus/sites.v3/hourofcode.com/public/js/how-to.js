const menuButton = document.querySelector("ul.how-to-nav button.menu-button");
const menuList = document.querySelector("ul.how-to-nav ul.menu-list");

// Dropdown menu in hero banner
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

// Sticky scroller styles on steps section navigation
window.addEventListener("DOMContentLoaded", () => {
  const options = {
    rootMargin: "-10% 0px -90%",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const navLink = document.querySelector(`nav.steps-nav a[href="#${id}"]`);

      if (entry.intersectionRatio > 0) {
        navLink.parentElement.classList.add("active");
      } else {
        navLink.parentElement.classList.remove("active");
      }
    });
  }, options);

  // Track sections
  document.querySelectorAll("div.step[id]").forEach((section) => {
    observer.observe(section);
  });
});

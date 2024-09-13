window.addEventListener("DOMContentLoaded", () => {
  // Add active state styles to guide navigation
  const buttonTeachers = document.querySelector("nav.choose-guide a.teachers");
  const buttonEvents = document.querySelector("nav.choose-guide a.events");
  const pathname = window.location.pathname;

  if (pathname.includes("/how-to/events")) {
    buttonEvents.classList.add("active");
  } else if (pathname.includes("/how-to")) {
    buttonTeachers.classList.add("active");
  }

  // Sticky scroller styles on steps section navigation
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

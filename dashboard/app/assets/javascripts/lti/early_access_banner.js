class LtiEarlyAccessBannerHandler {
  constructor() {
    this.banner = $("#lti-early-access-banner");
    if (this.banner.length) this.init();
  }

  init() {
    const localStorageKey = `lti-eab-${this.banner.data("key")}`;

    if (localStorage[localStorageKey] === "closed") {
      this.banner.hide();
    } else {
      this.banner.show();
      this.handleCodeAppAdjustment();
    }

    // Closes the banner and store the state in localStorage on the close button click.
    this.banner.find(".close").on("click", () => {
      this.banner.hide();
      localStorage.setItem(localStorageKey, "closed");
      this.adjustCodeAppPosition();
    });
  }

  handleCodeAppAdjustment() {
    $("#codeApp").ready(() => {
      // Adds the `.no-mc` class to the close button to prevent overriding the button style.
      this.banner.find(".close").addClass("no-mc");

      this.adjustCodeAppPosition();

      $("#codeApp").each(() => {
        // Adjusts #codeApp position relative to the banner when its class is dynamically changed.
        // For example, the `.pin_bottom` class makes its position absolute, so it overlaps the banner.
        let codeAppObserver = new MutationObserver(() => {
          this.adjustCodeAppPosition();
        });
        codeAppObserver.observe($("#codeApp")[0], {
          attributes: true,
          attributeFilter: ["class"],
        });
      });
    });
  }

  // Adjusts the absolute top position of the #codeApp relative to the banner.
  adjustCodeAppPosition() {
    const codeApp = $("#codeApp");
    if (codeApp.css("position") !== "absolute") return;

    const codeAppStyle = codeApp[0].style;
    codeAppStyle.setProperty("top", null);

    const codeAppTop = parseInt(codeApp.css("top"));
    if (isNaN(codeAppTop)) return;

    const newCodeAppTop = this.banner.is(":visible")
      ? `${codeAppTop + this.banner.outerHeight(true)}px`
      : null;

    codeAppStyle.setProperty("top", newCodeAppTop, "important");
    window.dispatchEvent(new Event("resize"));
  }
}

$("#lti-early-access-banner").ready(() => new LtiEarlyAccessBannerHandler());

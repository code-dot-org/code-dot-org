export default function protectPrivatePage() {
  window.addEventListener('pagehide', () => {
    document.body.hidden = true;
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}

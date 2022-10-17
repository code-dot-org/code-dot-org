const script = document.querySelector('script[data-studio-redirect-url]');
const url = script.dataset['studioRedirectUrl'];
window.location = url;

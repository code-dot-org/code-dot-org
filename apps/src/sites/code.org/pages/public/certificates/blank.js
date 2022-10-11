const script = document.querySelector('script[data-studio-redirect-url]');
window.location = script.dataset['studioRedirectUrl'];

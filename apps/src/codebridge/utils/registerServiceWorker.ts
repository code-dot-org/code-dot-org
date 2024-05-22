const defaultCallback = (registration: ServiceWorkerRegistration) => {};

export const registerServiceWorker = async ({
  install = defaultCallback,
  activate = defaultCallback,
  waiting = defaultCallback,
} = {}) => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/worker.js',
        {
          scope: '/',
        }
      );
      if (registration.installing) {
        install(registration);
        console.log('Service worker installing');
      } else if (registration.waiting) {
        waiting(registration);
        console.log('Service worker installed');
      } else if (registration.active) {
        activate(registration);
        console.log('Service worker active');
      }
      return registration;
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

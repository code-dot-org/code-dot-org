const defaultCallback = (registration: ServiceWorkerRegistration) => {};

export const registerServiceWorker = async ({
  install = defaultCallback,
  activate = defaultCallback,
  waiting = defaultCallback,
} = {}) => {
  console.log(
    'RSW1',
    navigator.serviceWorker,
    'serviceWorker' in navigator,
    navigator
  );
  if ('serviceWorker' in navigator) {
    console.log('GOT IT');
    try {
      const registration = await navigator.serviceWorker.register(
        '/codebridge_service_worker.js',
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

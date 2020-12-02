console.log('this is register-sw file');

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    console.log('=====Found serviceWorker=====');

    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log(
          '=====SW is registered, scope is',
          registration.scope,
          '====='
        );
        console.log(registration);
      })
      .catch(error => console.error(error));
  } else {
    console.log('=====No serviceWorker=====');
  }
});

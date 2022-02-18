self.addEventListener('install', (e) => {
  let hello = 'HI' + Math.random();
  console.log('[Service Worker] Install', hello);
});

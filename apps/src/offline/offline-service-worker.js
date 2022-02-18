import {OfflineServiceWorker} from './offlineServiceWorkerImpl';
const impl = new OfflineServiceWorker();

self.addEventListener('install', impl.install);

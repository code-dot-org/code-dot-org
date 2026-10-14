import '../src/index';
import {VIDEOS} from './videos';

const params = new URLSearchParams(location.search);
const name = params.get('video') ?? 'threeScenes';
const width = params.get('width');

const video = document.createElement('json-video');
video.setAttribute('controls', '');
video.style.width = `${width ?? 640}px`;
video.setAttribute('src', VIDEOS[name] ?? VIDEOS.threeScenes);

document.getElementById('stage')!.append(video);

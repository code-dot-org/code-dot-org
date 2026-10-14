import '../src/index';
import {createCustomControls} from './customControls';
import {VIDEOS} from './videos';

const params = new URLSearchParams(location.search);
const name = params.get('video') ?? 'threeScenes';
const width = params.get('width');
const controls = params.get('controls') ?? 'builtin';

const video = document.createElement('json-video');
video.style.width = `${width ?? 640}px`;
if (controls === 'builtin') video.controls = true;
else video.append(createCustomControls(video));
video.src = VIDEOS[name] ?? VIDEOS.threeScenes;

document.getElementById('stage')!.append(video);

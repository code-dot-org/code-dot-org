import project from '../code-studio/initApp/project';
import {createThumbnail} from '../util/thumbnail';
import {canvasFromImage, canvasToBlob, imageFromURI, svgToDataURI} from '../imageUtils';
import {getStore} from '../redux';

export function captureScreenshot() {
  const {isShareView, isEmbedView} = getStore().getState().pageConstants;
  if (!project.getCurrentId() || !project.isOwner || isShareView || isEmbedView) {
    return;
  }

  const svg = document.getElementById('svgStudio');
  if (!svg) {
    console.warn(`Thumbnail capture failed: svgStudio not found.`);
    return;
  }

  if (!svg.toDataURL) {
    console.warn('Thumbnail capture failed: svg.toDataURL undefined.');
    return;
  }

  svgToDataURI(svg)
    .then(imageFromURI)
    .then(canvasFromImage)
    .then(canvas => createThumbnail(canvas, 180))
    .then(canvasToBlob)
    .then(project.saveThumbnail);
}

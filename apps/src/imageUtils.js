import artistShareFrame from '../static/turtle/blank_sharing_drawing.png';

export function fetchURLAsBlob(url, onComplete) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = e => {
    if (e.target.status === 200) {
      onComplete(null, e.target.response);
    } else {
      onComplete(
        new Error(`URL ${url} responded with code ${e.target.status}`)
      );
    }
  };
  xhr.onerror = e =>
    onComplete(
      new Error(
        `Error ${e.target.status} occurred while receiving the document.`
      )
    );
  xhr.send();
}

export function blobToDataURI(blob, onComplete) {
  let fileReader = new FileReader();
  fileReader.onload = e => onComplete(e.target.result);
  fileReader.readAsDataURL(blob);
}

export function dataURIToSourceSize(dataURI) {
  return imageFromURI(dataURI).then(image => ({
    x: image.width,
    y: image.height
  }));
}

export async function dataURIFromURI(uri) {
  const canvas = await toCanvas(uri);
  return canvas.toDataURL();
}

export function URIFromImageData(imageData) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

export function dataURIToFramedBlob(dataURI, callback) {
  const frame = new Image();
  const imageData = new Image();
  imageData.src = dataURI;
  frame.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(frame, 0, 0);
    ctx.drawImage(imageData, 175, 52, 154, 154);
    if (canvas.toBlob) {
      canvas.toBlob(callback);
    }
  };
  frame.src = artistShareFrame;
}

export function imageFromURI(uri) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve(image);
    image.onerror = err => reject(err);
    image.src = uri;
  });
}

export function svgToDataURI(svg, imageType = 'image/png', options = {}) {
  return new Promise(resolve => {
    // Use lazy-loading to keep canvg (60KB) out of the initial download.
    import('./util/svgelement-polyfill').then(() => {
      svg.toDataURL(imageType, {...options, callback: resolve});
    });
  });
}

export function canvasToBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(resolve);
  });
}

export async function dataURIToBlob(uri) {
  const canvas = await toCanvas(uri);
  return await canvasToBlob(canvas);
}

/**
 * Given an input of a supported type, converts it to an HTMLCanvasElement.
 *
 * @param {string|HTMLImageElement|HTMLCanvasElement} input
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function toCanvas(input) {
  if (input instanceof HTMLCanvasElement) {
    return input;
  }

  let image;
  if (input instanceof HTMLImageElement) {
    image = input;
  } else if (typeof input === 'string') {
    image = await imageFromURI(input);
  } else {
    throw new Error('Unable to convert input to canvas');
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  return canvas;
}

/**
 * Given an input of a supported type, converts it to an ImageData object.
 *
 * @param {string|HTMLImageElement|HTMLCanvasElement|ImageData} input
 * @returns {Promise<ImageData>}
 */
export async function toImageData(input) {
  if (input instanceof ImageData) {
    return input;
  }

  try {
    const canvas = await toCanvas(input);
    return canvas
      .getContext('2d')
      .getImageData(0, 0, canvas.width, canvas.height);
  } catch (err) {
    throw new Error('Unable to convert input to ImageData');
  }
}

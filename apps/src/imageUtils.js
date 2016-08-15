export function fetchUrlAsBlob(url, onComplete) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = e => {
    if (e.target.status === 200) {
      onComplete(null, e.target.response);
    } else {
      onComplete(new Error(`URL ${url} responded with code ${e.target.status}`));
    }
  };
  xhr.onerror = e => onComplete(new Error(`Error ${e.target.status} occurred while receiving the document.`));
  xhr.send();
}

export function blobToDataURI(blob, onComplete) {
  let fileReader = new FileReader();
  fileReader.onload = e => onComplete(e.target.result);
  fileReader.readAsDataURL(blob);
}

export function dataURIToSourceSize(dataURI) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve({x: image.width, y: image.height});
    image.onerror = err => reject(err);
    image.src = dataURI;
  });
}

export function imageDataFromSourceUrl(url, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    callback(data);
  };
  img.src = url;
}

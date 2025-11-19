import HttpClient from '@cdo/apps/util/HttpClient';

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, mimeType);
  });
}

export async function uploadBase64ToUrl(
  dataUrl: string,
  uploadUrl: string,
  mimeType: string
): Promise<Response> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();

  // Create a canvas and draw the image onto it
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const context = canvas.getContext('2d');
  context?.drawImage(img, 0, 0);

  const blob = await canvasToBlob(canvas, mimeType);

  const file = new File([blob], 'file', {
    type: mimeType,
  });

  return await HttpClient.put(uploadUrl, file);
}

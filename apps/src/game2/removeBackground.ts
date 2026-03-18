/**
 * Remove the background from an image by flood-filling from the top-left
 * corner. Any pixel connected to (0,0) whose color is within `threshold`
 * of the top-left pixel's color is made transparent.
 *
 * @param blob  The source image as a Blob.
 * @param threshold  Max per-channel distance to still count as "same color" (0–255). Default 30.
 * @returns A new PNG Blob with the background removed.
 */
export async function removeBackground(
  blob: Blob,
  threshold = 30
): Promise<Blob> {
  const img = await loadImage(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const {data, width, height} = imageData;

  // Reference color from (0, 0).
  const refR = data[0];
  const refG = data[1];
  const refB = data[2];

  // Visited bitmap.
  const visited = new Uint8Array(width * height);

  // BFS flood fill from (0, 0).
  const queue: number[] = [0]; // pixel indices
  visited[0] = 1;

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const px = idx * 4;
    const r = data[px];
    const g = data[px + 1];
    const b = data[px + 2];

    if (
      Math.abs(r - refR) <= threshold &&
      Math.abs(g - refG) <= threshold &&
      Math.abs(b - refB) <= threshold
    ) {
      // Make transparent.
      data[px + 3] = 0;

      // Enqueue neighbors.
      const x = idx % width;
      const y = (idx - x) / width;

      if (x > 0 && !visited[idx - 1]) {
        visited[idx - 1] = 1;
        queue.push(idx - 1);
      }
      if (x < width - 1 && !visited[idx + 1]) {
        visited[idx + 1] = 1;
        queue.push(idx + 1);
      }
      if (y > 0 && !visited[idx - width]) {
        visited[idx - width] = 1;
        queue.push(idx - width);
      }
      if (y < height - 1 && !visited[idx + width]) {
        visited[idx + width] = 1;
        queue.push(idx + width);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(result => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

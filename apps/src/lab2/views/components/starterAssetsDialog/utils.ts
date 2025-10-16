import {PDFDocument} from 'pdf-lib';

export async function getImageDimensions(file: File) {
  return new Promise<{width: number; height: number}>((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      resolve({width: img.width, height: img.height});
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

export async function getPageCount(url: string | File) {
  try {
    const pdfData =
      url instanceof File
        ? await url.arrayBuffer()
        : await fetch(url).then(res => res.arrayBuffer());
    const pdf = await PDFDocument.load(pdfData);
    return pdf.getPageCount();
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
}

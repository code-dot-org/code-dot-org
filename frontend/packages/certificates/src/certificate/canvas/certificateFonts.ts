import '@fontsource/noto-serif/700.css';
import {useEffect, useState} from 'react';

const CERTIFICATE_FONT_SPEC = '700 68px "Noto Serif"';

export async function loadCertificateFont(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) {
    return;
  }

  await document.fonts.load(CERTIFICATE_FONT_SPEC);
}

export function useCertificateFontReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    void loadCertificateFont()
      .catch(() => undefined)
      .then(() => {
        if (!isCancelled) {
          setIsReady(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return isReady;
}

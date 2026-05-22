/**
 * ArtifactQR — renders a QR code for the encoded artifact URL.
 *
 * Generates the QR code asynchronously via the qrcode package.
 * Shows a hint when the encoded payload is large enough that the QR code
 * may be too dense to scan reliably.
 */

import {useState, useEffect} from 'react';
import QRCode from 'qrcode';
import {Box, CircularProgress, Typography} from '@mui/material';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Base URL for the notebook artifact viewer on studio.code.org. */
const ARTIFACT_BASE_URL = 'https://studio.code.org/app/projects/notebook/artifact';

/**
 * Encoded payload length above which the QR code density warrants a warning.
 * Dense QR codes can be difficult to scan from a phone camera.
 */
const QR_LARGE_THRESHOLD = 1500;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for ArtifactQR. */
export interface ArtifactQRProps {
  /** Encoded artifact string produced by encodeArtifact. */
  encoded: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a QR code image pointing to the full artifact URL.
 *
 * The QR code is generated asynchronously; a spinner is shown during
 * generation.  When the encoded payload exceeds the density threshold, a
 * hint to print to PDF instead is displayed below the image.
 */
export function ArtifactQR({encoded}: ArtifactQRProps): React.ReactElement {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const artifactUrl = `${ARTIFACT_BASE_URL}#artifact=${encoded}`;
  const isLarge = encoded.length > QR_LARGE_THRESHOLD;

  useEffect(() => {
    let cancelled = false;

    async function generateQr(): Promise<void> {
      const url = await QRCode.toDataURL(artifactUrl, {errorCorrectionLevel: 'L'});
      if (!cancelled) {
        setDataUrl(url);
      }
    }

    void generateQr();

    return () => {
      cancelled = true;
    };
  }, [artifactUrl]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1}}>
      {dataUrl === null ? (
        <CircularProgress size={120} />
      ) : (
        <img src={dataUrl} alt="QR code for notebook artifact" style={{width: 180, height: 180}} />
      )}

      {isLarge && (
        <Typography variant="caption" color="text.secondary" align="center">
          QR is large — print to PDF instead
        </Typography>
      )}
    </Box>
  );
}

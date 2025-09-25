interface OneTrust {
  OnConsentChanged: (callback: () => void) => void;
  IsAlertBoxClosedAndValid: () => boolean;
  ToggleInfoDisplay: () => void;
}

declare global {
  interface Window {
    oneTrustPromise: Promise<OneTrust> | undefined;
    OneTrust: OneTrust | undefined;
    OnetrustActiveGroups: string | undefined;
  }
}

export {};

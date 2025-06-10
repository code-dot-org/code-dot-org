interface OneTrust {
  OnConsentChanged: (callback: () => void) => void;
}

declare global {
  interface Window {
    oneTrustPromise: Promise<OneTrust> | undefined;
    OneTrust: OneTrust | undefined;
    OnetrustActiveGroups: string | undefined;
  }
}

export {};

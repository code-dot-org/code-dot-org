declare module '@cdo/apps/util/experiments' {
  export interface StoredExperiment {
    key: string;
    expiration?: number;
  }

  const experiments: {
    isEnabled: (key: string) => boolean;
    isEnabledAllowingQueryString: (key: string) => boolean;
    getEnabledExperiments: () => string[];
    getLocalStorageExperimentDetails: () => StoredExperiment[];
    setEnabled: (
      key: string,
      shouldEnable: boolean,
      expiration?: number
    ) => void;

    // All other properties are experiment constants, probably
    [key: string]: string;
  };

  export default experiments;
}

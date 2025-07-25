declare module '@cdo/apps/util/experiments' {
  const experiments: {
    isEnabled: (key: string) => boolean;
    isEnabledAllowingQueryString: (key: string) => boolean;

    // All other properties are experiment constants, probably
    [key: string]: string;
  };

  export default experiments;
}

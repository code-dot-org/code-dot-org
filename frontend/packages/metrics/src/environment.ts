enum Environments {
  production = 'production',
  levelbuilder = 'levelbuilder',
  test = 'test',
  staging = 'staging',
  adhoc = 'adhoc',
  development = 'development',
  unknown = 'unknown',
};

export const currentLocation = () => {
  return typeof window !== 'undefined' ? window.location : undefined;
}

export const getEnvironment: () => Environments = () => {
  const hostname = currentLocation()?.hostname || '';
  if (hostname.includes('adhoc')) {
    // As adhoc hostnames may include other keywords, check it first.
    return Environments.adhoc;
  }
  if (hostname.includes('test')) {
    return Environments.test;
  }
  if (hostname.includes('levelbuilder')) {
    return Environments.levelbuilder;
  }
  if (hostname.includes('staging')) {
    return Environments.staging;
  }
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return Environments.development;
  }
  if (
    hostname === 'code.org' ||
    hostname === 'studio.code.org' ||
    hostname === 'hourofcode.com'
  ) {
    return Environments.production;
  }
  return Environments.unknown;
}

export const isDevelopmentEnvironment = () => {
  return getEnvironment() === Environments.development;
}

export const isStagingEnvironment = () => {
  return getEnvironment() === Environments.staging;
}

export const isTestEnvironment = () => {
  return getEnvironment() === Environments.test;
}

export const isLevelbuilderEnvironment = () => {
  return getEnvironment() === Environments.levelbuilder;
}

export const isProductionEnvironment = () => {
  return getEnvironment() === Environments.production;
}

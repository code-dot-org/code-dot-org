export enum Brand {
  CODE_DOT_ORG = 'Code.org',
  HOUR_OF_CODE = 'Hour of Code',
}

export function getBrandFromHostname(hostname: string | null) {
  switch (hostname) {
    case 'localhost.hourofcode.com:3001':
    case 'hourofcode.com:3001':
      return Brand.HOUR_OF_CODE;
    default:
      return Brand.CODE_DOT_ORG;
  }
}

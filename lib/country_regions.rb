# Latin America (Latam)
# Based on http://lanic.utexas.edu/subject/countries/
# Split into ES (Spanish speaking) and PT (Portuguese speaking) lists:
LATAM_ES_COUNTRY_CODE_TO_NAME = {
  ag: 'Antigua and Barbuda',
  ar: 'Argentina',
  aw: 'Aruba',
  bs: 'Bahamas',
  bb: 'Barbados',
  bz: 'Belize',
  bo: 'Bolivia',
  ky: 'Cayman Islands',
  cl: 'Chile',
  co: 'Colombia',
  cr: 'Costa Rica',
  cu: 'Cuba',
  dm: 'Dominica',
  do: 'Dominican Republic',
  ec: 'Ecuador',
  sv: 'El Salvador',
  gf: 'French Guiana',
  gd: 'Grenada',
  gp: 'Guadeloupe',
  gt: 'Guatemala',
  gy: 'Guyana',
  ht: 'Haiti',
  hn: 'Honduras',
  jm: 'Jamaica',
  mq: 'Martinique',
  mx: 'Mexico',
  ni: 'Nicaragua',
  pa: 'Panama',
  py: 'Paraguay',
  pe: 'Peru',
  pr: 'Puerto Rico',
  bl: 'Saint Barthélemy',
  kn: 'Saint Kitts and Nevis',
  lc: 'Saint Lucia',
  vc: 'Saint Vincent and the Grenadines',
  sr: 'Suriname',
  tt: 'Trinidad and Tobago',
  tc: 'Turks and Caicos Islands',
  uy: 'Uruguay',
  ve: 'Venezuela',
  vg: 'Virgin Islands, British',
  vi: 'Virgin Islands, U.S.'
}.freeze
LATAM_ES_COUNTRY_CODES = LATAM_ES_COUNTRY_CODE_TO_NAME.keys.map(&:to_s).map(&:upcase).freeze
LATAM_ES_COUNTRY_NAMES = LATAM_ES_COUNTRY_CODE_TO_NAME.values.freeze

LATAM_PT_COUNTRY_CODE_TO_NAME = {
  br: 'Brazil'
}.freeze
LATAM_PT_COUNTRY_CODES = LATAM_PT_COUNTRY_CODE_TO_NAME.keys.map(&:to_s).map(&:upcase).freeze
LATAM_PT_COUNTRY_NAMES = LATAM_PT_COUNTRY_CODE_TO_NAME.values.freeze

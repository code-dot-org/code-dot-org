# Returns abbr as an uppercase symbol, stripping whitespace.
def get_uppercase_symbol(abbr)
  return abbr.to_s.strip.upcase.to_sym
end

# Returns the state name associated with the state abbreviation abbr.
# abbr: A two character (uppercase or lowercase) symbol or string.
# include_dc: (default: false) Whether to include Washington DC as a state.
def get_us_state_from_abbr(abbr, include_dc = false)
  abbr = get_uppercase_symbol(abbr)
  return include_dc ? STATE_ABBR_WITH_DC_HASH[abbr] : STATE_ABBR_HASH[abbr]
end

# Returns whether the abbreviation is a state (including Washington DC)
# abbreviation.
def us_state_abbr?(abbr, include_dc = false)
  return !get_us_state_from_abbr(abbr, include_dc).nil?
end

STATE_ABBR_HASH = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
}

STATE_ABBR_WITH_DC_HASH = STATE_ABBR_HASH.merge({DC: 'Washington DC'})

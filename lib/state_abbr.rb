require 'active_support/core_ext/string/inflections'
require 'active_support/core_ext/object'

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

# Returns the abbreviation for the supplied state name
# @param [String|Symbol] name - full state name, e.g. "Washington"
# @param [Boolean] include_dc - (default: false) Whether to include Washington DC as a state.
# @returns [String] state abbreviation, or nil
def get_us_state_abbr_from_name(name, include_dc = false)
  titleized_name = name.to_s.strip.titleize

  # special case for DC
  titleized_name = 'Washington DC' if titleized_name == 'Washington Dc'

  abbr_sym = include_dc ? STATE_ABBR_WITH_DC_HASH.key(titleized_name) : STATE_ABBR_HASH.key(titleized_name)
  return abbr_sym.try(&:to_s)
end

# Given a state name or abbreviation, resolves to a two-letter state abbreviation.
# @param [String|Symbol] name_or_abbr - full state name or state abbreviation
# @param [Boolean] include_dc - (default: false) Whether to include Washington DC as a state.
# @returns [String] two-letter state abbreviation, or nil
def get_us_state_abbr(name_or_abbr, include_dc = false)
  name = get_us_state_from_abbr(name_or_abbr, include_dc) || name_or_abbr
  get_us_state_abbr_from_name name, include_dc
end

# Returns whether the abbreviation is a state (including Washington DC)
# abbreviation.
def us_state_abbr?(abbr, include_dc = false)
  return !get_us_state_from_abbr(abbr, include_dc).nil?
end

# Returns the entire list of states (including Washington DC)
def get_all_states_with_dc
  return STATE_ABBR_WITH_DC_HASH.sort_by {|_code, name| name}
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
}.freeze

STATE_ABBR_WITH_DC_HASH = STATE_ABBR_HASH.merge({DC: 'Washington DC'})

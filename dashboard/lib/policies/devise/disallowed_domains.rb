class Policies::Devise::DisallowedDomains
  DISALLOWED_DOMAINS = [
    'mymail.lausd.net',
    'lausd.net',
    'lausd.org',
  ].freeze
end

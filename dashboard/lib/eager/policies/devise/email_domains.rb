class Policies::Devise::EmailDomains
  DISALLOWED_DOMAINS = [
    'mymail.lausd.net',
    'lausd.net',
  ].freeze
end

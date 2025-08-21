class Policies::Devise::DisallowedDomains
  # TODO: consider using a regex to match subdomains
  DISALLOWED_DOMAINS = [
    'mymail.lausd.net',
    'lausd.net',
  ].freeze
end

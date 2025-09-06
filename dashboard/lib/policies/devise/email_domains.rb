class Policies::Devise::EmailDomains
  DISALLOWED_DOMAINS = [
    'mymail.lausd.net',
    'lausd.net',
  ].freeze

  # Providers that are allowed to create logins even for
  # email addresses on the DISALLOWED_DOMAINS list
  PROVIDER_EXCEPTIONS = [
    'clever'
  ].freeze
end

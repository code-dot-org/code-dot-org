class Policies::Devise::EmailDomains
  DISALLOWED_DOMAINS = {
    'mymail.lausd.net' => {
      provider_exceptions: [
        AuthenticationOption::CLEVER,
      ]
    },
    'lausd.net' => {
      provider_exceptions: [
        AuthenticationOption::CLEVER,
      ]
    },
  }.freeze

  # Check if a provider is allowed to create logins for a blocked domain
  # TODO: refactor this into district-level configuration
  # @param domain [String] The email domain to check
  # @param provider [String] The authentication provider
  def self.disallowed_login?(domain:, provider:)
    DISALLOWED_DOMAINS.key?(domain) && DISALLOWED_DOMAINS[domain][:provider_exceptions].exclude?(provider)
  end
end

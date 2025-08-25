class Policies::Devise::EmailDomains
  def self.disallowed_domains
    [
      'mymail.lausd.net',
      'lausd.net',
    ].freeze
  end
end

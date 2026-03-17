# Temporary cookie rotator to facilitate updating the digest class for key
# generators from SHA1 (the Rails 6.1 default) to SHA256 (the Rails 7.0
# default). Will read cookies from either the new or the old format, while
# consistently writing out to the new format.
#
# TODO infra: remove this after 40 days in production (as determined by
# CDO.dashboard_session_ttl_days)
#
# Based on instructions at
# https://guides.rubyonrails.org/v7.0/upgrading_ruby_on_rails.html#key-generator-digest-class-changing-to-use-sha256
# and
# https://guides.rubyonrails.org/v7.0/security.html#rotating-encrypted-and-signed-cookies-configurations
#
# See dashboard/config/initializers/new_framework_defaults_7_0.rb for more context
Rails.application.config.after_initialize do
  Rails.application.config.action_dispatch.cookies_rotations.tap do |cookies|
    cookies.rotate :encrypted, digest: OpenSSL::Digest::SHA1
    cookies.rotate :signed, digest: OpenSSL::Digest::SHA1
  end
end

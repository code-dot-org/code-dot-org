module User::ProviderFlags
  extend ActiveSupport::Concern

  included do
    PROVIDER_MANUAL = 'manual'.freeze # "old" user created by a teacher -- logs in w/ username + password
    PROVIDER_SPONSORED = 'sponsored'.freeze # "new" user created by a teacher -- logs in w/ name + secret picture/word
    PROVIDER_MIGRATED = 'migrated'.freeze
  end

  def migrated?
    provider == PROVIDER_MIGRATED
  end

  def manual?
    provider == PROVIDER_MANUAL
  end

  def sponsored?
    if migrated?
      authentication_options.empty? && encrypted_password.blank?
    else
      provider == PROVIDER_SPONSORED
    end
  end
end
